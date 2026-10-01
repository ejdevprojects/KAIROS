/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Task, Subject, StudyAlarm, StudyLog, AppSettings, AlarmTone } from './types';
import {
  loadTasks,
  saveTasks,
  loadSubjects,
  saveSubjects,
  loadAlarms,
  saveAlarms,
  loadLogs,
  saveLogs,
  loadSettings,
  saveSettings,
} from './utils/storage';
import { startAlarm, stopAlarm, playSoftClick } from './utils/audio';
import { showBrowserNotification } from './utils/notifications';
import { Header } from './components/Header';
import { AlarmAlertModal, ActiveAlarmPayload } from './components/AlarmAlertModal';
import { SuggestWhatToDo } from './components/SuggestWhatToDo';
import { FocusTimer } from './components/FocusTimer';
import { DailyTimeline } from './components/DailyTimeline';
import { TaskList } from './components/TaskList';
import { AlarmManager } from './components/AlarmManager';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
  const [alarms, setAlarms] = useState<StudyAlarm[]>(() => loadAlarms());
  const [logs, setLogs] = useState<StudyLog[]>(() => loadLogs());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const [activeTab, setActiveTab] = useState<
    'planner' | 'focus' | 'suggest' | 'tasks' | 'alarms' | 'analytics'
  >('suggest');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmPayload | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);

  const lastCheckedMinuteRef = useRef<string>('');

  // Persist state updates to LocalStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveSettings(settings);
    if (settings.highContrastWhiteMode) {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = '#0a0a0a';
    } else {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#050505';
      document.body.style.color = '#f5f5f5';
    }
  }, [settings]);

  // Push in-app toast
  const addToast = (title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Background Clock & Scheduled Alarm Watcher
  useEffect(() => {
    const checkScheduledAlarms = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMin = String(now.getMinutes()).padStart(2, '0');
      const currentMinuteStr = `${currentHour}:${currentMin}`;

      if (lastCheckedMinuteRef.current === currentMinuteStr) {
        return; // Already checked this minute
      }
      lastCheckedMinuteRef.current = currentMinuteStr;

      // Look for enabled alarms that match current time and day
      const triggered = alarms.find(
        (a) => a.enabled && a.time === currentMinuteStr && a.days.includes(currentDay)
      );

      if (triggered) {
        // Sound the synthetic audio alarm
        startAlarm(triggered.tone, settings.volume);

        // Native browser notification
        showBrowserNotification(`Alarm: ${triggered.title}`, {
          body: triggered.note || 'Scheduled study session routine starting now.',
        });

        // In-app alert modal & toast
        setActiveAlarm({
          title: triggered.title,
          source: 'scheduled_alarm',
        });

        addToast(triggered.title, triggered.note || 'Scheduled study alarm active.');
      }
    };

    const interval = setInterval(checkScheduledAlarms, 5000);
    return () => clearInterval(interval);
  }, [alarms, settings.volume]);

  // Next upcoming alarm calculation
  const getNextAlarmInfo = (): string | null => {
    const enabledAlarms = alarms.filter((a) => a.enabled);
    if (enabledAlarms.length === 0) return null;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Sort by proximity
    let closest: StudyAlarm | null = null;
    let minDiff = Infinity;

    for (const a of enabledAlarms) {
      const [h, m] = a.time.split(':').map(Number);
      const alarmMins = h * 60 + m;
      let diff = alarmMins - currentMins;
      if (diff <= 0) diff += 24 * 60; // Next day
      if (diff < minDiff) {
        minDiff = diff;
        closest = a;
      }
    }

    return closest ? `${closest.time}` : null;
  };

  // Handle Focus Timer completion
  const handleTimerComplete = (durationMinutes: number, task: Task | null) => {
    startAlarm(settings.alarmTone, settings.volume);

    const subject = task ? subjects.find((s) => s.id === task.subjectId) : null;

    showBrowserNotification('Focus Session Finished!', {
      body: task ? `Great work on "${task.title}". Log your session now.` : 'Focus interval completed.',
    });

    setActiveAlarm({
      title: task ? task.title : 'Deep Focus Session Completed',
      source: 'timer_complete',
      taskTitle: task?.title,
      subjectCode: subject?.code,
      durationMinutes,
      taskId: task?.id,
    });

    addToast('Session Finished', `Completed ${durationMinutes} minutes of focused study.`);
  };

  // Snooze active alarm
  const handleSnooze = (minutes: number) => {
    stopAlarm();
    setActiveAlarm(null);
    addToast('Alarm Snoozed', `Will ring again in ${minutes} minutes.`);
    setTimeout(() => {
      startAlarm(settings.alarmTone, settings.volume);
      setActiveAlarm({
        title: 'Snoozed Study Alarm',
        source: 'scheduled_alarm',
      });
    }, minutes * 60 * 1000);
  };

  // Log session from alarm modal
  const handleLogFromAlarm = (payload: ActiveAlarmPayload) => {
    stopAlarm();
    setActiveAlarm(null);

    const newLog: StudyLog = {
      id: Math.random().toString(36).substring(2, 9),
      taskId: payload.taskId,
      taskTitle: payload.taskTitle || payload.title,
      subjectCode: payload.subjectCode || 'GEN',
      durationMinutes: payload.durationMinutes || 25,
      completedAt: new Date().toISOString(),
      notes: 'Logged upon timer alarm completion.',
    };

    setLogs((prev) => [newLog, ...prev]);

    // Update task progress if linked
    if (payload.taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === payload.taskId
            ? {
                ...t,
                completedMinutes: t.completedMinutes + (payload.durationMinutes || 25),
                completed:
                  t.completedMinutes + (payload.durationMinutes || 25) >= t.estimatedMinutes,
              }
            : t
        )
      );
    }

    addToast('Study Block Recorded', `Logged ${newLog.durationMinutes}m for ${newLog.subjectCode}.`);
  };

  // Start study session from recommendation or task list
  const handleStartFocusFromItem = (task: Task, durationMinutes?: number) => {
    playSoftClick();
    setSelectedTask(task);
    setActiveTab('focus');
    addToast('Target Locked', `Focus timer configured for "${task.title}".`);
  };

  // Apply Auto-Schedule Plan
  const handleApplySchedulePlan = (
    plan: {
      taskId: string;
      taskTitle: string;
      subjectCode: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
    }[]
  ) => {
    // Update tasks with scheduled times
    setTasks((prev) =>
      prev.map((t) => {
        const item = plan.find((p) => p.taskId === t.id);
        if (item) {
          return { ...t, scheduledTime: item.startTime };
        }
        return t;
      })
    );

    // Auto-create reminder alarms for each block in the plan
    const newAlarms: StudyAlarm[] = plan.map((p) => ({
      id: Math.random().toString(36).substring(2, 9),
      title: `Study: ${p.taskTitle}`,
      time: p.startTime,
      days: [new Date().getDay()],
      enabled: true,
      tone: 'digital',
      type: 'scheduled_session',
      linkedTaskId: p.taskId,
      note: `Target duration: ${p.durationMinutes} mins. Subject: ${p.subjectCode}`,
    }));

    setAlarms((prev) => [...prev, ...newAlarms]);
    addToast('Schedule & Alarms Activated', `Created ${plan.length} study blocks and reminder alarms.`);
    setActiveTab('planner');
  };

  // Task Actions
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completedMinutes' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Math.random().toString(36).substring(2, 9),
      completedMinutes: 0,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast('Task Created', `Added "${newTask.title}" to curriculum.`);
  };

  // Alarm Actions
  const handleToggleAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (alarmId: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== alarmId));
  };

  const handleAddAlarm = (newAlarmData: Omit<StudyAlarm, 'id'>) => {
    const newAlarm: StudyAlarm = {
      ...newAlarmData,
      id: Math.random().toString(36).substring(2, 9),
    };
    setAlarms((prev) => [...prev, newAlarm]);
    addToast('Alarm Armed', `Scheduled for ${newAlarm.time}.`);
  };

  const isWhiteMode = settings.highContrastWhiteMode;

  return (
    <div
      className={`min-h-screen transition-colors duration-150 ${
        isWhiteMode
          ? 'bg-neutral-100 text-neutral-950 font-sans'
          : 'bg-neutral-950 text-neutral-100 font-sans'
      }`}
    >
      {/* Active Alarm Sound & Modal Overlay */}
      <AlarmAlertModal
        alarm={activeAlarm}
        onDismiss={() => {
          stopAlarm();
          setActiveAlarm(null);
        }}
        onSnooze={handleSnooze}
        onLogCompleted={handleLogFromAlarm}
      />

      {/* Persistent Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highContrastWhiteMode={settings.highContrastWhiteMode}
        setHighContrastWhiteMode={(val) =>
          setSettings((prev) => ({ ...prev, highContrastWhiteMode: val }))
        }
        nextAlarmInfo={getNextAlarmInfo()}
        onOpenQuickTaskModal={() => setActiveTab('tasks')}
      />

      {/* Main Viewport Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'suggest' && (
          <SuggestWhatToDo
            tasks={tasks}
            subjects={subjects}
            onStartFocusSession={(task, mins) => handleStartFocusFromItem(task, mins)}
            onApplySchedulePlan={handleApplySchedulePlan}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimer
            tasks={tasks}
            subjects={subjects}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            onTimerComplete={handleTimerComplete}
            defaultAlarmTone={settings.alarmTone}
            volume={settings.volume}
          />
        )}

        {activeTab === 'planner' && (
          <DailyTimeline
            tasks={tasks}
            subjects={subjects}
            alarms={alarms}
            onStartFocus={(task) => handleStartFocusFromItem(task)}
            onAddTaskWithSchedule={handleAddTask}
            onToggleTaskComplete={handleToggleTaskComplete}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskList
            tasks={tasks}
            subjects={subjects}
            onToggleComplete={handleToggleTaskComplete}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onStartFocus={(task) => handleStartFocusFromItem(task)}
          />
        )}

        {activeTab === 'alarms' && (
          <AlarmManager
            alarms={alarms}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onAddAlarm={handleAddAlarm}
            volume={settings.volume}
            setVolume={(vol) => setSettings((prev) => ({ ...prev, volume: vol }))}
            defaultTone={settings.alarmTone}
            setDefaultTone={(tone) => setSettings((prev) => ({ ...prev, alarmTone: tone }))}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            logs={logs}
            subjects={subjects}
            tasks={tasks}
            dailyGoalMinutes={settings.dailyStudyGoalMinutes}
          />
        )}
      </main>

      {/* In-App Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
