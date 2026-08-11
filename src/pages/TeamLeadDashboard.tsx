import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Module, Submission, User, Team } from '../types';
import { ReviewModal } from '../components/common/ReviewModal';
import { CreateModuleModal } from '../components/common/CreateModuleModal';
import { CreateGroupModal } from '../components/common/CreateGroupModal';
import { StatusBadge } from '../components/common/StatusBadge';

interface TeamLeadDashboardProps {
  modules: Module[];
  submissions: Submission[];
  users: User[];
  teams: Team[];
  onNavigate: (path: string) => void;
  onVerifySubmission: (submissionId: string, reviewerId: string, comment?: string) => Promise<void>;
  onRejectSubmission: (submissionId: string, reviewerId: string, comment: string) => Promise<void>;
  onCreateModule?: (moduleData: Omit<Module, 'id' | 'createdAt'>) => Promise<void>;
  onCreateGroup?: (groupData: { name: string; memberIds: string[] }) => Promise<void>;
}

export const TeamLeadDashboard: React.FC<TeamLeadDashboardProps> = ({
  modules,
  submissions,
  users,
  teams,
  onNavigate,
  onVerifySubmission,
  onRejectSubmission,
  onCreateModule,
  onCreateGroup,
}) => {
  const { userProfile } = useAuth();
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [rosterFilter, setRosterFilter] = useState('');

  // Find team lead's teams
  const myTeams = teams.filter((t) => t.teamLeadId === userProfile?.uid);
  const myTeam = myTeams[0] || teams.find((t) => t.id === userProfile?.teamId) || teams[0];
  const teamMembers = users.filter((u) => u.teamId === myTeam?.id || (myTeams.some(t => t.id === u.teamId)));

  // Submissions for this team
  const teamSubmissions = submissions.filter((s) => s.teamId === myTeam?.id || myTeams.some(t => t.id === s.teamId));

  // Pending verification queue for team lead (status == 'submitted' or 'under_review')
  const pendingReviews = submissions.filter((s) => {
    const isPendingStatus = s.status === 'submitted' || s.status === 'under_review';
    if (!isPendingStatus) return false;
    if (myTeams.length > 0 && s.teamId) {
      return myTeams.some(t => t.id === s.teamId);
    }
    if (myTeam?.id && s.teamId) {
      return s.teamId === myTeam.id;
    }
    return true;
  });
  
  const verifiedCount = teamSubmissions.filter((s) => s.status === 'verified' || s.status === 'approved').length;
  const teamCreditsTotal = teamMembers.reduce((acc, curr) => acc + (curr.credits || 0), 0);

  const filteredMembers = teamMembers.filter(m => m.name.toLowerCase().includes(rosterFilter.toLowerCase()) || m.email.toLowerCase().includes(rosterFilter.toLowerCase()));

  const handleConfirmReview = async (
    action: 'verify' | 'approve' | 'reject',
    comment: string
  ) => {
    if (!selectedSubForReview || !userProfile) return;
    if (action === 'verify' || action === 'approve') {
      await onVerifySubmission(selectedSubForReview.id, userProfile.uid, comment);
    } else if (action === 'reject') {
      await onRejectSubmission(selectedSubForReview.id, userProfile.uid, comment);
    }
    setSelectedSubForReview(null);
  };

  return (
    <div className="space-y-8 flex-1 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-[var(--color-outline-variant)] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-headline-lg text-[32px] font-bold uppercase tracking-tighter text-[var(--color-primary)]">Team Dashboard</h2>
          </div>
          <p className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">
            {teamMembers.length} participants · {myTeams.length || 1} groups · {teamCreditsTotal} credits
          </p>
        </div>
        <div className="flex gap-4">
          {onCreateGroup && (
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="px-6 py-2 border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-primary)] font-label-caps text-[12px] uppercase hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-all duration-300 flex items-center gap-2 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform duration-300">group_add</span>
              Create Group
            </button>
          )}
          {onCreateModule && (
            <button
              onClick={() => setIsCreateModuleOpen(true)}
              className="px-6 py-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] uppercase border border-[var(--color-primary-container)] hover:bg-[var(--color-primary-fixed)] transition-all duration-300 flex items-center gap-2 font-bold active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300">add_box</span>
              Create Module
            </button>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded p-4 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform duration-300">group</span>
          </div>
          <h3 className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2 relative z-10">Participants</h3>
          <p className="font-headline-md text-[24px] text-[var(--color-primary)] font-mono-data relative z-10 group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{teamMembers.length}</p>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border-y border-r border-l-2 border-[var(--color-outline-variant)] border-l-[var(--color-primary-container)] rounded p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl text-[var(--color-primary-container)] group-hover:scale-110 transition-transform duration-300">pending_actions</span>
          </div>
          <h3 className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2 relative z-10">Pending Reviews</h3>
          <p className="font-headline-md text-[24px] text-[var(--color-primary-container)] font-mono-data relative z-10 group-hover:scale-105 origin-left transition-transform duration-300">{pendingReviews.length}</p>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded p-4 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform duration-300">verified</span>
          </div>
          <h3 className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2 relative z-10">Verified Submissions</h3>
          <p className="font-headline-md text-[24px] text-[var(--color-primary)] font-mono-data relative z-10 group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{verifiedCount}</p>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded p-4 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform duration-300">monetization_on</span>
          </div>
          <h3 className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2 relative z-10">Team Credits</h3>
          <p className="font-headline-md text-[24px] text-[var(--color-primary)] font-mono-data relative z-10 group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{teamCreditsTotal}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          {/* Groups Overview */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-outline-variant)] pb-2">
              <h3 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase">Groups Overview</h3>
              <a className="font-mono-data text-[13px] text-[var(--color-primary-container)] uppercase hover:underline cursor-pointer" onClick={() => onNavigate('/team')}>View Team Page</a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(myTeams.length > 0 ? myTeams : [myTeam]).map((t, idx) => {
                if (!t) return null;
                const members = users.filter((u) => u.teamId === t.id);
                const isLeadOfGroup = t.teamLeadId === userProfile?.uid;
                const groupCredits = members.reduce((acc, curr) => acc + (curr.credits || 0), 0);
                const groupSubs = submissions.filter((s) => s.teamId === t.id);
                const approvedGroupSubs = groupSubs.filter(s => s.status === 'approved' || s.status === 'verified');
                const completionRate = groupSubs.length > 0 ? Math.round((approvedGroupSubs.length / groupSubs.length) * 100) : 0;
                const pendingGroupSubs = groupSubs.filter(s => s.status === 'submitted' || s.status === 'under_review');
                
                return (
                  <div key={t.id || idx} onClick={() => onNavigate('/team')} className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-4 flex flex-col hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] relative overflow-hidden group cursor-pointer active:scale-[0.98]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-primary-container)] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-headline-md text-[20px] text-[var(--color-primary)]">{t.name}</h4>
                      <span className={`px-2 py-1 border ${isLeadOfGroup ? 'border-[var(--color-primary-container)] text-[var(--color-primary-container)]' : 'border-[var(--color-outline-variant)] text-[var(--color-secondary)]'} font-mono-data text-[10px] uppercase`}>
                        {isLeadOfGroup ? 'Lead' : 'Active'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 mb-6">
                      <div>
                        <p className="font-label-caps text-[10px] text-[var(--color-secondary)] uppercase">Participants</p>
                        <p className="font-mono-data text-[13px] text-[var(--color-primary)]">{members.length}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-[var(--color-secondary)] uppercase">Complete</p>
                        <p className="font-mono-data text-[13px] text-[var(--color-primary-container)]">{completionRate}%</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-[var(--color-secondary)] uppercase">Submissions</p>
                        <p className="font-mono-data text-[13px] text-[var(--color-primary)]">{groupSubs.length}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-[var(--color-secondary)] uppercase">Pending</p>
                        <p className={`font-mono-data text-[13px] ${pendingGroupSubs.length > 0 ? 'text-red-400' : 'text-[var(--color-primary)]'}`}>{pendingGroupSubs.length}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[var(--color-outline-variant)] flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {members.slice(0, 3).map(m => (
                          <img key={m.uid} src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} alt={m.name} className="w-6 h-6 rounded-none border border-[var(--color-background)] object-cover bg-black" />
                        ))}
                        {members.length > 3 && (
                          <div className="w-6 h-6 rounded-none border border-[var(--color-background)] bg-[var(--color-surface-variant)] flex items-center justify-center font-mono-data text-[10px] text-[var(--color-secondary)]">
                            +{members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">{groupCredits} CR</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Roster Section (Professional Member Table) */}
          <section className="mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-[var(--color-outline-variant)] pb-2 gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <h3 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase whitespace-nowrap">Team Roster</h3>
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text"
                    placeholder="FILTER PARTICIPANTS..." 
                    value={rosterFilter}
                    onChange={(e) => setRosterFilter(e.target.value)}
                    className="bg-[var(--color-background)] border border-[var(--color-outline-variant)] py-1.5 px-3 pl-8 font-mono-data text-[11px] uppercase w-full focus:border-[var(--color-primary-container)] focus:outline-none transition-colors placeholder:text-[var(--color-surface-variant)]"
                  />
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-[var(--color-secondary)]">filter_alt</span>
                </div>
              </div>
            </div>
            
            <div className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[var(--color-secondary)] font-label-caps text-[10px] uppercase tracking-wider">
                    <th className="p-3 font-normal">Participant</th>
                    <th className="p-3 font-normal">Role</th>
                    <th className="p-3 font-normal">Submissions</th>
                    <th className="p-3 font-normal">Credits</th>
                    <th className="p-3 font-normal">Completion</th>
                  </tr>
                </thead>
                <tbody className="font-mono-data text-[13px] text-[var(--color-on-surface)]">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[var(--color-secondary)]">No members found.</td>
                    </tr>
                  ) : (
                    filteredMembers.map(member => {
                      const memberSubs = submissions.filter((s) => s.userId === member.uid);
                      const approvedSubs = memberSubs.filter((s) => s.status === 'approved' || s.status === 'verified');
                      const completion = modules.length > 0 ? Math.round((approvedSubs.length / modules.length) * 100) : 0;
                      
                      return (
                        <tr key={member.uid} className="border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface)] hover:border-y hover:border-[var(--color-primary-container)] transition-colors group cursor-default">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} alt="" className="w-6 h-6 border border-[var(--color-outline-variant)] object-cover bg-[var(--color-surface-variant)] group-hover:border-[var(--color-primary-container)]" />
                              <div className="flex flex-col">
                                <span className="text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] transition-colors font-sans font-bold text-[14px]">{member.name}</span>
                                <span className="text-[10px] text-[var(--color-secondary)]">{member.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-[var(--color-secondary)] capitalize">{member.role.replace('_', ' ')}</td>
                          <td className="p-3">{memberSubs.length}</td>
                          <td className="p-3 text-[var(--color-primary-container)]">{member.credits || 0}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="w-8 text-right">{completion}%</span>
                              <div className="w-12 h-[2px] bg-[var(--color-surface-variant)] overflow-hidden"><div className="h-full bg-[var(--color-primary-container)] transition-all" style={{width: `${completion}%`}}></div></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          {/* Pending Reviews Queue */}
          <section className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center border-b border-[var(--color-outline-variant)] pb-2 mb-4">
              <h3 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase">Pending Reviews</h3>
              <span className="font-mono-data text-[10px] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] px-2 py-0.5 uppercase font-bold">{pendingReviews.length} Queue</span>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
              {pendingReviews.length === 0 ? (
                <div className="text-center text-[var(--color-secondary)] font-mono-data text-[12px] py-10 opacity-70">
                  <span className="material-symbols-outlined text-4xl mb-2 block text-[var(--color-surface-variant)]">done_all</span>
                  No pending reviews
                </div>
              ) : (
                pendingReviews.map((sub, idx) => {
                  const submitter = users.find((u) => u.uid === sub.userId);
                  const isLast = idx === pendingReviews.length - 1;
                  
                  return (
                    <React.Fragment key={sub.id}>
                      <div className="flex gap-3 items-start group">
                        <div className="w-2 h-2 mt-1.5 rounded-none bg-[var(--color-surface-variant)] border border-[var(--color-outline-variant)] shrink-0 group-hover:border-[var(--color-primary-container)] transition-colors"></div>
                        <div className="flex-1">
                          <p className="font-body-sm text-[14px] text-[var(--color-primary)] leading-tight mb-1">
                            <span className="font-bold">{submitter?.name || 'User'}</span> submitted <span className="font-mono-data text-[12px] text-[var(--color-primary-container)] cursor-pointer hover:underline" onClick={() => setSelectedSubForReview(sub)}>{sub.title}</span>
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="font-mono-data text-[10px] text-[var(--color-secondary)] uppercase">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </p>
                            <button 
                              onClick={() => setSelectedSubForReview(sub)}
                              className="px-2 py-1 border border-[var(--color-outline-variant)] text-[10px] font-mono-data uppercase text-[var(--color-primary)] hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      </div>
                      {!isLast && <div className="h-px w-full bg-[var(--color-outline-variant)] opacity-50"></div>}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubForReview && (
        <ReviewModal
          isOpen={Boolean(selectedSubForReview)}
          onClose={() => setSelectedSubForReview(null)}
          submission={selectedSubForReview}
          module={modules.find((m) => m.id === selectedSubForReview.moduleId)}
          submitter={users.find((u) => u.uid === selectedSubForReview.userId)}
          isAdminReview={false}
          onConfirmAction={handleConfirmReview}
        />
      )}

      {/* Create Module Modal */}
      {onCreateModule && (
        <CreateModuleModal
          isOpen={isCreateModuleOpen}
          onClose={() => setIsCreateModuleOpen(false)}
          teams={teams}
          onCreateModule={onCreateModule}
        />
      )}

      {/* Create Group Modal */}
      {onCreateGroup && userProfile && (
        <CreateGroupModal
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
          users={users}
          currentUserId={userProfile.uid}
          onCreateGroup={onCreateGroup}
        />
      )}
    </div>
  );
};
