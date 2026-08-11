import React from 'react';
import { Award } from 'lucide-react';

interface CreditBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CreditBadge: React.FC<CreditBadgeProps> = ({ amount, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-sm px-2.5 py-1 space-x-1.5',
    lg: 'text-base px-3 py-1.5 space-x-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      className={`font-mono font-bold bg-[#37340F]/60 text-[#FFD600] border border-[#37340F] rounded-full inline-flex items-center ${sizeClasses}`}
    >
      <Award className={`${iconSizes} text-[#FFD600]`} />
      <span>+{amount} CREDITS</span>
    </span>
  );
};
