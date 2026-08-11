import React from 'react';
import { SubmissionStatus } from '../../types';

interface StatusBadgeProps {
  status: SubmissionStatus | 'active' | 'in_progress' | 'not_started' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'submitted':
      case 'under_review':
      case 'in_progress':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
      case 'verified':
        return 'bg-purple-950/60 text-purple-400 border-purple-800/50';
      case 'approved':
      case 'active':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'rejected':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/50';
      default:
        return 'bg-[#191810] text-[#A7A7A2] border-[#37340F]';
    }
  };

  const formatText = (val: string) => {
    switch (val) {
      case 'submitted':
        return 'PENDING REVIEW';
      case 'under_review':
        return 'UNDER REVIEW';
      case 'verified':
        return 'VERIFIED';
      case 'approved':
        return 'APPROVED';
      case 'rejected':
        return 'REJECTED';
      case 'active':
        return 'ACTIVE';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'not_started':
        return 'NOT STARTED';
      default:
        return val.toUpperCase().replace('_', ' ');
    }
  };

  return (
    <span
      className={`font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${getBadgeStyle()} inline-flex items-center gap-1.5 whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {formatText(status)}
    </span>
  );
};
