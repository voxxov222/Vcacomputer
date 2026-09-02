import React from 'react';
import { useOS } from '../../context/OSContext';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Check,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    isNotificationsOpen,
    setNotificationsOpen,
    markNotificationRead,
    clearAllNotifications,
    approveTask,
    rejectTask,
    openWindow
  } = useOS();

  if (!isNotificationsOpen) return null;

  const iconForType = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      onClick={() => setNotificationsOpen(false)}
      className="fixed inset-0 z-50 bg-black/20"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-11 right-3 w-88 max-w-[calc(100vw-24px)] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs text-slate-200 backdrop-blur-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-white">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Notifications & Approvals</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded-full font-mono">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 hover:bg-slate-800 rounded transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setNotificationsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No new notifications</p>
              <p className="text-[10px]">Your operating system is running smoothly</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border transition ${
                  n.read
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-900 border-slate-700/90 text-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{iconForType(n.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-100">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {n.timestamp.includes(':') || n.timestamp === 'Just now'
                          ? n.timestamp
                          : isNaN(Date.parse(n.timestamp))
                          ? n.timestamp
                          : new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>

                    {/* Action button if approval required */}
                    {n.actionRequired && n.taskId && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approveTask(n.taskId!);
                            markNotificationRead(n.id);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" /> Approve Action
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rejectTask(n.taskId!);
                            markNotificationRead(n.id);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] font-medium transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
