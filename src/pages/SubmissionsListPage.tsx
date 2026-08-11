import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Submission, Module, User, Team } from '../types';
import { SubmissionModal } from '../components/common/SubmissionModal';

interface SubmissionsListPageProps {
  submissions: Submission[];
  modules: Module[];
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

export const SubmissionsListPage: React.FC<SubmissionsListPageProps> = ({
  submissions,
  modules,
  users,
  teams,
  onNavigate,
  onSubmitWork,
}) => {
  const { userProfile, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // If user is participant, they should probably only see their own submissions or their team's
  let visibleSubmissions = submissions;
  if (role === 'participant') {
    visibleSubmissions = submissions.filter((sub) => sub.userId === userProfile?.uid);
  } else if (role === 'team_lead') {
    // Lead sees their team's submissions
    const myTeams = teams.filter((t) => t.teamLeadId === userProfile?.uid);
    visibleSubmissions = submissions.filter((sub) => 
      myTeams.some(t => t.id === sub.teamId) || sub.userId === userProfile?.uid
    );
  }

  const filteredSubmissions = visibleSubmissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.githubUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mySubmissionsCount = visibleSubmissions.length;
  const underReviewCount = visibleSubmissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;
  const verifiedCount = visibleSubmissions.filter(s => s.status === 'verified').length;
  const approvedCount = visibleSubmissions.filter(s => s.status === 'approved').length;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="font-label-caps text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit uppercase">
            <span className="material-symbols-outlined text-[12px]">check_circle</span> Approved
          </span>
        );
      case 'verified':
        return (
          <span className="font-label-caps text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit uppercase">
            <span className="material-symbols-outlined text-[12px]">verified</span> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="font-label-caps text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit uppercase">
            <span className="material-symbols-outlined text-[12px]">error</span> Rejected
          </span>
        );
      default:
        return (
          <span className="font-label-caps text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit uppercase">
            <span className="material-symbols-outlined text-[12px]">pending</span> Under Review
          </span>
        );
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-outline-variant)] pb-6">
        <div>
          <h2 className="font-headline-lg text-[32px] text-[var(--color-primary)] mb-2 uppercase font-bold tracking-tighter">Submissions</h2>
          <p className="font-body-md text-[16px] text-[var(--color-secondary)]">Track project submissions, verification, and approval status.</p>
        </div>
        <button
          onClick={() => onNavigate('/modules')}
          className="px-6 py-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] uppercase border border-[var(--color-primary-container)] hover:bg-[var(--color-primary-fixed)] transition-colors flex items-center gap-2 font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          New Submission
        </button>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-4 hover:border-[var(--color-outline)] transition-colors group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--color-surface-container-low)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">Total Submissions</span>
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)]">{mySubmissionsCount}</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-4 hover:border-yellow-400/50 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400/20"></div>
          <div className="relative z-10 flex flex-col">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">Under Review</span>
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)]">{underReviewCount}</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-4 hover:border-blue-400/50 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-400/20"></div>
          <div className="relative z-10 flex flex-col">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">Verified</span>
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)]">{verifiedCount}</span>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-4 hover:border-green-400/50 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-green-400/20"></div>
          <div className="relative z-10 flex flex-col">
            <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-2 uppercase">Approved</span>
            <span className="font-headline-lg text-[32px] text-[var(--color-primary)]">{approvedCount}</span>
          </div>
        </div>
      </section>

      {/* Data Table Section */}
      <section className="flex flex-col flex-1 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg overflow-hidden shadow-sm min-h-[400px]">
        {/* Table Header Actions */}
        <div className="p-4 border-b border-[var(--color-outline-variant)] flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--color-surface)] gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] py-1.5 px-3 pl-8 font-mono-data text-[11px] uppercase focus:border-[var(--color-primary-container)] focus:outline-none transition-colors placeholder:text-[var(--color-surface-variant)]"
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-[var(--color-secondary)]">search</span>
          </div>
          
          <div className="flex gap-2 relative w-full sm:w-auto">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-3 py-1.5 border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[12px] font-mono-data uppercase text-[var(--color-primary)] hover:border-[var(--color-primary-container)] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
            
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] shadow-lg z-50 flex flex-col">
                {['all', 'submitted', 'under_review', 'verified', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setIsFilterOpen(false);
                    }}
                    className={`text-left px-3 py-2 font-mono-data text-[11px] uppercase hover:bg-[var(--color-surface-container-high)] ${statusFilter === st ? 'text-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'text-[var(--color-secondary)]'}`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
                <th className="py-3 px-4 font-label-caps text-[10px] text-[var(--color-secondary)] uppercase tracking-wider w-1/3">Submission</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-[var(--color-secondary)] uppercase tracking-wider w-1/6">Module</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-[var(--color-secondary)] uppercase tracking-wider w-1/6">Status</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-[var(--color-secondary)] uppercase tracking-wider w-1/6">Credits</th>
                <th className="py-3 px-4 font-label-caps text-[10px] text-[var(--color-secondary)] uppercase tracking-wider w-1/6 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="font-mono-data text-[13px]">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-[var(--color-secondary)] border-b border-[var(--color-outline-variant)]">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const module = modules.find((m) => m.id === sub.moduleId);
                  const submitter = users.find((u) => u.uid === sub.userId);
                  
                  return (
                    <tr 
                      key={sub.id} 
                      onClick={() => onNavigate(`/submission/${sub.id}`)}
                      className="border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container)] hover:border-y hover:border-[var(--color-primary-container)] transition-colors h-16 group cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-[14px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] transition-colors truncate max-w-[300px]">{sub.title}</span>
                          <span className="text-[11px] text-[var(--color-secondary)] truncate max-w-[300px]">
                            {role !== 'participant' ? `By ${submitter?.name}` : sub.githubUrl}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] font-label-caps text-[10px] uppercase px-2 py-1 rounded truncate max-w-[150px] inline-block border border-[var(--color-outline-variant)]">
                          {module?.title.split('—')[0]?.trim() || module?.title || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(sub.status)}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-primary)]">
                        {sub.status === 'approved' ? (sub.userCreditsAwarded || module?.creditValue || 0) : '-'} CR
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--color-secondary)]">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        modules={modules}
        teams={teams}
        userTeamId={userProfile?.teamId}
        onSubmit={onSubmitWork}
      />
    </div>
  );
};
