import React, { useState } from 'react';
import { Task, Subject, StudyAlarm } from '../types';
import { Clock, Plus, Volume2, ArrowUpRight, Check, Trash2 } from 'lucide-react';
import { playSoftClick } from '../utils/audio';

interface DailyTimelineProps {
  tasks: Task[];
  subjects: Subject[];
  alarms: StudyAlarm[];
  onStartFocus: (task: Task) => void;
  onAddTaskWithSchedule: (newTask: Omit<Task, 'id' | 'completedMinutes' | 'completed'>) => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  tasks,
  subjects,
  alarms,
  onStartFocus,
  onAddTaskWithSchedule,
  onToggleTaskComplete,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newTime, setNewTime] = useState('14:00');
  const [newDuration, setNewDuration] = useState(45);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Hourly slots from 08:00 to 22:00
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);

  const scheduledTasks = tasks.filter((t) => t.scheduledTime);

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTaskWithSchedule({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      estimatedMinutes: newDuration,
      priority: newPriority,
      difficulty: 3,
      deadline: new Date().toISOString().split('T')[0],
      scheduledTime: newTime,
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const currentHour = new Date().getHours();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Daily Study Schedule & Alarmed Timetable
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Synchronized with system reminder alarms and focus queues.
          </p>
        </div>

        <button
          onClick={() => {
            playSoftClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold tracking-tight transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Study Block</span>
        </button>
      </div>

      {/* Add Study Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md border-2 border-white bg-neutral-950 p-6 text-neutral-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-white">
                Add Scheduled Study Session
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-white text-xs font-mono"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                  Topic / Task Description
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms Practice Set"
                  className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="high">High (Urgent)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-white text-black font-bold text-xs font-mono hover:bg-neutral-200"
                >
                  Confirm & Arm Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hourly Schedule View */}
      <div className="border border-neutral-800 bg-neutral-950 divide-y divide-neutral-900">
        {hours.map((hour) => {
          const hourStr = `${String(hour).padStart(2, '0')}:00`;
          const isCurrentHour = hour === currentHour;

          // Find tasks scheduled during this hour
          const tasksInHour = scheduledTasks.filter((t) => {
            if (!t.scheduledTime) return false;
            const taskHour = parseInt(t.scheduledTime.split(':')[0], 10);
            return taskHour === hour;
          });

          // Find alarms matching this hour
          const alarmsInHour = alarms.filter((a) => {
            if (!a.enabled) return false;
            const aHour = parseInt(a.time.split(':')[0], 10);
            return aHour === hour;
          });

          return (
            <div
              key={hour}
              className={`p-4 flex flex-col md:flex-row md:items-start gap-4 transition-colors ${
                isCurrentHour ? 'bg-neutral-900/40 border-l-2 border-l-white' : 'hover:bg-neutral-900/10'
              }`}
            >
              {/* Hour Label */}
              <div className="w-20 shrink-0 font-mono text-xs text-neutral-500 tabular-nums flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-neutral-600" />
                <span className={isCurrentHour ? 'text-white font-bold' : ''}>{hourStr}</span>
              </div>

              {/* Hour Content */}
              <div className="flex-1 space-y-2">
                {/* Scheduled Alarms in this Hour */}
                {alarmsInHour.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="p-2 border border-neutral-800 bg-neutral-900/80 flex items-center justify-between text-xs font-mono text-neutral-300"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                      <span className="font-bold text-white">{alarm.time}</span>
                      <span>·</span>
                      <span>{alarm.title}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      Routine Alarm
                    </span>
                  </div>
                ))}

                {/* Scheduled Tasks in this Hour */}
                {tasksInHour.map((task) => {
                  const subject = subjectMap.get(task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 border transition-all ${
                        task.completed
                          ? 'border-neutral-900 bg-neutral-950/60 opacity-50'
                          : 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-500'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                            <span className="text-white font-bold">{task.scheduledTime}</span>
                            <span>·</span>
                            <span className="text-neutral-300 font-semibold">{subject?.code}</span>
                            <span>·</span>
                            <span>{task.estimatedMinutes} min</span>
                            <span>·</span>
                            <span className="text-neutral-500 capitalize">{task.priority} Priority</span>
                          </div>
                          <div
                            className={`font-semibold text-sm ${
                              task.completed ? 'line-through text-neutral-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onToggleTaskComplete(task.id)}
                            className={`p-1.5 border text-xs font-mono transition-colors cursor-pointer ${
                              task.completed
                                ? 'border-neutral-800 text-neutral-500'
                                : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                            }`}
                            title={task.completed ? 'Mark Incomplete' : 'Mark Completed'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {!task.completed && (
                            <button
                              onClick={() => {
                                playSoftClick();
                                onStartFocus(task);
                              }}
                              className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold tracking-tight transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>Focus</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slot placeholder */}
                {tasksInHour.length === 0 && alarmsInHour.length === 0 && (
                  <div className="text-[11px] font-mono text-neutral-700 py-1">
                    Open study slot
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
