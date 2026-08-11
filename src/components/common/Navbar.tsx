import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { listenToNotifications, markNotificationAsRead } from '../../services/firestoreService';
import { Notification } from '../../types';
import { NotificationPanel } from './NotificationPanel';

interface NavbarProps {
  pageTitle: string;
  onNavigate: (path: string) => void;
  onToggleMobileSidebar?: () => void;
  isMobileOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  onNavigate,
  onToggleMobileSidebar,
  isMobileOpen,
}) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = listenToNotifications(userProfile.uid, (data) => {
      setNotifications(data);
    });
    return () => unsub();
  }, [userProfile?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  return (
    <header className="h-16 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden text-[var(--color-secondary)] hover:text-[var(--color-primary)] p-1.5 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        
        <div className="hidden sm:block relative w-64 focus-within:w-80 transition-all duration-300 ease-out">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] text-[14px]">search</span>
          <input 
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded font-body-sm text-[13px] text-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-container)] focus:border-[var(--color-primary-container)] transition-all placeholder-[var(--color-secondary)]" 
            placeholder="Search..." 
            type="text"
          />
        </div>
        
        <h2 className="sm:hidden font-headline-md text-base font-bold text-[var(--color-primary)] tracking-tight">
          {pageTitle}
        </h2>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-[var(--color-secondary)] hover:text-[var(--color-primary-container)] transition-colors rounded-full p-1 relative flex items-center justify-center group active:scale-95"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          <NotificationPanel
            notifications={notifications}
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            onMarkRead={handleMarkRead}
            onNavigate={(link) => {
              setIsNotifOpen(false);
              if (link) onNavigate(link);
            }}
          />
        </div>

        <button className="hidden sm:block text-[var(--color-secondary)] hover:text-[var(--color-primary-container)] transition-colors rounded-full p-1 group active:scale-95">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300">help_outline</span>
        </button>
        
        <div 
          onClick={() => onNavigate('/profile')}
          className="w-8 h-8 rounded-full overflow-hidden border border-[var(--color-outline-variant)] shrink-0 cursor-pointer hover:border-[var(--color-primary-container)] hover:shadow-[0_0_10px_rgba(234,234,0,0.3)] active:scale-95 transition-all duration-300"
        >
          <img 
            alt="User profile" 
            className="w-full h-full object-cover" 
            src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
          />
        </div>
      </div>
    </header>
  );
};
