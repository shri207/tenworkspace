import React from 'react';
import { Submission } from '../../types';
import { CheckCircle2, Clock, XCircle, Award, ShieldAlert, ArrowDown } from 'lucide-react';

interface TimelineProps {
  submission: Submission;
}

export const Timeline: React.FC<TimelineProps> = ({ submission }) => {
  const steps = [
    {
      title: 'Submitted by Participant',
      subtitle: `GitHub repository linked on ${new Date(submission.submittedAt).toLocaleDateString()}`,
      status: 'completed',
      date: submission.submittedAt,
    },
    {
      title: 'Team Lead Review',
      subtitle: submission.reviewedBy
        ? `Reviewed & Verified on ${new Date(submission.reviewedAt!).toLocaleDateString()}`
        : 'Awaiting Team Lead inspection...',
      status: submission.reviewedBy
        ? submission.status === 'rejected'
          ? 'rejected'
          : 'completed'
        : submission.status === 'under_review'
        ? 'in_progress'
        : 'pending',
      date: submission.reviewedAt,
    },
    {
      title: 'Verification Queue',
      subtitle:
        submission.status === 'verified' || submission.status === 'approved'
          ? 'Verified & queued for Admin approval'
          : submission.status === 'rejected'
          ? 'Submission rejected during review'
          : 'Pending Team Lead verification',
      status:
        submission.status === 'verified' || submission.status === 'approved'
          ? 'completed'
          : submission.status === 'rejected'
          ? 'rejected'
          : 'pending',
    },
    {
      title: 'Admin Approval & Credit Award',
      subtitle: submission.approvedBy
        ? `Approved by Admin on ${new Date(submission.approvedAt!).toLocaleDateString()}`
        : 'Awaiting Admin credit authorization...',
      status: submission.approvedBy ? 'completed' : 'pending',
      date: submission.approvedAt,
    },
    {
      title: `Credits Allocated (+${submission.userCreditsAwarded || 100} PTS)`,
      subtitle: submission.userCreditsAwarded
        ? 'Credits transferred to Participant and Team Lead'
        : 'Pending final approval',
      status: submission.userCreditsAwarded ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="space-y-4 relative pl-4 border-l-2 border-[#37340F]">
      {steps.map((step, i) => {
        const isCompleted = step.status === 'completed';
        const isRejected = step.status === 'rejected';
        const isInProgress = step.status === 'in_progress';

        return (
          <div key={i} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                isCompleted
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  : isRejected
                  ? 'bg-rose-950 border-rose-500 text-rose-400'
                  : isInProgress
                  ? 'bg-amber-950 border-amber-500 text-amber-400'
                  : 'bg-[#14140F] border-[#37340F] text-[#6F706B]'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isRejected ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
            </div>

            <div className="bg-[#14140F] border border-[#37340F] rounded-xl p-3.5 ml-2">
              <div className="flex items-center justify-between">
                <h4 className="font-sans font-semibold text-xs text-[#F5F5F2]">
                  {step.title}
                </h4>
                {step.date && (
                  <span className="font-mono text-[10px] text-[#6F706B]">
                    {new Date(step.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A7A7A2] mt-0.5">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
