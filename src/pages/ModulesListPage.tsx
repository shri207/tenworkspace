import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Module, Submission, Team } from '../types';
import { ModuleCard } from '../components/common/ModuleCard';
import { SubmissionModal } from '../components/common/SubmissionModal';
import { CreateModuleModal } from '../components/common/CreateModuleModal';

interface ModulesListPageProps {
  modules: Module[];
  submissions: Submission[];
  teams: Team[];
  onNavigate: (path: string) => void;
  onSubmitWork: (subData: {
    moduleId: string;
    githubUrl: string;
    title: string;
    description: string;
  }) => Promise<void>;
  onCreateModule?: (moduleData: Omit<Module, 'id' | 'createdAt'>) => Promise<void>;
}

export const ModulesListPage: React.FC<ModulesListPageProps> = ({
  modules,
  submissions,
  teams,
  onNavigate,
  onSubmitWork,
  onCreateModule,
}) => {
  const { userProfile, role } = useAuth();
  const [selectedModuleForModal, setSelectedModuleForModal] = useState<string | undefined>(undefined);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canCreateModule = (role === 'team_lead' || role === 'admin') && Boolean(onCreateModule);
  const userSubmissions = submissions.filter((s) => s.userId === userProfile?.uid);

  // Filter modules: Participants only see modules assigned to their group OR public modules
  const visibleModules = modules.filter((m) => {
    if (role === 'team_lead' || role === 'admin') return true;
    if (!m.targetTeamId) return true;
    return m.targetTeamId === userProfile?.teamId;
  });

  const handleSelectModule = (mod: Module) => {
    setSelectedModuleForModal(mod.id);
    setIsSubmitModalOpen(true);
  };

  const inProgress = visibleModules.filter(m => {
    const s = userSubmissions.find(sub => sub.moduleId === m.id);
    return s && (s.status === 'submitted' || s.status === 'under_review' || s.status === 'rejected');
  }).length;
  
  const completed = visibleModules.filter(m => {
    const s = userSubmissions.find(sub => sub.moduleId === m.id);
    return s && (s.status === 'approved' || s.status === 'verified');
  }).length;
  
  const totalCredits = visibleModules.reduce((a, b) => a + b.creditValue, 0);

  // Take the first module as featured for demonstration purposes
  const featuredModule = visibleModules.length > 0 ? visibleModules[0] : null;
  const remainingModules = visibleModules.length > 0 ? visibleModules.slice(1) : [];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <section className="mb-8 border-b border-[var(--color-outline-variant)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-[32px] text-[var(--color-primary)] mb-2 uppercase tracking-tighter font-bold">Modules</h2>
          <p className="font-body-md text-[16px] text-[var(--color-secondary)] max-w-2xl">
            Explore challenges, build projects, and earn credits for yourself and your team.
          </p>
        </div>
        {canCreateModule && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] uppercase border border-[var(--color-primary-container)] hover:bg-[var(--color-primary-fixed)] transition-colors flex items-center gap-2 font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Module
          </button>
        )}
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-lg border border-[var(--color-outline-variant)] hover:border-[var(--color-primary-container)] transition-colors group cursor-default">
          <div className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">AVAILABLE</div>
          <div className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] transition-colors">{visibleModules.length}</div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-lg border border-[var(--color-outline-variant)] hover:border-[var(--color-primary-container)] transition-colors group cursor-default">
          <div className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">IN PROGRESS</div>
          <div className="font-headline-lg text-[32px] text-yellow-400">{inProgress}</div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-lg border border-[var(--color-outline-variant)] hover:border-[var(--color-primary-container)] transition-colors group cursor-default">
          <div className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">COMPLETED</div>
          <div className="font-headline-lg text-[32px] text-green-400">{completed}</div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-lg border border-[var(--color-outline-variant)] hover:border-[var(--color-primary-container)] transition-colors group cursor-default">
          <div className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">TOTAL CREDITS</div>
          <div className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] transition-colors">{totalCredits}</div>
        </div>
      </section>

      {/* Featured Module Bento */}
      {featuredModule && (
        <section className="mb-10">
          <div className="relative bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded-xl overflow-hidden border border-[var(--color-primary-container)] p-8 md:p-12 min-h-[320px] flex flex-col justify-end shadow-lg">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-black">
              {/* Optional background styling for featured module */}
            </div>
            <div className="relative z-10 flex flex-col items-start gap-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="bg-black/20 text-[var(--color-on-primary-container)] font-label-caps text-[12px] px-2 py-1 rounded backdrop-blur-sm border border-[var(--color-on-primary-container)]/20 uppercase">
                  Featured
                </span>
                <span className="text-[var(--color-on-primary-container)] font-label-caps text-[12px] flex items-center gap-1 uppercase">
                  <span className="material-symbols-outlined text-[14px]">bolt</span> {featuredModule.creditValue} CR
                </span>
              </div>
              <h3 className="font-headline-lg text-[32px] text-[var(--color-on-primary-container)] font-bold">{featuredModule.title}</h3>
              <p className="font-body-md text-[16px] opacity-90 line-clamp-3">
                {featuredModule.description}
              </p>
              <div className="flex items-center gap-6 mt-4">
                <button 
                  onClick={() => handleSelectModule(featuredModule)}
                  className="bg-[var(--color-background)] text-[var(--color-primary)] font-label-caps text-[12px] uppercase py-2 px-6 rounded-lg font-bold hover:opacity-90 transition-colors flex items-center gap-2"
                >
                  View Module <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters & Actions */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[var(--color-outline-variant)] pb-4">
        <div className="flex flex-wrap gap-2">
          <button className="bg-[var(--color-primary)] text-[var(--color-on-primary)] font-body-sm text-[14px] px-4 py-1.5 rounded-full border border-[var(--color-primary)]">All Modules</button>
          <button className="bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors font-body-sm text-[14px] px-4 py-1.5 rounded-full border border-[var(--color-outline-variant)]">Available</button>
          <button className="bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors font-body-sm text-[14px] px-4 py-1.5 rounded-full border border-[var(--color-outline-variant)]">Completed</button>
        </div>
      </section>

      {/* Module Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {remainingModules.length === 0 && !featuredModule ? (
          <div className="col-span-3 text-center py-12 text-[var(--color-secondary)]">
            No modules available.
          </div>
        ) : (
          remainingModules.map((mod) => {
            const userSub = userSubmissions.find((s) => s.moduleId === mod.id);
            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                userSubmission={userSub}
                teams={teams}
                onSelect={handleSelectModule}
              />
            );
          })
        )}
      </section>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        modules={visibleModules}
        teams={teams}
        userTeamId={userProfile?.teamId}
        initialModuleId={selectedModuleForModal}
        onSubmit={onSubmitWork}
      />

      {/* Create Module Modal (for Team Leads & Admins) */}
      {canCreateModule && onCreateModule && (
        <CreateModuleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          teams={teams}
          onCreateModule={onCreateModule}
        />
      )}
    </div>
  );
};
