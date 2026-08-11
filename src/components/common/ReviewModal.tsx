import React, { useState } from 'react';
import { Submission, Module, User } from '../../types';
import { ExternalLink, CheckCircle, XCircle, ShieldCheck, X, Loader2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  module?: Module;
  submitter?: User;
  isAdminReview?: boolean;
  onConfirmAction: (action: 'verify' | 'approve' | 'reject', comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  submission,
  module,
  submitter,
  isAdminReview = false,
  onConfirmAction,
}) => {
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'approve' | 'reject'>('verify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecute = async (action: 'verify' | 'approve' | 'reject') => {
    setActionType(action);
    setError(null);
    try {
      setLoading(true);
      await onConfirmAction(action, comment);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-2xl w-full max-w-xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--color-secondary)] hover:text-[var(--color-primary)] p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[var(--color-outline-variant)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-primary)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline-md font-bold text-lg text-[var(--color-primary)]">
              {isAdminReview ? 'Admin Approval Review' : 'Team Lead Verification'}
            </h3>
            <p className="font-body-sm text-sm text-[var(--color-secondary)]">
              {isAdminReview
                ? 'Approve verified submission and award credits'
                : 'Verify submission quality before admin queue'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Submission Details Card */}
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-caps text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
                {module?.title || 'MODULE'}
              </span>
              <h4 className="font-body-sm font-bold text-sm text-[var(--color-primary)] mt-0.5">
                {submission.title}
              </h4>
            </div>
            <span className="font-label-caps text-xs font-bold text-[var(--color-primary)] bg-[var(--color-surface-container-high)] px-2 py-0.5 rounded border border-[var(--color-outline-variant)]">
              +{module?.creditValue || 100} PTS
            </span>
          </div>

          <p className="text-sm text-[var(--color-secondary)] line-clamp-3">{submission.description}</p>

          <div className="pt-3 border-t border-[var(--color-outline-variant)] flex items-center justify-between text-xs font-label-caps">
            <span className="text-[var(--color-secondary)]">
              Submitted by: <strong className="text-[var(--color-primary)]">{submitter?.name || submission.userId}</strong>
            </span>
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center space-x-1"
            >
              <span>View GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Review Comments Textarea */}
        <div className="mb-5">
          <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
            Review Comments / Feedback
          </label>
          <textarea
            rows={3}
            placeholder={
              isAdminReview
                ? 'Optional notes regarding approval...'
                : 'Feedback for user or admin notes...'
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4">
          <button
            onClick={() => handleExecute('reject')}
            disabled={loading}
            className="px-4 py-2 rounded font-label-caps text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Submission</span>
          </button>

          {isAdminReview ? (
            <button
              onClick={() => handleExecute('approve')}
              disabled={loading}
              className="px-5 py-2 rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-caps text-xs uppercase hover:bg-[var(--color-inverse-surface)] flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {loading && actionType === 'approve' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Approve & Award +{module?.creditValue || 100} Credits</span>
            </button>
          ) : (
            <button
              onClick={() => handleExecute('verify')}
              disabled={loading}
              className="px-5 py-2 rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-caps text-xs uppercase hover:bg-[var(--color-inverse-surface)] flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {loading && actionType === 'verify' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Confirm Verification</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
