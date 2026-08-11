import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Module, Submission, User, Team } from '../types';
import { ModuleCard } from '../components/common/ModuleCard';
import { SubmissionModal } from '../components/common/SubmissionModal';
import { ArrowRight, Github } from 'lucide-react';

interface UserDashboardProps {
  modules: Module[];
  submissions: Submission[];
  users: User[];
  teams: Team[];
  onNavigate: (path: string) => void;
  onSubmitWork: (subData: {
    moduleId: string;
    githubUrl: string;
    title: string;
    description: string;
  }) => Promise<void>;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  modules,
  submissions,
  teams,
  onNavigate,
  onSubmitWork,
}) => {
  const { userProfile } = useAuth();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedModuleForModal, setSelectedModuleForModal] = useState<string | undefined>(undefined);

  const userSubmissions = submissions.filter((s) => s.userId === userProfile?.uid);
  const approvedCount = userSubmissions.filter((s) => s.status === 'approved').length;
  const pendingCount = userSubmissions.filter((s) => s.status === 'pending').length;

  const visibleModules = modules.filter(
    (m) => !m.targetTeamId || m.targetTeamId === userProfile?.teamId
  );

  const userTeam = teams.find((t) => t.id === userProfile?.teamId);

  const handleStartModule = (mod: Module) => {
    setSelectedModuleForModal(mod.id);
    setIsSubmitModalOpen(true);
  };

  const calculateProgress = () => {
    if (visibleModules.length === 0) return 0;
    return Math.round((approvedCount / visibleModules.length) * 100);
  };

  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 font-mono-data text-[12px] text-[var(--color-secondary)] mb-2 uppercase">
            <span className="bg-[var(--color-surface-container)] px-2 py-1 rounded">
              {userTeam?.name || 'NO TEAM ASSIGNED'}
            </span>
          </div>
          <h2 className="font-headline-lg text-[32px] text-[var(--color-primary)] tracking-tight">
            Good evening, {userProfile?.name?.split(' ')[0] || 'Developer'}.
          </h2>
          <p className="font-headline-md text-[20px] text-[var(--color-secondary)] font-normal">
            Keep building. Your next challenge is ready.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase relative z-10">Total Credits</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{userProfile?.credits ?? 0}</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase relative z-10">Completed Modules</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">
              {approvedCount}<span className="text-[var(--color-secondary)] text-xl">/{visibleModules.length}</span>
            </span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-2 h-full bg-[var(--color-primary-container)] opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase relative z-10">Pending Submissions</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{pendingCount}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left/Center Column - Modules */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-[20px] text-[var(--color-primary)]">Available Modules</h3>
              <button
                onClick={() => onNavigate('/modules')}
                className="font-label-caps text-[12px] text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1 uppercase group"
              >
                View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleModules.slice(0, 4).map((mod) => {
                const userSub = userSubmissions.find((s) => s.moduleId === mod.id);
                return (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    userSubmission={userSub}
                    teams={teams}
                    onSelect={handleStartModule}
                  />
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Sidebar Column */}
        <div className="flex flex-col gap-6">
          {/* Overall Progress */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6">
            <h4 className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-4 uppercase">Track Progress</h4>
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle className="text-[var(--color-surface-container)] stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                <circle 
                  className="text-[var(--color-primary-container)] stroke-current transition-all duration-1000 ease-out" 
                  cx="50" cy="50" fill="transparent" r="40" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline-md text-[20px] text-[var(--color-primary)]">{progress}%</span>
              </div>
            </div>
            <p className="text-center font-body-sm text-[12px] text-[var(--color-secondary)]">Completion across all assigned modules.</p>
          </div>

          {/* Recent Submissions */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
              <h4 className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase flex justify-between items-center">
                <span>Recent Submissions</span>
                <button onClick={() => onNavigate('/submissions')} className="hover:text-[var(--color-primary)] transition-colors group flex items-center gap-1">
                  See all <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                </button>
              </h4>
            </div>
            
            {userSubmissions.length === 0 ? (
               <div className="p-6 text-center text-[var(--color-secondary)] font-mono-data text-xs border-dashed">
                 No submissions yet.
               </div>
            ) : (
              <div className="divide-y divide-[var(--color-outline-variant)]">
                {userSubmissions.slice(0, 3).map((sub) => {
                  let statusColor = 'bg-yellow-500';
                  let statusText = 'PENDING';
                  if (sub.status === 'approved') {
                    statusColor = 'bg-green-500';
                    statusText = 'PASS';
                  } else if (sub.status === 'rejected') {
                    statusColor = 'bg-red-500';
                    statusText = 'FAIL';
                  }

                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => onNavigate(`/submission/${sub.id}`)}
                      className="p-4 flex items-center justify-between hover:bg-[var(--color-surface-container-low)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                        <div>
                          <p className="font-body-sm text-[13px] font-medium text-[var(--color-primary)]">{sub.title}</p>
                          <p className="font-mono-data text-[10px] text-[var(--color-secondary)]">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-mono-data text-[10px] ${statusColor.replace('bg-', 'text-')} bg-opacity-10 px-2 py-0.5 rounded`}>{statusText}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <SubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        modules={visibleModules}
        teams={teams}
        userTeamId={userProfile?.teamId}
        initialModuleId={selectedModuleForModal}
        onSubmit={onSubmitWork}
      />
    </div>
  );
};
