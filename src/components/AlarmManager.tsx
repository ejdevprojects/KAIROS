import React, { useState } from 'react';
import { StudyAlarm, AlarmTone } from '../types';
import { playToneOnce, playSoftClick } from '../utils/audio';
import {
  showBrowserNotification,
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '../utils/notifications';
import {
  Bell,
  Volume2,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';

interface AlarmManagerProps {
  alarms: StudyAlarm[];
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  onAddAlarm: (alarm: Omit<StudyAlarm, 'id'>) => void;
  volume: number;
  setVolume: (val: number) => void;
  defaultTone: AlarmTone;
  setDefaultTone: (tone: AlarmTone) => void;
}

export const AlarmManager: React.FC<AlarmManagerProps> = ({
  alarms,
  onToggleAlarm,
  onDeleteAlarm,
  onAddAlarm,
  volume,
  setVolume,
  defaultTone,
  setDefaultTone,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:30');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [tone, setTone] = useState<AlarmTone>('bell');
  const [note, setNote] = useState('');
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    playSoftClick();
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddAlarm({
      title: title.trim(),
      time,
      days: selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      tone,
      type: 'daily_routine',
      note: note.trim() || undefined,
    });

    setTitle('');
    setNote('');
    setShowAddModal(false);
  };

  const handleTestNotification = async () => {
    playSoftClick();
    const status = getNotificationPermissionStatus();
    if (status !== 'granted') {
      const newStatus = await requestNotificationPermission();
      if (newStatus !== 'granted') {
        setTestNotificationFeedback('Browser notification permission was not granted. In-app alarms will still ring.');
        setTimeout(() => setTestNotificationFeedback(null), 4000);
        return;
      }
    }

    const dispatched = showBrowserNotification('KAIROS Alarm Test', {
      body: 'Browser notifications are synchronized. You will receive audible alerts and prompts.',
    });

    if (dispatched) {
      setTestNotificationFeedback('Test notification sent successfully!');
    } else {
      setTestNotificationFeedback('Notification displayed (in-app fallback triggered).');
    }
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  const alarmTonesList: { id: AlarmTone; name: string; description: string }[] = [
    { id: 'bell', name: 'Chrono Bell', description: 'Harmonic sine bell with exponential decay' },
    { id: 'digital', name: 'Digital Wristwatch', description: 'Sharp high-frequency double beep pulse' },
    { id: 'gong', name: 'Zen Focus Gong', description: 'Low resonant acoustic gong with 3-second sustain' },
    { id: 'radar', name: 'Urgent Sonar Pulse', description: 'Rapid dual-pitch frequency sweep' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Alarms, Reminders & Audio Notifications
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Real-time audible synthesis and browser notifications for study routines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestNotification}
            className="px-3.5 py-2 border border-neutral-700 hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Test Desktop Notification</span>
          </button>

          <button
            onClick={() => {
              playSoftClick();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold tracking-tight transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Alarm</span>
          </button>
        </div>
      </div>

      {testNotificationFeedback && (
        <div className="p-3 border border-white bg-neutral-900 text-xs font-mono text-neutral-200 animate-in fade-in">
          {testNotificationFeedback}
        </div>
      )}

      {/* Tone Synthesizer Lab & Volume Controls */}
      <div className="border border-neutral-800 bg-neutral-900/30 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
              Web Audio Synthesizer Controls
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Audible alarms generate directly in your browser without external audio dependencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-neutral-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
              }}
              className="w-32 accent-white cursor-pointer"
            />
            <span className="text-xs font-mono text-neutral-400 w-10 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Tone Soundboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {alarmTonesList.map((item) => (
            <div
              key={item.id}
              className={`p-4 border transition-colors flex flex-col justify-between ${
                defaultTone === item.id
                  ? 'border-white bg-neutral-950'
                  : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs font-mono uppercase">
                    {item.name}
                  </span>
                  {defaultTone === item.id && (
                    <span className="text-[10px] font-mono text-neutral-400 border border-neutral-700 px-1.5">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 font-sans leading-snug">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => playToneOnce(item.id, volume)}
                  className="flex-1 py-1 px-2 border border-neutral-700 hover:border-white text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSoftClick();
                    setDefaultTone(item.id);
                  }}
                  className={`py-1 px-2 border text-xs font-mono transition-colors cursor-pointer ${
                    defaultTone === item.id
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 font-mono">
            Active Study Alarms & Reminders
          </h3>
          <span className="text-xs font-mono text-neutral-500">
            {alarms.filter((a) => a.enabled).length} Armed
          </span>
        </div>

        <div className="space-y-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`p-4 border transition-all ${
                alarm.enabled
                  ? 'border-neutral-700 bg-neutral-900/40'
                  : 'border-neutral-900 bg-neutral-950/40 opacity-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      {alarm.time}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 uppercase">
                      · Tone: {alarm.tone}
                    </span>
                  </div>

                  <div className="font-semibold text-sm text-neutral-200">
                    {alarm.title}
                  </div>

                  {alarm.note && (
                    <p className="text-xs text-neutral-400 font-sans">
                      {alarm.note}
                    </p>
                  )}

                  {/* Days pills (text with separator discipline) */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 pt-1">
                    <span>Active on:</span>
                    {daysLabels.map((d, i) => (
                      <span
                        key={d}
                        className={
                          alarm.days.includes(i) ? 'text-neutral-200 font-bold' : 'text-neutral-700'
                        }
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playToneOnce(alarm.tone, volume)}
                    className="p-2 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Test Tone"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      playSoftClick();
                      onToggleAlarm(alarm.id);
                    }}
                    className={`px-4 py-2 text-xs font-mono font-bold tracking-tight border transition-colors cursor-pointer ${
                      alarm.enabled
                        ? 'bg-white text-black border-white'
                        : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {alarm.enabled ? 'ARMED' : 'OFF'}
                  </button>

                  <button
                    onClick={() => {
                      playSoftClick();
                      onDeleteAlarm(alarm.id);
                    }}
                    className="p-2 border border-transparent hover:border-neutral-800 text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
                    title="Delete Alarm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {alarms.length === 0 && (
            <div className="border border-neutral-800 bg-neutral-950 p-8 text-center text-xs font-mono text-neutral-500">
              No alarms configured. Add an alarm to schedule your study routines.
            </div>
          )}
        </div>
      </div>

      {/* Add Alarm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md border-2 border-white bg-neutral-950 p-6 text-neutral-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-white">
                Create Study Alarm
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-white text-xs font-mono cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            <form onSubmit={handleCreateAlarm} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                  Alarm Title / Routine
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Problem Set Drill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Alarm Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Sound Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => {
                      const t = e.target.value as AlarmTone;
                      setTone(t);
                      playToneOnce(t, volume);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="bell">Chrono Bell</option>
                    <option value="digital">Digital Wristwatch</option>
                    <option value="gong">Zen Gong</option>
                    <option value="radar">Urgent Sonar</option>
                  </select>
                </div>
              </div>

              {/* Day Selector */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5">
                  Repeat Days
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {daysLabels.map((day, idx) => {
                    const active = selectedDays.includes(idx);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`py-1.5 text-xs font-mono text-center border transition-colors cursor-pointer ${
                          active
                            ? 'bg-white text-black border-white font-bold'
                            : 'border-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                  Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Put phone in another room, open textbook"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-bold text-xs font-mono hover:bg-neutral-200"
                >
                  Arm Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
