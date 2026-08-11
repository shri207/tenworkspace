import React from 'react';
import { Module, Submission, Team } from '../../types';

interface ModuleCardProps {
  module: Module;
  userSubmission?: Submission;
  teams?: Team[];
  onSelect: (module: Module) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  userSubmission,
  teams = [],
  onSelect,
}) => {
  const getSubmissionStatus = () => {
    if (!userSubmission) return 'not_started';
    return userSubmission.status;
  };

  const status = getSubmissionStatus();
  const targetTeam = teams.find((t) => t.id === module.targetTeamId);
  
  // Extract category and title from "CATEGORY — TITLE" format if present
  let category = 'Challenge';
  let displayTitle = module.title;
  
  if (module.title.includes('—')) {
    const parts = module.title.split('—');
    category = parts[0].trim();
    displayTitle = parts.slice(1).join('—').trim();
  } else if (module.title.includes('-')) {
    const parts = module.title.split('-');
    category = parts[0].trim();
    displayTitle = parts.slice(1).join('-').trim();
  }

  // Determine styles based on status
  let cardOpacity = 'opacity-100';
  let statusBadge = null;
  let actionButton = null;
  let titleColor = 'group-hover:text-[var(--color-primary)]'; // default

  if (status === 'approved' || status === 'verified') {
    cardOpacity = 'opacity-80';
    titleColor = 'group-hover:text-green-400';
    statusBadge = (
      <span className="font-label-caps text-[12px] text-green-400 flex items-center gap-1 uppercase">
        <span className="material-symbols-outlined text-[14px]">check_circle</span> {status === 'approved' ? 'COMPLETED' : 'VERIFIED'}
      </span>
    );
    actionButton = (
      <button 
        onClick={() => onSelect(module)}
        className="text-[var(--color-secondary)] font-body-sm text-[14px] px-4 py-2 hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
      >
        Review <span className="material-symbols-outlined text-[16px]">open_in_new</span>
      </button>
    );
  } else if (status === 'submitted' || status === 'under_review') {
    titleColor = 'group-hover:text-yellow-400';
    statusBadge = (
      <span className="font-label-caps text-[12px] text-yellow-400 flex items-center gap-1 uppercase">
        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> IN PROGRESS
      </span>
    );
    actionButton = (
      <button 
        onClick={() => onSelect(module)}
        className="bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] border border-[var(--color-outline-variant)] font-body-sm text-[14px] px-4 py-2 rounded hover:bg-[var(--color-surface-container-low)] transition-colors"
      >
        Continue
      </button>
    );
  } else if (status === 'rejected') {
    titleColor = 'group-hover:text-red-400';
    statusBadge = (
      <span className="font-label-caps text-[12px] text-red-400 flex items-center gap-1 uppercase">
        <span className="w-2 h-2 rounded-full bg-red-400"></span> REJECTED
      </span>
    );
    actionButton = (
      <button 
        onClick={() => onSelect(module)}
        className="bg-[var(--color-surface-container-highest)] text-[var(--color-primary)] border border-[var(--color-outline-variant)] font-body-sm text-[14px] px-4 py-2 rounded hover:bg-[var(--color-surface-container-low)] transition-colors"
      >
        Resubmit
      </button>
    );
  } else {
    // Not started
    titleColor = 'group-hover:text-[var(--color-primary-container)]';
    statusBadge = (
      <span className="font-label-caps text-[12px] text-[var(--color-secondary)] uppercase">
        NOT STARTED
      </span>
    );
    actionButton = (
      <button 
        onClick={() => onSelect(module)}
        className="bg-[var(--color-primary)] text-[var(--color-on-primary)] font-body-sm text-[14px] px-4 py-2 rounded hover:opacity-90 transition-colors"
      >
        Start
      </button>
    );
  }

  return (
    <article className={`bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg p-5 flex flex-col hover:shadow-sm hover:border-[var(--color-outline)] transition-all group ${cardOpacity}`}>
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="font-technical-data text-[13px] text-[var(--color-secondary)] uppercase">
          {targetTeam ? `EXC: ${targetTeam.name}` : `MOD-${module.id.substring(0, 4)}`}
        </div>
        <span className="bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] font-label-caps text-[12px] px-2 py-1 rounded truncate">
          {category}
        </span>
      </div>
      
      <h4 className={`font-headline-md text-[20px] text-[var(--color-primary)] mb-2 line-clamp-2 ${titleColor} transition-colors`}>
        {displayTitle}
      </h4>
      
      <p className="font-body-sm text-[14px] text-[var(--color-secondary)] mb-6 flex-1 line-clamp-3">
        {module.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-outline-variant)]">
        <div className="flex flex-col gap-1">
          {statusBadge}
          <span className={`font-technical-data text-[13px] ${status === 'approved' ? 'text-[var(--color-secondary)] line-through' : 'text-[var(--color-primary)]'}`}>
            {module.creditValue} CR
          </span>
        </div>
        {actionButton}
      </div>
    </article>
  );
};
