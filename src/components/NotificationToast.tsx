import React from 'react';
import { Bell, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto border-2 border-white bg-black p-4 text-white shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 border border-white bg-white text-black mt-0.5 shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {toast.title}
              </div>
              <div className="text-xs text-neutral-300 font-sans mt-0.5 leading-normal">
                {toast.message}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-1">
                {toast.timestamp}
              </div>
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-500 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
