import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="relative overflow-hidden bg-[#14140F] border border-[#37340F] rounded-[16px] p-5 shadow-lg group hover:border-[#C8A900]/50 transition-all duration-200">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,rgba(255,214,0,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#A7A7A2]">
          {label}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-[#191810] border border-[#37340F] flex items-center justify-center text-[#FFD600]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="font-display text-3xl font-extrabold text-[#F5F5F2] tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="font-mono text-xs font-semibold text-[#FFD600] bg-[#37340F]/40 px-2 py-0.5 rounded-full border border-[#37340F]">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-[#6F706B] font-medium">{subtitle}</p>
      )}
    </div>
  );
};
