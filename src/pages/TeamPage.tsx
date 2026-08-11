import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Team, User, Submission, Module } from '../types';
import { CreateGroupModal } from '../components/common/CreateGroupModal';

interface TeamPageProps {
  teams: Team[];
  users: User[];
  submissions: Submission[];
  modules: Module[];
  onNavigate: (path: string) => void;
  onCreateGroup?: (groupData: { name: string; memberIds: string[] }) => Promise<void>;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  teams,
  users,
  submissions,
  modules,
  onNavigate,
  onCreateGroup,
}) => {
  const { userProfile, role } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isTeamSwitcherOpen, setIsTeamSwitcherOpen] = useState(false);
  const [rosterFilter, setRosterFilter] = useState('');

  const canCreateGroup = (role === 'team_lead' || role === 'admin') && Boolean(onCreateGroup);

  // Default team selection
  const myTeams = teams.filter((t) => t.teamLeadId === userProfile?.uid);
  const myTeam = myTeams[0] || teams.find((t) => t.id === userProfile?.teamId) || teams[0];
  const activeTeam = teams.find((t) => t.id === selectedTeamId) || myTeam || teams[0];

  const teamLead = users.find((u) => u.uid === activeTeam?.teamLeadId);
  const teamMembers = users.filter((u) => u.teamId === activeTeam?.id);

  const teamSubmissions = submissions.filter((s) => s.teamId === activeTeam?.id);
  const totalTeamCredits = teamMembers.reduce((a, b) => a + (b.credits || 0), 0);
  
  const approvedTeamSubs = teamSubmissions.filter((s) => s.status === 'approved' || s.status === 'verified');
  const completionRate = teamSubmissions.length > 0 ? Math.round((approvedTeamSubs.length / teamSubmissions.length) * 100) : 0;
  
  const filteredMembers = teamMembers.filter(m => m.name.toLowerCase().includes(rosterFilter.toLowerCase()) || m.email.toLowerCase().includes(rosterFilter.toLowerCase()));

  // Get top 3 members by credits
  const topNodes = [...teamMembers].sort((a, b) => (b.credits || 0) - (a.credits || 0)).slice(0, 3);

  return (
    <div className="space-y-8 flex-1 overflow-y-auto">
      {/* Page Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-[var(--color-outline-variant)] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 relative">
            <h2 className="font-headline-lg text-[32px] font-bold uppercase tracking-tighter text-[var(--color-primary)]">
              {activeTeam?.name || 'Team Workspace'}
            </h2>
            
            {/* Compact Team Selector Dropdown */}
            {teams.length > 1 && (
              <div className="relative">
                <button 
                  onClick={() => setIsTeamSwitcherOpen(!isTeamSwitcherOpen)}
                  className="flex items-center gap-1 border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-2 py-1 hover:border-[var(--color-primary-container)] transition-colors group"
                >
                  <span className="font-mono-data text-[13px] uppercase group-hover:text-[var(--color-primary-container)] text-[var(--color-primary)]">Switch</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:text-[var(--color-primary-container)] text-[var(--color-primary)]">expand_more</span>
                </button>
                
                {isTeamSwitcherOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] shadow-lg z-50">
                    {teams.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => {
                          setSelectedTeamId(t.id);
                          setIsTeamSwitcherOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 font-mono-data text-[13px] uppercase hover:bg-[var(--color-surface-container-high)] ${t.id === activeTeam?.id ? 'text-[var(--color-primary-container)]' : 'text-[var(--color-secondary)]'}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">
            {teamMembers.length} participants · {totalTeamCredits} credits · Led by {teamLead?.name || 'System'}
          </p>
        </div>
        
        <div className="flex gap-4">
          {canCreateGroup && (
            <>
              <button 
                onClick={() => {}}
                className="px-6 py-2 border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-primary)] font-label-caps text-[12px] uppercase hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors"
              >
                Team Settings
              </button>
              <button 
                onClick={() => setIsCreateGroupOpen(true)}
                className="px-6 py-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] uppercase border border-[var(--color-primary-container)] hover:bg-[var(--color-primary-fixed)] hover:border-[var(--color-primary-fixed)] transition-colors flex items-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Group
              </button>
            </>
          )}
        </div>
      </div>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] transition-colors">
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2">Total Members</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-[24px] text-[var(--color-primary)]">{teamMembers.length}</span>
            <span className="font-mono-data text-[13px] text-[var(--color-on-surface-variant)] uppercase">Active participants</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] transition-colors">
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2">Total Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-[24px] text-[var(--color-primary)]">{teamSubmissions.length}</span>
            <span className="font-mono-data text-[13px] text-[var(--color-on-surface-variant)] uppercase">Across all modules</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] transition-colors">
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2">Team Credits</p>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-[24px] text-[var(--color-primary-container)]">{totalTeamCredits}</span>
            <span className="material-symbols-outlined text-[var(--color-primary-container)] text-[18px]">bolt</span>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] transition-colors">
          <p className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase mb-2">Completion Rate</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-headline-md text-[24px] text-[var(--color-primary)]">{completionRate}%</span>
            <div className="flex-1 h-1 bg-[var(--color-surface-variant)]">
              <div className="h-full bg-[var(--color-primary-container)] transition-all" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Primary Column (Span 8) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          
          {/* Roster Section (Professional Member Table) */}
          <section>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-[var(--color-outline-variant)] pb-2 gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <h3 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase whitespace-nowrap">Team Roster</h3>
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text"
                    placeholder="FILTER PARTICIPANTS..." 
                    value={rosterFilter}
                    onChange={(e) => setRosterFilter(e.target.value)}
                    className="bg-[var(--color-background)] border border-[var(--color-outline-variant)] py-1 px-3 pl-8 font-mono-data text-[11px] uppercase w-full focus:border-[var(--color-primary-container)] focus:outline-none transition-colors placeholder:text-[var(--color-surface-variant)]"
                  />
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-[var(--color-secondary)]">filter_alt</span>
                </div>
              </div>
            </div>
            
            <div className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[var(--color-secondary)] font-label-caps text-[10px] uppercase tracking-wider">
                    <th className="p-3 font-normal">Participant</th>
                    <th className="p-3 font-normal">Role</th>
                    <th className="p-3 font-normal">Modules</th>
                    <th className="p-3 font-normal">Credits</th>
                    <th className="p-3 font-normal">Completion</th>
                    <th className="p-3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono-data text-[13px] text-[var(--color-on-surface)]">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[var(--color-secondary)]">No members found.</td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const isLead = member.uid === activeTeam?.teamLeadId;
                      const memberSubs = submissions.filter((s) => s.userId === member.uid);
                      const approvedSubs = memberSubs.filter((s) => s.status === 'approved' || s.status === 'verified');
                      const completion = modules.length > 0 ? Math.round((approvedSubs.length / modules.length) * 100) : 0;
                      
                      const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                      return (
                        <tr key={member.uid} className="border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface)] hover:border-y hover:border-[var(--color-primary-container)] transition-colors group cursor-default">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border border-[var(--color-outline-variant)] bg-[var(--color-surface-variant)] flex items-center justify-center group-hover:border-[var(--color-primary-container)]">
                                <span className="text-[10px]">{initials}</span>
                              </div>
                              <span className="text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] transition-colors">{member.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-[var(--color-secondary)] capitalize">{isLead ? 'Lead' : member.role.replace('_', ' ')}</td>
                          <td className="p-3">{approvedSubs.length}/{modules.length}</td>
                          <td className="p-3 text-[var(--color-primary-container)]">{member.credits || 0}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="w-8 text-right">{completion}%</span>
                              <div className="w-12 h-[2px] bg-[var(--color-surface-variant)] overflow-hidden">
                                <div className="h-full bg-[var(--color-primary-container)] transition-all" style={{width: `${completion}%`}}></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 border border-[var(--color-primary-container)] text-[var(--color-primary-container)] text-[10px] uppercase">Active</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {filteredMembers.length > 0 && (
                <div className="flex justify-between items-center p-3 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] font-mono-data text-[11px] uppercase">
                  <span className="text-[var(--color-secondary)]">Showing {filteredMembers.length} members</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Secondary Column (Span 4) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          {/* Team Activity Feed */}
          <section className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 flex-1">
            <h3 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase border-b border-[var(--color-outline-variant)] pb-2 mb-4">Activity Stream</h3>
            <div className="flex flex-col gap-4">
              {teamSubmissions.length === 0 ? (
                <div className="text-center text-[var(--color-secondary)] font-body-sm text-[14px] mt-4">
                  No recent activity in this group.
                </div>
              ) : (
                teamSubmissions.slice(0, 5).map((sub, idx) => {
                  const submitter = users.find((u) => u.uid === sub.userId);
                  const isLast = idx === Math.min(teamSubmissions.length, 5) - 1;
                  
                  return (
                    <React.Fragment key={sub.id}>
                      <div className="flex gap-3 items-start group">
                        <div className={`w-2 h-2 mt-1.5 rounded-none shrink-0 ${sub.status === 'approved' ? 'bg-[var(--color-primary-container)] shadow-[0_0_8px_rgba(234,234,0,0.5)]' : 'bg-[var(--color-surface-variant)] border border-[var(--color-outline-variant)] group-hover:border-[var(--color-primary-container)] transition-colors'}`}></div>
                        <div>
                          <p className="font-body-sm text-[14px] text-[var(--color-primary)] leading-tight cursor-pointer hover:underline" onClick={() => onNavigate(`/submission/${sub.id}`)}>
                            <span className="font-bold">{submitter?.name}</span> {sub.status === 'approved' ? 'completed module' : 'submitted code for review'} <span className="font-mono-data text-[12px] text-[var(--color-primary-container)]">{sub.title}</span>
                          </p>
                          <p className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1 uppercase">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!isLast && <div className="h-px w-full bg-[var(--color-outline-variant)] opacity-50"></div>}
                    </React.Fragment>
                  );
                })
              )}
            </div>
            {teamSubmissions.length > 5 && (
              <button className="w-full mt-6 py-2 border border-[var(--color-outline-variant)] font-mono-data text-[13px] text-[var(--color-secondary)] uppercase hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors">
                Load More Log Data
              </button>
            )}
          </section>

          {/* Team Leaderboard (Top Participants) */}
          <section className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4">
            <div className="flex justify-between items-center border-b border-[var(--color-outline-variant)] pb-2 mb-4">
              <h3 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase">Top Nodes</h3>
              <span className="font-mono-data text-[10px] text-[var(--color-secondary)] uppercase">By Credits</span>
            </div>
            <div className="flex flex-col gap-3">
              {topNodes.map((member, idx) => {
                const isFirst = idx === 0;
                const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return (
                  <div key={member.uid} className={`flex items-center justify-between p-2 border ${isFirst ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container)]' : 'border-[var(--color-outline-variant)] hover:border-[var(--color-primary-container)] transition-colors group'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono-data text-[14px] ${isFirst ? 'text-[var(--color-primary-container)]' : 'text-[var(--color-secondary)] group-hover:text-[var(--color-primary-container)] transition-colors'}`}>
                        0{idx + 1}
                      </span>
                      <div className={`w-6 h-6 bg-[var(--color-surface)] border ${isFirst ? 'border-[var(--color-primary-container)]' : 'border-[var(--color-outline-variant)] group-hover:border-[var(--color-primary-container)]'} flex items-center justify-center transition-colors`}>
                        <span className={`font-mono-data text-[10px] ${isFirst ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)] group-hover:text-[var(--color-primary)]'} transition-colors`}>
                          {initials}
                        </span>
                      </div>
                      <span className="font-body-sm text-[14px] text-[var(--color-primary)]">{member.name}</span>
                    </div>
                    <span className={`font-mono-data text-[13px] ${isFirst ? 'text-[var(--color-primary-container)]' : 'text-[var(--color-secondary)] group-hover:text-[var(--color-primary-container)] transition-colors'}`}>
                      {member.credits || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Create Group Modal */}
      {canCreateGroup && onCreateGroup && userProfile && (
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
