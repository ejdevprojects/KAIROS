import React from 'react';
import { BellRing, VolumeX, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import { stopAlarm } from '../utils/audio';

export interface ActiveAlarmPayload {
  title: string;
  source: 'timer_complete' | 'scheduled_alarm' | 'break_end';
  taskTitle?: string;
  subjectCode?: string;
  durationMinutes?: number;
  taskId?: string;
}

interface AlarmAlertModalProps {
  alarm: ActiveAlarmPayload | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onLogCompleted: (payload: ActiveAlarmPayload) => void;
}

export const AlarmAlertModal: React.FC<AlarmAlertModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
  onLogCompleted,
}) => {
  if (!alarm) return null;

  const handleDismiss = () => {
    stopAlarm();
    onDismiss();
  };

  const handleSnooze = (mins: number) => {
    stopAlarm();
    onSnooze(mins);
  };

  const handleLogAndClose = () => {
    stopAlarm();
    onLogCompleted(alarm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg border-2 border-white bg-neutral-950 p-6 sm:p-8 text-neutral-100 shadow-[0_0_50px_rgba(255,255,255,0.2)] relative">
        {/* Pulsing visual alert banner */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 border border-white bg-white text-black animate-bounce">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
                {alarm.source === 'timer_complete'
                  ? 'Focus Session Complete'
                  : alarm.source === 'break_end'
                  ? 'Break Interval Ended'
                  : 'Scheduled Study Alarm'}
              </p>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {alarm.title}
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-1 border border-neutral-700 bg-neutral-900 text-neutral-300 animate-pulse">
            ALARM ACTIVE
          </span>
        </div>

        {/* Content details */}
        <div className="space-y-4 mb-8">
          {alarm.taskTitle && (
            <div className="p-4 border border-neutral-800 bg-neutral-900/50">
              <div className="text-xs text-neutral-400 font-mono mb-1">
                Target Task:
              </div>
              <div className="font-semibold text-white text-base">
                {alarm.taskTitle}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400 font-mono">
                {alarm.subjectCode && <span>Subject: {alarm.subjectCode}</span>}
                {alarm.durationMinutes && (
                  <>
                    <span>·</span>
                    <span>Elapsed: {alarm.durationMinutes} min</span>
                  </>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-neutral-300 leading-relaxed">
            {alarm.source === 'timer_complete'
              ? 'Excellent discipline. Take a physical stretch, drink water, or log this block to lock in retention.'
              : alarm.source === 'break_end'
              ? 'Your rest period has elapsed. Step back to your study workspace and engage your next topic.'
              : 'It is time for your scheduled study session. Eliminate distractions and begin.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {alarm.source === 'timer_complete' && (
            <button
              onClick={handleLogAndClose}
              className="py-3 px-4 bg-white text-black hover:bg-neutral-200 font-bold text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Log & Finish</span>
            </button>
          )}

          <button
            onClick={() => handleSnooze(5)}
            className="py-3 px-4 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white font-mono text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Snooze (5m)</span>
          </button>

          <button
            onClick={handleDismiss}
            className={`py-3 px-4 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white font-mono text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              alarm.source !== 'timer_complete' ? 'sm:col-span-2 bg-neutral-900' : ''
            }`}
          >
            <VolumeX className="w-4 h-4" />
            <span>Silence & Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
};
