import React, { useState, useEffect, useRef } from 'react';
import { Task, Subject, AlarmTone } from '../types';
import { playToneOnce, playSoftClick } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle,
  SkipForward,
  Settings2,
  BookOpen,
} from 'lucide-react';

interface FocusTimerProps {
  tasks: Task[];
  subjects: Subject[];
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  onTimerComplete: (durationMinutes: number, task: Task | null) => void;
  defaultAlarmTone: AlarmTone;
  volume: number;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  tasks,
  subjects,
  selectedTask,
  setSelectedTask,
  onTimerComplete,
  defaultAlarmTone,
  volume,
}) => {
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [alarmTone, setAlarmTone] = useState<AlarmTone>(defaultAlarmTone);
  const [completedSessionsToday, setCompletedSessionsToday] = useState<number>(3);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('25');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const initialTotalSecondsRef = useRef<number>(25 * 60);

  // Sync if selectedTask changes from recommendation
  useEffect(() => {
    if (selectedTask && !isRunning) {
      const mins = Math.min(selectedTask.estimatedMinutes, 60);
      setDurationMinutes(mins);
      setSecondsLeft(mins * 60);
      initialTotalSecondsRef.current = mins * 60;
      setMode('focus');
    }
  }, [selectedTask]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (interval) clearInterval(interval);

            // Trigger completion callback
            const sessionMins = Math.round(initialTotalSecondsRef.current / 60);
            if (mode === 'focus') {
              setCompletedSessionsToday((c) => c + 1);
            }
            onTimerComplete(sessionMins, mode === 'focus' ? selectedTask : null);

            // Reset for next mode
            if (mode === 'focus') {
              setMode('short_break');
              initialTotalSecondsRef.current = 5 * 60;
              return 5 * 60;
            } else {
              setMode('focus');
              initialTotalSecondsRef.current = 25 * 60;
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, selectedTask, onTimerComplete]);

  const switchMode = (newMode: 'focus' | 'short_break' | 'long_break', mins: number) => {
    playSoftClick();
    setIsRunning(false);
    setMode(newMode);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
    initialTotalSecondsRef.current = mins * 60;
  };

  const handleToggleTimer = () => {
    playSoftClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playSoftClick();
    setIsRunning(false);
    setSecondsLeft(initialTotalSecondsRef.current);
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutesInput, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      switchMode('focus', val);
      setShowSettings(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Progress percentage
  const totalSecs = initialTotalSecondsRef.current || 1;
  const progressFraction = Math.max(0, Math.min(1, 1 - secondsLeft / totalSecs));
  const strokeDashoffset = 2 * Math.PI * 135 * (1 - progressFraction);

  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Mode Segmented Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-1 p-1 border border-neutral-800 bg-neutral-900/50">
          <button
            onClick={() => switchMode('focus', 25)}
            className={`px-4 py-1.5 text-xs font-mono tracking-tight transition-colors cursor-pointer ${
              mode === 'focus'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Deep Focus (25m)
          </button>
          <button
            onClick={() => switchMode('short_break', 5)}
            className={`px-4 py-1.5 text-xs font-mono tracking-tight transition-colors cursor-pointer ${
              mode === 'short_break'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => switchMode('long_break', 15)}
            className={`px-4 py-1.5 text-xs font-mono tracking-tight transition-colors cursor-pointer ${
              mode === 'long_break'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        <button
          onClick={() => {
            playSoftClick();
            setShowSettings(!showSettings);
          }}
          className="p-2 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
          title="Timer Configuration & Custom Duration"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Duration & Alarm Settings Drawer */}
      {showSettings && (
        <div className="border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 animate-in fade-in duration-150">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Custom Focus Settings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form onSubmit={handleApplyCustomMinutes} className="flex gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                placeholder="Duration in mins"
                className="w-24 bg-neutral-950 border border-neutral-700 px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-mono bg-white text-black font-semibold hover:bg-neutral-200 cursor-pointer"
              >
                Set Minutes
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">Alarm Tone:</span>
              <select
                value={alarmTone}
                onChange={(e) => {
                  const t = e.target.value as AlarmTone;
                  setAlarmTone(t);
                  playToneOnce(t, volume);
                }}
                className="bg-neutral-950 border border-neutral-700 text-xs font-mono text-white px-2 py-1 focus:outline-none"
              >
                <option value="bell">Chrono Bell (Harmonic)</option>
                <option value="digital">Digital Wristwatch</option>
                <option value="gong">Zen Focus Gong</option>
                <option value="radar">Urgent Sonar Pulse</option>
              </select>
              <button
                type="button"
                onClick={() => playToneOnce(alarmTone, volume)}
                className="p-1 border border-neutral-700 text-neutral-300 hover:text-white"
                title="Test Alarm Tone"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Task Lockup */}
      <div className="border border-neutral-800 bg-neutral-900/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-neutral-400" />
          <div className="text-xs font-mono text-neutral-400">Target Study Topic:</div>
          <div className="font-semibold text-white text-sm truncate max-w-md">
            {selectedTask ? selectedTask.title : 'Unassigned Deep Study'}
          </div>
        </div>

        {/* Task Selector Dropdown */}
        <select
          value={selectedTask?.id || ''}
          onChange={(e) => {
            playSoftClick();
            const found = tasks.find((t) => t.id === e.target.value) || null;
            setSelectedTask(found);
          }}
          className="bg-neutral-950 border border-neutral-700 text-xs font-mono text-neutral-300 px-3 py-1.5 focus:outline-none focus:border-white"
        >
          <option value="">-- Choose From Curriculum --</option>
          {pendingTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.estimatedMinutes}m)
            </option>
          ))}
        </select>
      </div>

      {/* Big Circular Clock & Dial Display */}
      <div className="flex flex-col items-center justify-center py-6 sm:py-10 relative">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* SVG Countdown Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
            {/* Background Ring */}
            <circle
              cx="150"
              cy="150"
              r="135"
              className="text-neutral-900"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="150"
              cy="150"
              r="135"
              className="text-white transition-all duration-300"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="square"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Readout */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-500 mb-1">
              {mode === 'focus' ? 'Focus Session' : 'Rest Interval'}
            </span>
            <div className="text-5xl sm:text-6xl font-bold font-mono text-white tabular-nums tracking-tighter">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-xs font-mono text-neutral-400 mt-2">
              Alarm: <span className="text-neutral-200 capitalize">{alarmTone}</span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={handleToggleTimer}
            className={`py-3.5 px-8 text-sm font-bold font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-2 border ${
              isRunning
                ? 'bg-neutral-900 border-neutral-700 text-white hover:border-white'
                : 'bg-white border-white text-black hover:bg-neutral-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START FOCUS</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Countdown"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playSoftClick();
              // Trigger early alarm test or completion
              setIsRunning(false);
              onTimerComplete(Math.round(initialTotalSecondsRef.current / 60), selectedTask);
            }}
            className="p-3.5 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Trigger End & Test Alarm Sound"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Session Counter */}
        <div className="mt-8 flex items-center gap-4 text-xs font-mono text-neutral-500">
          <span>Today&apos;s Focus Blocks:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-3.5 h-3.5 border flex items-center justify-center text-[9px] ${
                  i <= completedSessionsToday
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-neutral-800 text-neutral-700'
                }`}
              >
                {i}
              </span>
            ))}
          </div>
          <span>·</span>
          <span>Target: 4 sessions</span>
        </div>
      </div>
    </div>
  );
};
