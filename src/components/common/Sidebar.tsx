import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  User,
  Users,
  Settings,
  LogOut,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isMobileOpen, onCloseMobile }) => {
  const { userProfile, role, logout, loginAsDemoUser } = useAuth();

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'ADMIN';
      case 'team_lead':
        return 'TEAM LEAD';
      default:
        return 'PARTICIPANT';
    }
  };

  const getUserNav = () => [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Modules', path: '/modules', icon: Layers },
    { label: 'My Submissions', path: '/submissions', icon: FileCheck2 },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const getTeamLeadNav = () => [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Modules', path: '/modules', icon: Layers },
    { label: 'Team Workspace', path: '/team', icon: Users },
    { label: 'Submissions', path: '/submissions', icon: FileCheck2 },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const getAdminNav = () => [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'User Permissions', path: '/admin/users', icon: User },
    { label: 'Modules', path: '/modules', icon: Layers },
    { label: 'Submissions', path: '/submissions', icon: FileCheck2 },
  ];

  const navItems = role === 'admin' ? getAdminNav() : role === 'team_lead' ? getTeamLeadNav() : getUserNav();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`w-[240px] h-screen fixed left-0 top-0 bg-[var(--color-surface)] dark:bg-[var(--color-surface-container-lowest)] border-r border-[var(--color-outline-variant)] flex flex-col p-4 z-50 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}`}>
        <div className="mb-8 px-3 mt-4 lg:mt-0 flex justify-between items-center">
          <div>
            <img src="/s10-logo.png" alt="S10" className="h-10 w-auto mix-blend-lighten" />
            <p className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-[var(--color-secondary)] mt-1">{getRoleLabel()}</p>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-[var(--color-secondary)]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            if (isActive) {
              return (
                <button
                  key={item.path}
                  onClick={() => { onNavigate(item.path); onCloseMobile(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-[var(--color-primary-container)]/10 to-transparent text-[var(--color-primary-container)] border-l-2 border-[var(--color-primary-container)] transition-all duration-300 shadow-[inset_4px_0_10px_rgba(234,234,0,0.05)] rounded-r-md group"
                >
                  <Icon className="w-5 h-5 text-[var(--color-primary-container)] drop-shadow-[0_0_5px_rgba(234,234,0,0.5)] group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em]">{item.label}</span>
                </button>
              );
            }
            return (
              <button
                key={item.path}
                onClick={() => { onNavigate(item.path); onCloseMobile(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] hover:translate-x-1 transition-all duration-300 border-l-2 border-transparent group rounded-r-md"
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em]">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto space-y-4 pt-4 border-t border-[var(--color-outline-variant)]">
          {/* Demo Role Switcher */}
          <div className="space-y-2">
            <p className="px-3 font-label-caps text-[10px] text-[var(--color-secondary)] uppercase">Demo Role</p>
            <div className="flex gap-1 px-3">
              <button
                onClick={() => { loginAsDemoUser('user'); onNavigate('/dashboard'); onCloseMobile(); }}
                className={`flex-1 py-1 text-[10px] rounded transition-colors ${role === 'user' ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]' : 'bg-[var(--color-surface-container)] text-[var(--color-secondary)] hover:bg-[var(--color-surface-container-low)]'}`}
              >
                User
              </button>
              <button
                onClick={() => { loginAsDemoUser('team_lead'); onNavigate('/dashboard'); onCloseMobile(); }}
                className={`flex-1 py-1 text-[10px] rounded transition-colors ${role === 'team_lead' ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]' : 'bg-[var(--color-surface-container)] text-[var(--color-secondary)] hover:bg-[var(--color-surface-container-low)]'}`}
              >
                Lead
              </button>
              <button
                onClick={() => { loginAsDemoUser('admin'); onNavigate('/admin'); onCloseMobile(); }}
                className={`flex-1 py-1 text-[10px] rounded transition-colors ${role === 'admin' ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]' : 'bg-[var(--color-surface-container)] text-[var(--color-secondary)] hover:bg-[var(--color-surface-container-low)]'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-surface-container-low)] rounded-lg group hover:bg-[var(--color-surface-container-highest)] transition-all duration-300 cursor-default">
             <div className="flex items-center space-x-2 overflow-hidden">
               <img
                 src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                 alt="Avatar"
                 className="w-8 h-8 rounded-full object-cover border border-[var(--color-outline-variant)] shrink-0 group-hover:border-[var(--color-primary-container)] transition-colors duration-300"
               />
               <div className="truncate">
                 <p className="font-body-sm text-[12px] font-semibold text-[var(--color-primary)] truncate group-hover:text-[var(--color-primary-container)] transition-colors duration-300">
                   {userProfile?.displayName || userProfile?.name || 'User'}
                 </p>
               </div>
             </div>
             <button
               onClick={() => { logout(); onNavigate('/'); }}
               className="text-[var(--color-secondary)] hover:text-red-400 p-1.5 rounded-lg hover:bg-[var(--color-surface-container)] active:scale-95 transition-all duration-200 shrink-0 group-hover:rotate-12"
               title="Sign Out"
             >
               <LogOut className="w-4 h-4" />
             </button>
           </div>
        </div>
      </aside>
    </>
  );
};
