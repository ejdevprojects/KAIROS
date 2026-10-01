import React, { useState } from 'react';
import { Task, Subject, Priority } from '../types';
import { getDaysUntil } from '../utils/recommender';
import { playSoftClick } from '../utils/audio';
import {
  Check,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Zap,
  ArrowUpRight,
  Filter,
  Search,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  subjects: Subject[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'completedMinutes' | 'completed'>) => void;
  onStartFocus: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  subjects,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onStartFocus,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<Priority>('high');
  const [difficulty, setDifficulty] = useState(3);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterSubject !== 'all' && task.subjectId !== filterSubject) return false;
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const s = subjectMap.get(task.subjectId)?.name.toLowerCase() || '';
      return task.title.toLowerCase().includes(q) || s.includes(q);
    }
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      subjectId,
      estimatedMinutes,
      priority,
      difficulty,
      deadline,
      notes: notes.trim(),
    });

    setTitle('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Curriculum & Study Backlog
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Prioritized task inventory fed directly into the recommendation engine.
          </p>
        </div>

        <button
          onClick={() => {
            playSoftClick();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold tracking-tight transition-colors cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Curriculum Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search topic or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
          />
        </div>

        {/* Filter by Subject */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:border-neutral-600"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} · {s.name}
            </option>
          ))}
        </select>

        {/* Filter by Status */}
        <div className="flex border border-neutral-800 bg-neutral-950 p-1">
          {(['all', 'pending', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                playSoftClick();
                setFilterStatus(st);
              }}
              className={`flex-1 py-1 text-xs font-mono capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table / Grid */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const subject = subjectMap.get(task.subjectId);
          const daysLeft = getDaysUntil(task.deadline);

          let deadlineBadge = `${daysLeft}d left`;
          if (daysLeft < 0) deadlineBadge = `Overdue (${Math.abs(daysLeft)}d)`;
          else if (daysLeft === 0) deadlineBadge = 'Due Today';
          else if (daysLeft === 1) deadlineBadge = 'Due Tomorrow';

          return (
            <div
              key={task.id}
              className={`border p-4 sm:p-5 transition-all ${
                task.completed
                  ? 'border-neutral-900 bg-neutral-950/40 opacity-60'
                  : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Checkbox and Task Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => {
                      playSoftClick();
                      onToggleComplete(task.id);
                    }}
                    className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      task.completed
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-neutral-700 hover:border-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
                      <span className="text-white font-bold">{subject?.code}</span>
                      <span>·</span>
                      <span
                        className={
                          task.priority === 'high'
                            ? 'text-white font-bold uppercase'
                            : 'capitalize'
                        }
                      >
                        {task.priority} Priority
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">Est: {task.estimatedMinutes}m</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5" title={`Difficulty: ${task.difficulty}/5`}>
                        Diff:
                        <span className="text-white font-bold ml-1">
                          {'★'.repeat(task.difficulty) + '☆'.repeat(5 - task.difficulty)}
                        </span>
                      </span>
                      <span>·</span>
                      <span
                        className={`tabular-nums ${
                          daysLeft <= 1 && !task.completed ? 'text-white font-bold underline' : ''
                        }`}
                      >
                        {deadlineBadge}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-semibold ${
                        task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed pt-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => {
                        playSoftClick();
                        onStartFocus(task);
                      }}
                      className="px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold tracking-tight transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Focus & Alarm</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playSoftClick();
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 border border-transparent hover:border-neutral-800 text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="border border-neutral-800 bg-neutral-950 p-12 text-center text-neutral-500 font-mono text-xs">
            No matching curriculum tasks found.
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg border-2 border-white bg-neutral-950 p-6 sm:p-8 text-neutral-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
              <h3 className="text-base font-bold font-mono uppercase tracking-wider text-white">
                Add Curriculum Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-500 hover:text-white text-xs font-mono cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bayes Theorem & Conditional Probability"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Subject Course
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                    Difficulty (1-5)
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="1">1 - Light Review</option>
                    <option value="2">2 - Straightforward</option>
                    <option value="3">3 - Moderate Drill</option>
                    <option value="4">4 - High Demand</option>
                    <option value="5">5 - Intense Proof/Problem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">
                  Notes & Key Concepts
                </label>
                <textarea
                  rows={2}
                  placeholder="Key theorems, chapter numbers, specific homework problems..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Add to Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
