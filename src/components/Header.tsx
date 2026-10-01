import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Volume2, Moon, Sun, CheckCircle2 } from 'lucide-react';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  NotificationStatus,
} from '../utils/notifications';
import { playSoftClick } from '../utils/audio';

interface HeaderProps {
  activeTab: 'planner' | 'focus' | 'suggest' | 'tasks' | 'alarms' | 'analytics';
  setActiveTab: (tab: 'planner' | 'focus' | 'suggest' | 'tasks' | 'alarms' | 'analytics') => void;
  highContrastWhiteMode: boolean;
  setHighContrastWhiteMode: (val: boolean) => void;
  nextAlarmInfo: string | null;
  onOpenQuickTaskModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  highContrastWhiteMode,
  setHighContrastWhiteMode,
  nextAlarmInfo,
  onOpenQuickTaskModal,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [notifStatus, setNotifStatus] = useState<NotificationStatus>('default');

  useEffect(() => {
    setNotifStatus(getNotificationPermissionStatus());

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestNotif = async () => {
    playSoftClick();
    const status = await requestNotificationPermission();
    setNotifStatus(status);
  };

  const navLinks = [
    { id: 'planner', label: 'Timeline' },
    { id: 'focus', label: 'Focus & Timer' },
    { id: 'suggest', label: 'What To Do' },
    { id: 'tasks', label: 'Curriculum' },
    { id: 'alarms', label: 'Alarms' },
    { id: 'analytics', label: 'Analytics' },
  ] as const;

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              playSoftClick();
              setActiveTab('planner');
            }}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-bold tracking-wider text-white text-lg font-mono">
              KAIROS
            </span>
            <span className="text-neutral-500 font-mono text-xs ml-2 tracking-normal">
              STUDY ENGINE
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  playSoftClick();
                  setActiveTab(link.id);
                }}
                className={`px-3 py-1.5 text-xs font-medium tracking-tight transition-colors whitespace-nowrap cursor-pointer rounded-none border ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 border-neutral-100 font-semibold'
                    : 'text-neutral-400 border-transparent hover:text-white hover:border-neutral-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & System Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real-time Clock */}
          <div className="hidden lg:flex items-center px-2.5 py-1 border border-neutral-800 text-xs font-mono text-neutral-300 tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            {currentTime}
          </div>

          {/* Next Alarm indicator if available */}
          {nextAlarmInfo && (
            <div
              onClick={() => setActiveTab('alarms')}
              title="Next Scheduled Alarm"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs border border-neutral-800 text-neutral-400 font-mono hover:text-white cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-white" />
              <span>{nextAlarmInfo}</span>
            </div>
          )}

          {/* Notification Permission Toggle */}
          <button
            onClick={handleRequestNotif}
            title={
              notifStatus === 'granted'
                ? 'Desktop Notifications Active'
                : 'Enable Browser Notifications'
            }
            className={`p-1.5 border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              notifStatus === 'granted'
                ? 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
            }`}
          >
            {notifStatus === 'granted' ? (
              <>
                <Bell className="w-3.5 h-3.5 text-neutral-200" />
                <span className="hidden sm:inline text-[11px] font-mono">Alerts ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline text-[11px] font-mono">Enable Alerts</span>
              </>
            )}
          </button>

          {/* High Contrast Monochrome White/Black Switch */}
          <button
            onClick={() => {
              playSoftClick();
              setHighContrastWhiteMode(!highContrastWhiteMode);
            }}
            title="Toggle Monochrome Inversion (Black / White)"
            className="p-1.5 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
          >
            {highContrastWhiteMode ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Quick Add Task */}
          <button
            onClick={() => {
              playSoftClick();
              onOpenQuickTaskModal();
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            + Task
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-neutral-900 px-3 py-2 gap-1.5">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                playSoftClick();
                setActiveTab(link.id);
              }}
              className={`px-2.5 py-1 text-xs whitespace-nowrap border ${
                isActive
                  ? 'bg-white text-black border-white font-semibold'
                  : 'text-neutral-400 border-neutral-800'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
