import { Task, Subject, StudySuggestion, EnergyLevel } from '../types';

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function generateSuggestions({
  tasks,
  subjects,
  availableMinutes,
  energyLevel,
}: {
  tasks: Task[];
  subjects: Subject[];
  availableMinutes: number;
  energyLevel: EnergyLevel;
}): StudySuggestion[] {
  const pendingTasks = tasks.filter((t) => !t.completed);

  if (pendingTasks.length === 0) {
    return [];
  }

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const scored = pendingTasks.map((task) => {
    const subject = subjectMap.get(task.subjectId) || {
      id: 'general',
      name: 'General Studies',
      code: 'GEN',
      targetWeeklyHours: 5,
    };

    let score = 50;
    const daysUntil = getDaysUntil(task.deadline);

    // 1. Deadline urgency
    if (daysUntil <= 0) {
      score += 60; // Due today or overdue
    } else if (daysUntil === 1) {
      score += 45; // Due tomorrow
    } else if (daysUntil <= 3) {
      score += 30;
    } else if (daysUntil <= 7) {
      score += 15;
    }

    // 2. Priority boost
    if (task.priority === 'high') score += 35;
    else if (task.priority === 'medium') score += 20;
    else score += 10;

    // 3. Energy alignment
    if (energyLevel === 'high') {
      if (task.difficulty >= 4) score += 30;
      else if (task.difficulty === 3) score += 15;
      else score -= 10; // Don't waste high energy on easy tasks
    } else if (energyLevel === 'medium') {
      if (task.difficulty === 3) score += 25;
      else if (task.difficulty === 2 || task.difficulty === 4) score += 15;
    } else {
      // Low energy
      if (task.difficulty <= 2) score += 35;
      else if (task.difficulty === 3) score += 10;
      else score -= 25; // Avoid high difficulty when exhausted
    }

    // 4. Time fit
    const timeDelta = Math.abs(task.estimatedMinutes - availableMinutes);
    if (timeDelta <= 10) {
      score += 25; // Perfect time fit
    } else if (task.estimatedMinutes <= availableMinutes) {
      score += 15; // Fits comfortably
    } else {
      score -= Math.min(20, Math.floor((task.estimatedMinutes - availableMinutes) / 5));
    }

    // Determine technique & rationale
    let technique: StudySuggestion['suggestedTechnique'] = 'Pomodoro Sprint';
    let tier: StudySuggestion['priorityTier'] = 'Steady Progress';
    let reason = '';

    if (daysUntil <= 1) {
      tier = 'Urgent Deadline';
      reason = `Deadline is ${daysUntil <= 0 ? 'today' : 'tomorrow'}. Immediate focus recommended to prevent cramming.`;
    } else if (task.priority === 'high' && energyLevel === 'high') {
      tier = 'High Impact';
      reason = `High cognitive demand (${task.difficulty}/5) perfectly matches your high focus state.`;
    } else if (energyLevel === 'low') {
      tier = 'Low-Energy Review';
      reason = `Low friction review task (${task.estimatedMinutes}m) keeps momentum without mental exhaustion.`;
    } else {
      tier = 'Steady Progress';
      reason = `Consistent progress toward ${subject.code} milestone due in ${daysUntil} days.`;
    }

    if (energyLevel === 'low' || task.estimatedMinutes <= 20) {
      technique = 'Spaced Repetition';
    } else if (task.difficulty >= 4) {
      technique = 'Problem Solving';
    } else if (task.estimatedMinutes >= 45) {
      technique = 'Active Recall';
    } else {
      technique = 'Pomodoro Sprint';
    }

    // Recommend time chunk capped by available minutes
    const recommendedMinutes = Math.min(task.estimatedMinutes, availableMinutes);

    return {
      task,
      subject,
      matchScore: Math.max(10, Math.round(score)),
      recommendedMinutes,
      reason,
      priorityTier: tier,
      suggestedTechnique: technique,
    };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

// Generate an automated daily study timetable proposal with scheduled alarms
export function generateAutoStudyPlan(
  tasks: Task[],
  subjects: Subject[],
  startTime = '09:00',
  totalHours = 4
) {
  const pending = tasks.filter((t) => !t.completed);
  if (pending.length === 0) return [];

  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Sort by priority and deadline
  const sorted = [...pending].sort((a, b) => {
    const pVal = { high: 3, medium: 2, low: 1 };
    const pDiff = pVal[b.priority] - pVal[a.priority];
    if (pDiff !== 0) return pDiff;
    return getDaysUntil(a.deadline) - getDaysUntil(b.deadline);
  });

  const [startHourStr, startMinStr] = startTime.split(':');
  let currentMinutes = parseInt(startHourStr, 10) * 60 + parseInt(startMinStr, 10);
  const maxEndMinutes = currentMinutes + totalHours * 60;

  const plan = [];

  for (const task of sorted) {
    if (currentMinutes + 25 > maxEndMinutes) break;

    const blockDuration = Math.min(task.estimatedMinutes, 50); // cap continuous block at 50 min
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const timeFormatted = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    const endMinutes = currentMinutes + blockDuration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTimeFormatted = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const subject = subjectMap.get(task.subjectId);

    plan.push({
      taskId: task.id,
      taskTitle: task.title,
      subjectCode: subject?.code || 'GEN',
      startTime: timeFormatted,
      endTime: endTimeFormatted,
      durationMinutes: blockDuration,
      breakMinutes: 10,
      alarmRecommended: true,
    });

    // Advance with 10 min break
    currentMinutes = endMinutes + 10;
  }

  return plan;
}
