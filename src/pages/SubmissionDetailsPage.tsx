import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Submission, Module, User, Team } from '../types';
import { Timeline } from '../components/common/Timeline';
import { ReviewModal } from '../components/common/ReviewModal';

interface SubmissionDetailsPageProps {
  submissionId: string;
  submissions: Submission[];
  modules: Module[];
  users: User[];
  teams: Team[];
  onNavigate: (path: string) => void;
  onVerifySubmission?: (submissionId: string, reviewerId: string, comment?: string) => Promise<void>;
  onApproveSubmission?: (submissionId: string, adminId: string, comment?: string) => Promise<void>;
  onRejectSubmission?: (submissionId: string, reviewerId: string, comment: string) => Promise<void>;
}

export const SubmissionDetailsPage: React.FC<SubmissionDetailsPageProps> = ({
  submissionId,
  submissions,
  modules,
  users,
  teams,
  onNavigate,
  onVerifySubmission,
  onApproveSubmission,
  onRejectSubmission,
}) => {
  const { userProfile, role } = useAuth();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const submission = submissions.find((s) => s.id === submissionId);
  if (!submission) {
    return (
      <div className="p-8 text-center text-[var(--color-secondary)] font-mono-data space-y-4">
        <p>Submission record not found or has been removed.</p>
        <button
          onClick={() => onNavigate('/submissions')}
          className="px-4 py-2 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-primary-container)] rounded text-[12px] font-bold"
        >
          Return to Submissions
        </button>
      </div>
    );
  }

  const module = modules.find((m) => m.id === submission.moduleId);
  const submitter = users.find((u) => u.uid === submission.userId);
  const team = teams.find((t) => t.id === submission.teamId);

  const canTeamLeadReview =
    role === 'team_lead' && (submission.status === 'submitted' || submission.status === 'under_review');
  const canAdminApprove = role === 'admin' && submission.status === 'verified';

  const handleConfirmAction = async (action: 'verify' | 'approve' | 'reject', comment: string) => {
    if (!userProfile) return;
    if (action === 'verify' && onVerifySubmission) {
      await onVerifySubmission(submission.id, userProfile.uid, comment);
    } else if (action === 'approve' && onApproveSubmission) {
      await onApproveSubmission(submission.id, userProfile.uid, comment);
    } else if (action === 'reject' && onRejectSubmission) {
      await onRejectSubmission(submission.id, userProfile.uid, comment);
    }
  };

  const renderStatusBadge = () => {
    switch (submission.status) {
      case 'approved':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-green-400/10 text-green-400 font-label-caps text-[12px] border border-green-400/20 uppercase">
            APPROVED
          </div>
        );
      case 'verified':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-blue-400/10 text-blue-400 font-label-caps text-[12px] border border-blue-400/20 uppercase">
            VERIFIED
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-red-400/10 text-red-400 font-label-caps text-[12px] border border-red-400/20 uppercase">
            REJECTED
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-yellow-400/10 text-yellow-400 font-label-caps text-[12px] border border-yellow-400/20 uppercase">
            UNDER REVIEW
          </div>
        );
    }
  };

  return (
    <div className="flex-1 w-full max-w-max-content-width mx-auto">
      {/* Top Navigation / Breadcrumbs */}
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="flex text-[var(--color-secondary)] font-body-sm text-[14px]">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={() => onNavigate(-1 as any)} className="inline-flex items-center hover:text-[var(--color-primary)] transition-colors">
                Submissions
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                <span className="text-[var(--color-primary)] font-bold ml-1 md:ml-2">SUB-{submission.id.substring(0, 4)}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[var(--color-outline-variant)] pb-6">
        <div>
          <h1 className="font-headline-lg text-[32px] text-[var(--color-primary)] mb-2 font-bold tracking-tighter">{submission.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-[var(--color-secondary)] font-body-sm text-[14px]">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">folder</span> {module?.title || 'Unknown Module'}</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> {submitter?.name}, {team?.name || 'Independent'}</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusBadge()}
          
          {(canTeamLeadReview || canAdminApprove) && (
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-4 py-2 rounded font-label-caps text-[12px] uppercase hover:bg-[var(--color-inverse-surface)] transition-colors"
            >
              Review Code
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Repository Card */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:shadow-sm transition-shadow">
            <h2 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">code</span> Repository details
            </h2>
            <div className="bg-[var(--color-surface-container)] p-4 rounded border border-[var(--color-outline-variant)] font-technical-data text-[13px] text-[var(--color-primary)] flex justify-between items-center group">
              <span className="truncate mr-4">{submission.githubUrl}</span>
              <a 
                href={submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors opacity-0 group-hover:opacity-100 flex items-center"
                title="Open Repository"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </a>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:shadow-sm transition-shadow">
            <h2 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">description</span> Project Description
            </h2>
            <div className="prose prose-sm prose-slate max-w-none font-body-md text-[16px] text-[var(--color-on-surface-variant)] leading-relaxed">
              <p>{submission.description}</p>
            </div>
          </div>

          {/* Timeline / Review History */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:shadow-sm transition-shadow">
            <h2 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">history</span> Verification Timeline
            </h2>
            <Timeline submission={submission} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Checklist Card */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6 hover:shadow-sm transition-shadow">
            <h3 className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-4 uppercase font-bold tracking-wider">Verification Checklist</h3>
            <ul className="space-y-3 font-body-sm text-[14px] text-[var(--color-on-surface-variant)]">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                <span>Repository is public and accessible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                <span>Includes README.md with setup instructions</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm mt-0.5">radio_button_unchecked</span>
                <span>Passes automated linting</span>
              </li>
              <li className="flex items-start gap-3 opacity-50">
                <span className="material-symbols-outlined text-[var(--color-secondary)] text-sm mt-0.5">radio_button_unchecked</span>
                <span>Core functionality covered by tests</span>
              </li>
            </ul>
          </div>

          {/* Admin Action Card */}
          {(canTeamLeadReview || canAdminApprove) && (
            <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-primary-container)] rounded-lg p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-primary-container)]/10 rounded-bl-full -z-10"></div>
              <h3 className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-4 uppercase font-bold tracking-wider">Reviewer Actions</h3>
              <p className="font-body-sm text-[14px] text-[var(--color-on-surface-variant)] mb-4">
                Ready for {role === 'admin' ? 'final approval' : 'verification'} to proceed.
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] py-2 px-4 rounded hover:opacity-90 transition-colors flex items-center justify-center gap-2 font-bold uppercase border border-[var(--color-primary-container)]"
                >
                  <span className="material-symbols-outlined text-[16px]">rule</span> 
                  {role === 'admin' ? 'Approve Submission' : 'Verify Submission'}
                </button>
              </div>
            </div>
          )}
          
          {/* Credit Info */}
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-6">
            <h4 className="font-label-caps text-[12px] text-[var(--color-primary-container)] mb-2 uppercase tracking-wider font-bold">Credit Distribution</h4>
            <p className="text-[14px] text-[var(--color-secondary)] font-body-sm">
              Upon final Admin approval, <strong>+{module?.creditValue || 100} PTS</strong> are credited to the participant, and <strong>+25 PTS</strong> bonus is credited to the Team Lead.
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          submission={submission}
          module={module}
          submitter={submitter}
          isAdminReview={role === 'admin'}
          onConfirmAction={handleConfirmAction}
        />
      )}
    </div>
  );
};
