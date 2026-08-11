import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Module, Submission, User, Team } from '../types';
import { ReviewModal } from '../components/common/ReviewModal';
import { CreateModuleModal } from '../components/common/CreateModuleModal';
import { StatusBadge } from '../components/common/StatusBadge';

interface AdminDashboardProps {
  modules: Module[];
  submissions: Submission[];
  users: User[];
  teams: Team[];
  onNavigate: (path: string) => void;
  onApproveSubmission: (submissionId: string, adminId: string, comment?: string) => Promise<void>;
  onVerifySubmission?: (submissionId: string, reviewerId: string, comment?: string) => Promise<void>;
  onRejectSubmission: (submissionId: string, adminId: string, comment: string) => Promise<void>;
  onAdjustUserCredits: (userId: string, newCredits: number, reason: string) => Promise<void>;
  onCreateModule?: (moduleData: Omit<Module, 'id' | 'createdAt'>) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  modules,
  submissions,
  users,
  teams,
  onNavigate,
  onApproveSubmission,
  onVerifySubmission,
  onRejectSubmission,
  onAdjustUserCredits,
  onCreateModule,
}) => {
  const { userProfile } = useAuth();
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [selectedUserIdForCredits, setSelectedUserIdForCredits] = useState('');
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState(100);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Submissions requiring Admin Approval / Review
  const pendingAdminApprovals = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'under_review' || s.status === 'verified'
  );
  const totalApproved = submissions.filter((s) => s.status === 'approved').length;
  const totalCreditsAllocated = users.reduce((acc, curr) => acc + (curr.credits || 0), 0);
  const activeModules = modules.length; // Can be filtered if there's an active status

  const handleConfirmReview = async (
    action: 'verify' | 'approve' | 'reject',
    comment: string
  ) => {
    if (!selectedSubForReview || !userProfile) return;
    if (action === 'approve') {
      await onApproveSubmission(selectedSubForReview.id, userProfile.uid, comment);
    } else if (action === 'verify' && onVerifySubmission) {
      await onVerifySubmission(selectedSubForReview.id, userProfile.uid, comment);
    } else if (action === 'reject') {
      await onRejectSubmission(selectedSubForReview.id, userProfile.uid, comment);
    }
    setSelectedSubForReview(null);
  };

  const handleExecuteCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdForCredits) return;
    const targetUser = users.find((u) => u.uid === selectedUserIdForCredits);
    if (!targetUser) return;

    try {
      setAdjusting(true);
      const newTotal = targetUser.credits + Number(creditAdjustmentAmount);
      await onAdjustUserCredits(selectedUserIdForCredits, newTotal, adjustmentReason);
      setAdjusting(false);
      setShowAdjustModal(false);
      setAdjustmentReason('');
    } catch (err) {
      console.error(err);
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-[32px] text-[var(--color-primary)]">Admin Dashboard</h1>
          <p className="text-[var(--color-secondary)] font-mono-data text-[13px] mt-2">Platform overview, verification activity, users, and credits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAdjustModal(true)}
            className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-primary)] hover:border-[var(--color-primary-container)] transition-all duration-300 px-4 py-2 font-label-caps text-[12px] uppercase rounded active:scale-95"
          >
            Grant Credits
          </button>
          {onCreateModule && (
            <button 
              onClick={() => setIsCreateModuleOpen(true)}
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] px-4 py-2 font-label-caps text-[12px] uppercase flex items-center gap-2 rounded hover:bg-[var(--color-primary-fixed)] transition-all duration-300 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300">add</span> Create Module
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-5 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] flex flex-col justify-between h-32 rounded-lg relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">Pending Approvals</span>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:scale-110 transition-transform duration-300">pending_actions</span>
          </div>
          <div className="relative z-10">
            <div className="font-headline-lg text-[32px] text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-transform duration-300">{pendingAdminApprovals.length}</div>
            <div className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1">Awaiting admin review</div>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-5 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] flex flex-col justify-between h-32 rounded-lg relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">Total Users</span>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:scale-110 transition-transform duration-300">group</span>
          </div>
          <div className="relative z-10">
            <div className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{users.length}</div>
            <div className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1"><span className="text-green-400">System Wide</span></div>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-5 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] flex flex-col justify-between h-32 rounded-lg relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">Distributed Credits</span>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:scale-110 transition-transform duration-300">toll</span>
          </div>
          <div className="relative z-10">
            <div className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{totalCreditsAllocated}</div>
            <div className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1">Across all participants</div>
          </div>
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-5 hover:border-[var(--color-primary-container)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] flex flex-col justify-between h-32 rounded-lg relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="font-mono-data text-[13px] text-[var(--color-secondary)] uppercase">Active Modules</span>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:scale-110 transition-transform duration-300">extension</span>
          </div>
          <div className="relative z-10">
            <div className="font-headline-lg text-[32px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-105 origin-left transition-all duration-300">{activeModules}</div>
            <div className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1"><span className="text-[var(--color-primary-container)]">{totalApproved}</span> total approved work</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Left (Queue) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--color-outline-variant)] flex justify-between items-center bg-[var(--color-surface-container-low)]">
              <h2 className="font-label-caps text-[12px] text-[var(--color-primary)] uppercase tracking-widest">Verification Queue</h2>
              <button 
                onClick={() => onNavigate('/submissions')}
                className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] flex items-center gap-1 font-mono-data text-[10px] uppercase transition-colors group"
              >
                View All <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-[14px]">
                <thead className="bg-[var(--color-surface-container-lowest)] text-[var(--color-secondary)] font-mono-data text-[11px] uppercase tracking-wider border-b border-[var(--color-outline-variant)]">
                  <tr>
                    <th className="px-4 py-3 font-normal">Submission</th>
                    <th className="px-4 py-3 font-normal">Participant</th>
                    <th className="px-4 py-3 font-normal">Module</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAdminApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center font-mono-data text-[13px] text-[var(--color-secondary)] border-b border-[var(--color-outline-variant)]">
                        No submissions in the verification queue.
                      </td>
                    </tr>
                  ) : (
                    pendingAdminApprovals.map((sub) => {
                      const module = modules.find((m) => m.id === sub.moduleId);
                      const submitter = users.find((u) => u.uid === sub.userId);
                      return (
                        <tr key={sub.id} className="border-b border-[var(--color-outline-variant)] hover:border-b-[var(--color-primary-container)] hover:border-t hover:border-t-[var(--color-primary-container)] hover:-mt-[1px] transition-colors bg-[var(--color-surface-container)]">
                          <td className="px-4 py-4">
                            <div className="font-medium text-[var(--color-primary)]">{sub.title}</div>
                            <div className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-[var(--color-primary)]">{submitter?.name || 'User'}</div>
                            <div className="font-mono-data text-[10px] text-[var(--color-secondary)] mt-1">
                              {teams.find(t => t.id === submitter?.teamId)?.name || 'No Team'}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-mono-data text-[13px] text-[var(--color-secondary)]">
                            {module?.title?.split('—')[0] || 'Module'}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={sub.status} />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button 
                              onClick={() => setSelectedSubForReview(sub)}
                              className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] hover:border-[var(--color-primary-container)] text-[var(--color-primary)] px-3 py-1 font-mono-data text-[11px] uppercase mr-2 rounded transition-colors"
                            >
                              Review
                            </button>
                            <button 
                              onClick={() => onNavigate(`/submission/${sub.id}`)}
                              className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 h-fit">
          <button 
            onClick={() => setIsCreateModuleOpen(true)}
            className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] flex flex-col items-center justify-center gap-2 text-center h-24 group transition-all duration-300 rounded-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-110 transition-all duration-300 relative z-10">extension</span>
            <span className="font-label-caps text-[10px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] uppercase tracking-wider relative z-10">Create Module</span>
          </button>
          <button 
            onClick={() => setShowAdjustModal(true)}
            className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] flex flex-col items-center justify-center gap-2 text-center h-24 group transition-all duration-300 rounded-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-110 transition-all duration-300 relative z-10">toll</span>
            <span className="font-label-caps text-[10px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] uppercase tracking-wider relative z-10">Grant Credits</span>
          </button>
          <button 
            onClick={() => onNavigate('/admin/users')}
            className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] flex flex-col items-center justify-center gap-2 text-center h-24 group transition-all duration-300 rounded-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-110 transition-all duration-300 relative z-10">manage_accounts</span>
            <span className="font-label-caps text-[10px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] uppercase tracking-wider relative z-10">Manage Users</span>
          </button>
          <button 
            onClick={() => onNavigate('/submissions')}
            className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] p-4 hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] flex flex-col items-center justify-center gap-2 text-center h-24 group transition-all duration-300 rounded-lg hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,234,0,0.05)] active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-container)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <span className="material-symbols-outlined text-[var(--color-secondary)] group-hover:text-[var(--color-primary-container)] group-hover:scale-110 transition-all duration-300 relative z-10">rule</span>
            <span className="font-label-caps text-[10px] text-[var(--color-primary)] group-hover:text-[var(--color-primary-container)] uppercase tracking-wider relative z-10">All Submissions</span>
          </button>
        </div>
      </div>

      {/* Bonus Credits Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-1">
              Grant Manual Credits
            </h3>
            <p className="font-mono-data text-[13px] text-[var(--color-secondary)] mb-5">
              Directly award or adjust participant / team lead credits
            </p>

            <form onSubmit={handleExecuteCreditAdjustment} className="space-y-4">
              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  Select Target User
                </label>
                <select
                  value={selectedUserIdForCredits}
                  onChange={(e) => setSelectedUserIdForCredits(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.role.replace('_', ' ')}) · Current: {u.credits} PTS
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  Credits to Add (+ PTS)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                  required
                />
              </div>

              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  Reason / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Winner of bonus lightning challenge"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded font-label-caps text-[12px] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] font-bold hover:bg-[var(--color-primary-fixed)] transition-colors"
                >
                  {adjusting ? 'ADJUSTING...' : 'CONFIRM CREDIT AWARD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedSubForReview && (
        <ReviewModal
          isOpen={Boolean(selectedSubForReview)}
          onClose={() => setSelectedSubForReview(null)}
          submission={selectedSubForReview}
          module={modules.find((m) => m.id === selectedSubForReview.moduleId)}
          submitter={users.find((u) => u.uid === selectedSubForReview.userId)}
          isAdminReview={true}
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
    </div>
  );
};
