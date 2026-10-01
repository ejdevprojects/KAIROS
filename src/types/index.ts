export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  estimatedMinutes: number;
  completedMinutes: number;
  priority: Priority;
  difficulty: number; // 1 to 5 (1 = breeze, 5 = intense/hard)
  deadline: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  tags?: string[];
  scheduledTime?: string; // HH:mm
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  targetWeeklyHours: number;
}

export type AlarmTone = 'bell' | 'digital' | 'gong' | 'radar';

export interface StudyAlarm {
  id: string;
  title: string;
  time: string; // HH:mm format
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  enabled: boolean;
  tone: AlarmTone;
  type: 'daily_routine' | 'task_reminder' | 'exam_prep' | 'break_end' | 'scheduled_session';
  linkedTaskId?: string;
  note?: string;
}

export interface StudyLog {
  id: string;
  taskId?: string;
  taskTitle: string;
  subjectCode: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  notes?: string;
}

export type TimerMode = 'focus' | 'short_break' | 'long_break' | 'custom';

export type EnergyLevel = 'high' | 'medium' | 'low';

export interface StudySuggestion {
  task: Task;
  subject: Subject;
  matchScore: number;
  recommendedMinutes: number;
  reason: string;
  priorityTier: 'Urgent Deadline' | 'High Impact' | 'Steady Progress' | 'Low-Energy Review';
  suggestedTechnique: 'Pomodoro Sprint' | 'Active Recall' | 'Problem Solving' | 'Summary & Notes' | 'Spaced Repetition';
}

export interface AppSettings {
  alarmTone: AlarmTone;
  volume: number; // 0 to 1
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  highContrastWhiteMode: boolean; // false = Stark Pitch Black, true = Stark Pure White
  dailyStudyGoalMinutes: number;
}
