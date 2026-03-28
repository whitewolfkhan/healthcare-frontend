'use client';
import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCalendar, FiClock, FiCheck, FiUser, FiAlertCircle, FiX, FiRefreshCw } from 'react-icons/fi';
import { notificationAPI } from '../../lib/api';

const iconMap = {
  calendar: FiCalendar,
  clock: FiClock,
  check: FiCheck,
  user: FiUser,
  pill: FiAlertCircle,
};

const typeStyles = {
  appointment: { bg: 'bg-blue-50', icon: 'text-blue-600', dot: 'bg-blue-500', border: 'border-l-blue-400' },
  warning: { bg: 'bg-amber-50', icon: 'text-amber-600', dot: 'bg-amber-500', border: 'border-l-amber-400' },
  success: { bg: 'bg-emerald-50', icon: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-l-emerald-400' },
  info: { bg: 'bg-gray-50', icon: 'text-gray-500', dot: 'bg-gray-400', border: 'border-l-gray-300' },
  medication: { bg: 'bg-purple-50', icon: 'text-purple-600', dot: 'bg-purple-500', border: 'border-l-purple-400' },
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Auto-fetch count on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const visible = notifications.filter(n => !dismissed.has(n.id));
  const urgentCount = visible.filter(n => n.urgent).length;
  const totalCount = visible.length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        <FiBell size={18} />
        {totalCount > 0 && (
          <span className={`absolute top-1 right-1 min-w-[16px] h-4 px-0.5 text-[9px] font-bold text-white rounded-full flex items-center justify-center ${urgentCount > 0 ? 'bg-red-500' : 'bg-primary-500'}`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <FiBell size={15} className="text-gray-600" />
              <span className="font-semibold text-gray-800 text-sm">Notifications</span>
              {totalCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">{totalCount}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={fetchNotifications} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh">
                <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
              {totalCount > 0 && (
                <button
                  onClick={() => setDismissed(new Set(notifications.map(n => n.id)))}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FiBell size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {visible.map(n => {
                  const style = typeStyles[n.type] || typeStyles.info;
                  const Icon = iconMap[n.icon] || FiBell;
                  return (
                    <div
                      key={n.id}
                      className={`relative flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${style.border}`}
                    >
                      <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={14} className={style.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 leading-snug">{n.title}</p>
                          {n.urgent && (
                            <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">URGENT</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.time)}</p>
                      </div>
                      <button
                        onClick={() => setDismissed(prev => new Set([...prev, n.id]))}
                        className="p-1 text-gray-300 hover:text-gray-500 rounded transition-colors flex-shrink-0"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {visible.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
              <span className="text-xs text-gray-400">Notifications refresh when you open this panel</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
