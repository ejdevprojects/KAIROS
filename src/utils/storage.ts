import { Task, Subject, StudyAlarm, StudyLog, AppSettings } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'subj-1', name: 'Algorithms & Complexity', code: 'CS312', targetWeeklyHours: 10 },
  { id: 'subj-2', name: 'Discrete Math & Probability', code: 'MATH240', targetWeeklyHours: 8 },
  { id: 'subj-3', name: 'Cognitive Neuroscience', code: 'NEURO101', targetWeeklyHours: 6 },
  { id: 'subj-4', name: 'Macroeconomic Systems', code: 'ECON202', targetWeeklyHours: 5 },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Problem Set 4: Generating Functions & Recurrences',
    subjectId: 'subj-2',
    estimatedMinutes: 50,
    completedMinutes: 0,
    priority: 'high',
    difficulty: 5,
    deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    completed: false,
    notes: 'Solve exercises 4.2 to 4.7. Focus on homogeneous linear recurrence relations.',
    scheduledTime: '10:00',
  },
  {
    id: 'task-2',
    title: 'Master Dijkstra & A* Graph Search Proofs',
    subjectId: 'subj-1',
    estimatedMinutes: 45,
    completedMinutes: 0,
    priority: 'high',
    difficulty: 4,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // In 2 days
    completed: false,
    notes: 'Understand admissibility and consistency heuristics for A*.',
    scheduledTime: '14:30',
  },
  {
    id: 'task-3',
    title: 'Review Action Potentials & Voltage-Gated Ion Channels',
    subjectId: 'subj-3',
    estimatedMinutes: 30,
    completedMinutes: 0,
    priority: 'medium',
    difficulty: 3,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    completed: false,
    notes: 'Active recall diagram: Hodgkin-Huxley model phases and refractory periods.',
    scheduledTime: '16:00',
  },
  {
    id: 'task-4',
    title: 'IS-LM Monetary vs Fiscal Policy Curve Shifts',
    subjectId: 'subj-4',
    estimatedMinutes: 25,
    completedMinutes: 0,
    priority: 'medium',
    difficulty: 3,
    deadline: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    completed: false,
    notes: 'Derive multiplier effects and analyze liquidity trap dynamics.',
  },
  {
    id: 'task-5',
    title: 'Spaced Repetition: Master Theorem & Complexity Classes',
    subjectId: 'subj-1',
    estimatedMinutes: 15,
    completedMinutes: 0,
    priority: 'low',
    difficulty: 2,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    completed: false,
    notes: '20 rapid flashcards on divide-and-conquer master cases.',
  },
  {
    id: 'task-6',
    title: 'Neocortical Sensory Processing Summary Notes',
    subjectId: 'subj-3',
    estimatedMinutes: 35,
    completedMinutes: 35,
    priority: 'medium',
    difficulty: 2,
    deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    completed: true,
    notes: 'Completed reading Ch 6. Summarized ventral and dorsal visual streams.',
  },
];

export const INITIAL_ALARMS: StudyAlarm[] = [
  {
    id: 'alarm-1',
    title: 'Morning Deep Work Kickoff',
    time: '09:00',
    days: [1, 2, 3, 4, 5],
    enabled: true,
    tone: 'bell',
    type: 'daily_routine',
    note: 'Start the day with the hardest mathematical proof or problem set.',
  },
  {
    id: 'alarm-2',
    title: 'Mid-Day Focus Sprint',
    time: '14:00',
    days: [1, 2, 3, 4, 5, 6],
    enabled: true,
    tone: 'digital',
    type: 'daily_routine',
    note: 'Algorithms & coding implementation sprint.',
  },
  {
    id: 'alarm-3',
    title: 'Evening Active Recall & Spaced Repetition',
    time: '19:30',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    tone: 'gong',
    type: 'daily_routine',
    note: 'Flashcards and reviewing today’s study notes before retention decay.',
  },
];

export const INITIAL_LOGS: StudyLog[] = [
  {
    id: 'log-1',
    taskTitle: 'Neocortical Sensory Processing Summary Notes',
    subjectCode: 'NEURO101',
    durationMinutes: 35,
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Solid focus, completed section summary.',
  },
  {
    id: 'log-2',
    taskTitle: 'Dynamic Programming Subproblems Memoization',
    subjectCode: 'CS312',
    durationMinutes: 50,
    completedAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 2).toISOString(),
    notes: 'Solved 0/1 knapsack and longest common subsequence.',
  },
  {
    id: 'log-3',
    taskTitle: 'Probability Axioms & Bayes Rule Drills',
    subjectCode: 'MATH240',
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'log-4',
    taskTitle: 'Fiscal Stimulus Macro Modeling',
    subjectCode: 'ECON202',
    durationMinutes: 40,
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  alarmTone: 'bell',
  volume: 0.85,
  autoStartBreaks: false,
  autoStartFocus: false,
  notificationsEnabled: true,
  soundEnabled: true,
  highContrastWhiteMode: false,
  dailyStudyGoalMinutes: 180,
};

const STORAGE_KEYS = {
  TASKS: 'chrono_tasks_v2',
  SUBJECTS: 'chrono_subjects_v2',
  ALARMS: 'chrono_alarms_v2',
  LOGS: 'chrono_logs_v2',
  SETTINGS: 'chrono_settings_v2',
};

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadSubjects(): Subject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : INITIAL_SUBJECTS;
  } catch {
    return INITIAL_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadAlarms(): StudyAlarm[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALARMS);
    return data ? JSON.parse(data) : INITIAL_ALARMS;
  } catch {
    return INITIAL_ALARMS;
  }
}

export function saveAlarms(alarms: StudyAlarm[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  } catch (e) {
    console.error('Failed to save alarms', e);
  }
}

export function loadLogs(): StudyLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  } catch {
    return INITIAL_LOGS;
  }
}

export function saveLogs(logs: StudyLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
