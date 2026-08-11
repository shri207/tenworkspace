import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Submission, Module, Team } from '../types';
import { LogOut, Edit2, X, Check } from 'lucide-react';
import { updateUserProfile } from '../services/firestoreService';
import { USER_AVATARS, TEAM_LEAD_AVATARS, ADMIN_AVATARS } from '../constants/avatars';

interface ProfilePageProps {
  submissions: Submission[];
  modules: Module[];
  teams: Team[];
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  submissions,
  modules,
  teams,
  onNavigate,
}) => {
  const { userProfile, role, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const userSubs = submissions.filter((s) => s.userId === userProfile?.uid);
  const approvedSubs = userSubs.filter((s) => s.status === 'approved');
  const userTeam = teams.find((t) => t.id === userProfile?.teamId);
  const joinedDate = userProfile?.createdAt ? new Date(userProfile.createdAt) : new Date();
  
  const completionRate = modules.length > 0 ? Math.round((approvedSubs.length / modules.length) * 100) : 0;
  const verifiedRate = userSubs.length > 0 ? Math.round((approvedSubs.length / userSubs.length) * 100) : 0;

  const handleEditOpen = () => {
    setEditDisplayName(userProfile?.displayName || userProfile?.name || '');
    setEditAvatar(userProfile?.avatar || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    setIsSaving(true);
    try {
      await updateUserProfile(userProfile.uid, { 
        displayName: editDisplayName.trim(),
        avatar: editAvatar 
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const availableAvatars = role === 'admin' 
    ? ADMIN_AVATARS 
    : role === 'team_lead' 
    ? TEAM_LEAD_AVATARS 
    : USER_AVATARS;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <section className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-surface-container-lowest)] via-[var(--color-surface-container-lowest)] to-[var(--color-surface-container-low)] opacity-50 pointer-events-none"></div>
        <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-[var(--color-outline-variant)] overflow-hidden shrink-0 bg-black">
          <img 
            alt="Profile Picture" 
            className="w-full h-full object-cover" 
            src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
          />
        </div>
        <div className="relative z-10 flex flex-col text-center md:text-left flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-2">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-headline-lg text-[32px] text-[var(--color-primary)]">
                  {userProfile?.displayName || userProfile?.name}
                </h2>
                <button 
                  onClick={handleEditOpen}
                  className="p-1.5 bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] text-[var(--color-secondary)] hover:text-[var(--color-primary-container)] rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {userProfile?.displayName && (
                <p className="font-mono-data text-xs text-[var(--color-outline)] mt-0.5">{userProfile.name}</p>
              )}
              <p className="font-body-md text-[16px] text-[var(--color-secondary)] mt-1 capitalize">
                {role?.replace('_', ' ')} <span className="mx-2 text-[var(--color-outline-variant)]">•</span> {userTeam?.name || 'Independent Participant'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3 justify-center md:justify-end">
              <button 
                onClick={logout}
                className="bg-red-950/40 text-red-400 border border-red-900/50 font-body-sm text-[14px] px-4 py-2 rounded flex items-center gap-2 hover:bg-red-900/60 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
            <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm">calendar_today</span>
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase">Member since {joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 flex flex-col justify-between hover:border-[var(--color-outline)] transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase tracking-wider">Total Credits</span>
            <span className="material-symbols-outlined text-[var(--color-primary-container)]">toll</span>
          </div>
          <div>
            <div className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] transition-colors">
              {userProfile?.credits || 0}
            </div>
            <div className="font-mono-data text-[13px] text-green-400 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> PTS Earned
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 flex flex-col justify-between hover:border-[var(--color-outline)] transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase tracking-wider">Modules Completed</span>
            <span className="material-symbols-outlined text-green-400">task_alt</span>
          </div>
          <div>
            <div className="font-headline-lg text-[32px] text-[var(--color-primary)]">
              {approvedSubs.length}<span className="text-[var(--color-secondary)] text-lg font-normal">/{modules.length}</span>
            </div>
            <div className="w-full bg-[var(--color-surface-container-high)] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 flex flex-col justify-between hover:border-[var(--color-outline)] transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase tracking-wider">Submissions</span>
            <span className="material-symbols-outlined text-blue-400">send</span>
          </div>
          <div>
            <div className="font-headline-lg text-[32px] text-[var(--color-primary)]">{userSubs.length}</div>
            <div className="font-mono-data text-[13px] text-[var(--color-secondary)] mt-1">
              Total work submitted
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Sections Bento */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview (Wide) */}
        <div className="lg:col-span-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6">
          <h3 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-6 flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-4">
            <span className="material-symbols-outlined text-[var(--color-secondary)]">trending_up</span>
            Progress Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase">Challenge Completion Rate</span>
                <span className="font-mono-data text-[13px] font-medium text-[var(--color-primary)]">{completionRate}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-container-high)] h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
              </div>
              
              <div className="flex justify-between items-end mb-2 mt-6">
                <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase">Verification Rate</span>
                <span className="font-mono-data text-[13px] font-medium text-[var(--color-primary)]">{verifiedRate}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-container-high)] h-2 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full rounded-full transition-all duration-1000" style={{ width: `${verifiedRate}%` }}></div>
              </div>
            </div>
            
            <div className="bg-[var(--color-surface-container-low)] rounded p-4 border border-[var(--color-outline-variant)] flex items-center justify-center">
              <div className="text-center text-[var(--color-secondary)]">
                <span className="material-symbols-outlined text-4xl mb-2">stacked_line_chart</span>
                <p className="font-body-sm text-[14px]">Keep solving modules to improve your stats.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 flex flex-col h-[400px]">
          <h3 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-4">
            <span className="material-symbols-outlined text-[var(--color-secondary)]">history</span>
            Recent Activity
          </h3>
          
          <div className="overflow-y-auto pr-2 flex-grow space-y-4">
            {userSubs.length === 0 ? (
              <div className="text-center text-[var(--color-secondary)] font-body-sm text-[14px] mt-10">
                No recent activity.
              </div>
            ) : (
              userSubs.slice(0, 10).map((sub, idx) => {
                const isLast = idx === Math.min(userSubs.length, 10) - 1;
                const mod = modules.find((m) => m.id === sub.moduleId);
                
                let icon = 'file_upload';
                let iconColor = 'text-[var(--color-secondary)]';
                let bgIcon = 'bg-[var(--color-surface-container-high)]';
                let statusText = 'Submitted Challenge';
                
                if (sub.status === 'approved') {
                  icon = 'check_circle';
                  iconColor = 'text-green-400';
                  bgIcon = 'bg-[var(--color-surface-container-low)]';
                  statusText = 'Approved Submission';
                } else if (sub.status === 'rejected') {
                  icon = 'cancel';
                  iconColor = 'text-red-400';
                  bgIcon = 'bg-[var(--color-surface-container-low)]';
                  statusText = 'Rejected Submission';
                }

                return (
                  <div key={sub.id} className="flex gap-4 relative cursor-pointer" onClick={() => onNavigate(`/submission/${sub.id}`)}>
                    <div className={`w-8 h-8 rounded-full ${bgIcon} border border-[var(--color-outline-variant)] flex items-center justify-center shrink-0 z-10`}>
                      <span className={`material-symbols-outlined text-sm ${iconColor}`}>{icon}</span>
                    </div>
                    
                    {!isLast && (
                      <div className="absolute left-4 top-8 bottom-[-16px] w-[1px] bg-[var(--color-outline-variant)] -ml-[0.5px]"></div>
                    )}
                    
                    <div className="pb-2">
                      <p className="font-body-sm text-[14px] text-[var(--color-secondary)]">
                        <span className="font-medium text-[var(--color-primary)] block sm:inline">{statusText}:</span> {sub.title}
                      </p>
                      <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mt-1 block uppercase">
                        {new Date(sub.submittedAt).toLocaleDateString()} · {mod?.title || 'Module'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-[var(--color-outline-variant)] flex justify-between items-center bg-[var(--color-surface-container-low)]">
              <h2 className="font-headline-md text-lg text-[var(--color-primary)] font-bold">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors p-1 rounded hover:bg-[var(--color-surface-container-high)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block font-label-caps text-xs text-[var(--color-on-surface-variant)] mb-2">DISPLAY NAME</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Enter a display name"
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)] focus:ring-1 focus:ring-[var(--color-primary-container)] transition-all"
                />
                <p className="text-xs text-[var(--color-secondary)] mt-2">This is the name that will be visible to everyone on the Leaderboard and in Teams.</p>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[var(--color-on-surface-variant)] mb-3">CHOOSE AVATAR</label>
                <div className="grid grid-cols-5 gap-3">
                  {availableAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditAvatar(url)}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                        editAvatar === url
                          ? 'border-[var(--color-primary-container)] ring-2 ring-[var(--color-primary-container)] ring-offset-2 ring-offset-[var(--color-surface-container)]'
                          : 'border-transparent hover:border-[var(--color-outline)]'
                      }`}
                    >
                      <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover bg-black" />
                      {editAvatar === url && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-[var(--color-primary-container)]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 font-label-caps text-xs text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                disabled={isSaving}
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !editDisplayName.trim()}
                className="px-6 py-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-xs font-bold rounded-lg hover:bg-[var(--color-primary-fixed)] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
