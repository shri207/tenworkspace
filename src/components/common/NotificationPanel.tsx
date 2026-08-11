import React from 'react';
import { Notification } from '../../types';
import { Bell, Check, ExternalLink, X } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onNavigate?: (link?: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[var(--color-primary-container)]" />
          <h3 className="font-headline-md text-[14px] font-semibold text-[var(--color-primary)]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="font-label-caps text-[10px] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] p-1 rounded-lg hover:bg-[var(--color-surface-container-highest)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-outline-variant)]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-[var(--color-on-surface-variant)] font-body-sm text-xs">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                if (n.link && onNavigate) onNavigate(n.link);
              }}
              className={`p-3.5 hover:bg-[var(--color-surface-container-highest)] transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                !n.read ? 'bg-[var(--color-surface-container-highest)]/60 border-l-2 border-l-[var(--color-primary-container)]' : ''
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-body-sm font-semibold text-xs text-[var(--color-primary)]">
                    {n.title}
                  </h4>
                  <span className="font-mono-data text-[11px] text-[var(--color-on-surface-variant)]">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="font-body-sm text-[13px] text-[var(--color-secondary)] line-clamp-2">{n.message}</p>
              </div>

              {!n.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(n.id);
                  }}
                  className="text-[var(--color-primary-container)] hover:text-[var(--color-primary)] p-1 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
