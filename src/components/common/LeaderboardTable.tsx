import React from 'react';
import { User, Team, Submission } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardTableProps {
  type: 'PARTICIPANTS' | 'TEAM_LEADS' | 'TEAMS';
  users: User[];
  teams: any[];
  submissions: Submission[];
  currentUser: User | null;
  onRowClick?: (user: User) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ type, users, teams, submissions, currentUser, onRowClick }) => {
  if ((type === 'PARTICIPANTS' || type === 'TEAM_LEADS') && users.length === 0) {
    return <div className="p-8 text-center text-[var(--color-secondary)] font-body-sm text-sm">No {type.toLowerCase().replace('_', ' ')} found.</div>;
  }
  if (type === 'TEAMS' && teams.length === 0) {
    return <div className="p-8 text-center text-[var(--color-secondary)] font-body-sm text-sm">No teams found.</div>;
  }

  const getUserStats = (userId: string) => {
    const userSubs = submissions.filter(s => s.userId === userId);
    return {
      completed: userSubs.filter(s => ['verified', 'approved'].includes(s.status)).length,
      verified: userSubs.filter(s => s.status === 'verified').length
    };
  };

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]">
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal w-16">RANK</th>
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal">{type === 'TEAMS' ? 'TEAM' : 'PARTICIPANT'}</th>
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal">{type === 'TEAMS' ? 'MEMBERS' : 'TEAM'}</th>
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal text-right">COMPLETED</th>
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal text-right">VERIFIED</th>
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal text-right">CREDITS</th>
          <th className="p-3 font-label-caps text-[10px] text-[var(--color-secondary)] font-normal text-right w-20">CHG</th>
        </tr>
      </thead>
      <tbody className="font-mono-data text-sm">
        {type === 'PARTICIPANTS' || type === 'TEAM_LEADS' ? (
          users.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUser?.uid === user.uid;
            const team = teams.find(t => t.id === user.teamId || t.teamLeadId === user.uid);
            const stats = getUserStats(user.uid);
            
            // Random change for demo
            const changeVal = rank % 3 === 0 ? 1 : rank % 4 === 0 ? -2 : 0;

            return (
              <tr 
                key={user.uid} 
                onClick={() => onRowClick && onRowClick(user)}
                className={`border-b border-[var(--color-outline-variant)] transition-colors cursor-pointer ${
                  isCurrentUser 
                    ? 'bg-[var(--color-surface-container-highest)] border-l-2 border-l-[var(--color-primary-container)] hover:border-y-[var(--color-primary-container)] relative z-10' 
                    : 'hover:bg-[var(--color-surface-container-high)] hover:border-y-[var(--color-primary-container)]'
                }`}
              >
                <td className={`p-3 ${isCurrentUser ? 'text-[var(--color-primary-container)]' : 'text-[var(--color-secondary)]'}`}>
                  {rank.toString().padStart(2, '0')}
                </td>
                <td className="p-3 text-[var(--color-primary)] font-body-sm font-semibold flex items-center gap-2">
                  {user.displayName || user.name}
                  {isCurrentUser && (
                    <span className="text-[9px] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] px-1 py-0.5 font-bold tracking-widest uppercase">YOU</span>
                  )}
                </td>
                <td className="p-3 text-[var(--color-secondary)]">{team?.name || '-'}</td>
                <td className="p-3 text-right">{stats.completed}</td>
                <td className="p-3 text-right">{stats.verified}</td>
                <td className={`p-3 text-right font-bold ${isCurrentUser ? 'text-[var(--color-primary-container)]' : 'text-[var(--color-primary)]'}`}>
                  {user.credits.toLocaleString()}
                </td>
                <td className="p-3 text-right text-xs">
                  <div className="flex justify-end items-center gap-1">
                    {changeVal > 0 && <span className="text-green-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3"/> {changeVal}</span>}
                    {changeVal < 0 && <span className="text-red-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3"/> {Math.abs(changeVal)}</span>}
                    {changeVal === 0 && <span className="text-[var(--color-secondary)] flex items-center gap-0.5"><Minus className="w-3 h-3"/></span>}
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          teams.map((team, index) => {
            const rank = index + 1;
            const changeVal = rank % 3 === 0 ? 1 : rank % 4 === 0 ? -1 : 0;
            return (
              <tr 
                key={team.id} 
                className="border-b border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-high)] hover:border-y-[var(--color-primary-container)] transition-colors"
              >
                <td className="p-3 text-[var(--color-secondary)]">{rank.toString().padStart(2, '0')}</td>
                <td className="p-3 text-[var(--color-primary)] font-body-sm font-semibold">{team.name}</td>
                <td className="p-3 text-[var(--color-secondary)]">{team.memberCount}</td>
                <td className="p-3 text-right">{team.completed || 0}</td>
                <td className="p-3 text-right">{team.verified || 0}</td>
                <td className="p-3 text-right text-[var(--color-primary)] font-bold">{team.totalCredits.toLocaleString()}</td>
                <td className="p-3 text-right text-xs flex justify-end items-center gap-1">
                  <div className="flex justify-end items-center gap-1">
                    {changeVal > 0 && <span className="text-green-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3"/> {changeVal}</span>}
                    {changeVal < 0 && <span className="text-red-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3"/> {Math.abs(changeVal)}</span>}
                    {changeVal === 0 && <span className="text-[var(--color-secondary)] flex items-center gap-0.5"><Minus className="w-3 h-3"/></span>}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
