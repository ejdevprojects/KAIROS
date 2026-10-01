import React, { useState } from 'react';
import { Task, Subject, EnergyLevel, StudySuggestion } from '../types';
import { generateSuggestions, generateAutoStudyPlan } from '../utils/recommender';
import { playSoftClick } from '../utils/audio';
import { Sparkles, ArrowRight, Clock, Zap, Target, CalendarPlus, Check, ChevronRight } from 'lucide-react';

interface SuggestWhatToDoProps {
  tasks: Task[];
  subjects: Subject[];
  onStartFocusSession: (task: Task, durationMinutes: number) => void;
  onApplySchedulePlan: (plan: ReturnType<typeof generateAutoStudyPlan>) => void;
}

export const SuggestWhatToDo: React.FC<SuggestWhatToDoProps> = ({
  tasks,
  subjects,
  onStartFocusSession,
  onApplySchedulePlan,
}) => {
  const [availableMinutes, setAvailableMinutes] = useState<number>(25);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('high');
  const [appliedSchedule, setAppliedSchedule] = useState(false);

  const timeOptions = [
    { minutes: 15, label: '15m Sprint' },
    { minutes: 25, label: '25m Pomodoro' },
    { minutes: 45, label: '45m Deep Block' },
    { minutes: 60, label: '60m Mastery' },
    { minutes: 90, label: '90m Exam Drill' },
  ];

  const energyOptions: { level: EnergyLevel; label: string; desc: string }[] = [
    { level: 'high', label: 'High Focus', desc: 'Complex problem sets, proofs, deep analysis' },
    { level: 'medium', label: 'Steady Focus', desc: 'Readings, structured exercises, note syntheses' },
    { level: 'low', label: 'Low Energy', desc: 'Flashcards, formula sheets, light review' },
  ];

  const suggestions: StudySuggestion[] = generateSuggestions({
    tasks,
    subjects,
    availableMinutes,
    energyLevel,
  });

  const topPick = suggestions[0];
  const alternatives = suggestions.slice(1, 4);

  const handleGeneratePlan = () => {
    playSoftClick();
    const currentHour = new Date().getHours();
    const startHourStr = `${String(Math.max(8, currentHour)).padStart(2, '0')}:00`;
    const plan = generateAutoStudyPlan(tasks, subjects, startHourStr, 4);
    onApplySchedulePlan(plan);
    setAppliedSchedule(true);
    setTimeout(() => setAppliedSchedule(false), 3000);
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>INTELLIGENT STUDY RECOMMENDER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              What Should I Study Right Now?
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Tell Kairos your current time window and mental energy. The engine evaluates deadlines,
              mastery gaps, and difficulty ratings to prescribe your highest-leverage task.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={pendingCount === 0}
              className={`px-4 py-2.5 text-xs font-mono font-medium border transition-colors cursor-pointer flex items-center gap-2 ${
                appliedSchedule
                  ? 'bg-neutral-100 text-neutral-950 border-neutral-100 font-bold'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white hover:border-neutral-500'
              }`}
            >
              {appliedSchedule ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Timeline Populated & Alarmed!</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Auto-Plan Today (4h)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Input Parameters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Window */}
          <div>
            <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>Available Time Window</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => {
                    playSoftClick();
                    setAvailableMinutes(opt.minutes);
                  }}
                  className={`py-2 px-3 text-xs font-mono border text-center transition-colors cursor-pointer ${
                    availableMinutes === opt.minutes
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Current Cognitive Energy</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {energyOptions.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => {
                    playSoftClick();
                    setEnergyLevel(opt.level);
                  }}
                  className={`py-2 px-2.5 text-xs font-mono border text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    energyLevel === opt.level
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Recommendation Result */}
      {topPick ? (
        <div className="border-2 border-white bg-neutral-950 p-6 sm:p-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-white text-black text-[11px] font-mono font-bold px-2 py-0.5 tracking-wider uppercase">
                #1 Recommended Next Move
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {topPick.priorityTier}
              </span>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Score: <span className="text-white font-bold">{topPick.matchScore} pts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 mb-1.5">
                  <span className="text-white font-bold">{topPick.subject.code}</span>
                  <span>·</span>
                  <span>{topPick.subject.name}</span>
                  <span>·</span>
                  <span>Difficulty: {topPick.task.difficulty}/5</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {topPick.task.title}
                </h2>
              </div>

              {topPick.task.notes && (
                <p className="text-sm text-neutral-300 bg-neutral-900/60 p-3.5 border border-neutral-800 font-sans leading-relaxed">
                  {topPick.task.notes}
                </p>
              )}

              {/* Rationale & Technique */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="border border-neutral-800 p-3 bg-neutral-900/30">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Recommendation Rationale
                  </div>
                  <p className="text-xs text-neutral-300 leading-normal">
                    {topPick.reason}
                  </p>
                </div>
                <div className="border border-neutral-800 p-3 bg-neutral-900/30">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Suggested Study Technique
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {topPick.suggestedTechnique}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Target duration: {topPick.recommendedMinutes} minutes
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Action Panel */}
            <div className="border border-neutral-800 bg-neutral-900/40 p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                  Session Specifications
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-400">
                    <span>Duration:</span>
                    <span className="text-white">{topPick.recommendedMinutes} min</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-400">
                    <span>Deadline:</span>
                    <span className="text-white">{topPick.task.deadline}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-400">
                    <span>Alarm at finish:</span>
                    <span className="text-emerald-400">Armed & Ready</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playSoftClick();
                  onStartFocusSession(topPick.task, topPick.recommendedMinutes);
                }}
                className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Engage Focus Session Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-neutral-800 bg-neutral-900/20 p-12 text-center">
          <p className="text-neutral-400 font-mono text-sm">
            All curriculum tasks currently completed. Add new topics to receive fresh study recommendations.
          </p>
        </div>
      )}

      {/* Alternative Options */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 font-mono">
              Alternative High-Yield Options
            </h3>
            <span className="text-xs font-mono text-neutral-500">
              Ranked by algorithm score
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternatives.map((alt) => (
              <div
                key={alt.task.id}
                className="border border-neutral-800 hover:border-neutral-600 bg-neutral-900/30 p-5 flex flex-col justify-between space-y-4 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                    <span className="font-semibold text-white">{alt.subject.code}</span>
                    <span>{alt.task.estimatedMinutes}m</span>
                  </div>
                  <h4 className="font-semibold text-neutral-100 text-sm line-clamp-2">
                    {alt.task.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {alt.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">
                    Diff: {alt.task.difficulty}/5
                  </span>
                  <button
                    onClick={() => {
                      playSoftClick();
                      onStartFocusSession(alt.task, alt.recommendedMinutes);
                    }}
                    className="text-xs font-mono text-white hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Start</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
