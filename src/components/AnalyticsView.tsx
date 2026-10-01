import React from 'react';
import { StudyLog, Subject, Task } from '../types';
import { Clock, Flame, BookOpen, CheckCircle, BarChart3, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  logs: StudyLog[];
  subjects: Subject[];
  tasks: Task[];
  dailyGoalMinutes: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  subjects,
  tasks,
  dailyGoalMinutes,
}) => {
  // Calculate total focus minutes today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((l) => l.completedAt.startsWith(todayDateStr));
  const todayMinutes = todayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);

  // Total study minutes across all time
  const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);

  // Group minutes by subject code
  const subjectMinutesMap: Record<string, number> = {};
  logs.forEach((l) => {
    subjectMinutesMap[l.subjectCode] = (subjectMinutesMap[l.subjectCode] || 0) + l.durationMinutes;
  });

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const goalProgressFraction = Math.min(1, todayMinutes / (dailyGoalMinutes || 1));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Study Performance & Execution Logs
        </h2>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Verifiable audit trail of completed deep work sessions and subject allocations.
        </p>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Focus */}
        <div className="border border-neutral-800 bg-neutral-900/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Today&apos;s Focus Time</span>
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums">
            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400 mb-1">
              <span>Goal: {Math.floor(dailyGoalMinutes / 60)}h</span>
              <span>{Math.round(goalProgressFraction * 100)}%</span>
            </div>
            <div className="h-1 bg-neutral-800 w-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${goalProgressFraction * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Active Streak */}
        <div className="border border-neutral-800 bg-neutral-900/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Study Streak</span>
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums">
            5 Days
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            Active retention consistency maintained.
          </p>
        </div>

        {/* Total Focus Logged */}
        <div className="border border-neutral-800 bg-neutral-900/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>All-Time Logged</span>
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums">
            {(totalMinutes / 60).toFixed(1)} hrs
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            {logs.length} distinct study sessions logged.
          </p>
        </div>

        {/* Task Completion Rate */}
        <div className="border border-neutral-800 bg-neutral-900/30 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Tasks Completed</span>
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums">
            {completedTasksCount} / {tasks.length}
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            {pendingTasksCount} curriculum topics remaining.
          </p>
        </div>
      </div>

      {/* Subject Distribution Breakdown */}
      <div className="border border-neutral-800 bg-neutral-900/30 p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
          Subject Allocation vs Weekly Targets
        </h3>

        <div className="space-y-3">
          {subjects.map((sub) => {
            const loggedMinutes = subjectMinutesMap[sub.code] || 0;
            const targetMinutes = sub.targetWeeklyHours * 60;
            const percentage = Math.min(100, Math.round((loggedMinutes / (targetMinutes || 1)) * 100));

            return (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-200">
                    <span className="text-white font-bold mr-2">{sub.code}</span>
                    {sub.name}
                  </span>
                  <span className="text-neutral-400 tabular-nums">
                    {(loggedMinutes / 60).toFixed(1)}h / {sub.targetWeeklyHours}h ({percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-800 w-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-200 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Session Log Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 font-mono">
            Session History Log
          </h3>
          <span className="text-xs font-mono text-neutral-500">
            {logs.length} Entries Recorded
          </span>
        </div>

        <div className="border border-neutral-800 bg-neutral-950 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-400">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Topic / Session</th>
                <th className="py-2.5 px-4 text-right">Duration</th>
                <th className="py-2.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {logs.map((log) => {
                const dateObj = new Date(log.completedAt);
                const formattedDate = dateObj.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={log.id} className="hover:bg-neutral-900/20">
                    <td className="py-3 px-4 text-neutral-400 whitespace-nowrap tabular-nums">
                      {formattedDate} {formattedTime}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {log.subjectCode}
                    </td>
                    <td className="py-3 px-4 text-neutral-200">
                      {log.taskTitle}
                    </td>
                    <td className="py-3 px-4 text-right text-white font-bold whitespace-nowrap tabular-nums">
                      {log.durationMinutes} min
                    </td>
                    <td className="py-3 px-4 text-neutral-400 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
