import React, { useState, useMemo } from 'react';
import { User, Team } from '../types';
import { Trophy, Users, Search, Star, User as UserIcon } from 'lucide-react';
import { LeaderboardTable } from '../components/common/LeaderboardTable';

interface LeaderboardPageProps {
  users: User[];
  teams: Team[];
  onNavigate: (path: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ users, teams, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'individual' | 'teams'>('individual');

  // Filter users by search
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => (u.displayName || u.name).toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.credits - a.credits);
  }, [users, searchTerm]);

  // Compute team scores
  const teamScores = useMemo(() => {
    return teams.map(team => {
      const members = users.filter(u => u.teamId === team.id || u.uid === team.teamLeadId);
      const totalCredits = members.reduce((sum, m) => sum + m.credits, 0);
      return {
        ...team,
        totalCredits,
        memberCount: members.length
      };
    })
    .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.totalCredits - a.totalCredits);
  }, [teams, users, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline-md font-bold text-2xl text-[var(--color-primary)]">
            Global Leaderboard
          </h1>
          <p className="font-body-sm text-sm text-[var(--color-secondary)] mt-1">
            Track top performers and leading teams across the platform
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--color-surface-container)] rounded-lg p-1 border border-[var(--color-outline-variant)]">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-label-caps text-xs transition-colors ${
              activeTab === 'individual'
                ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Individual</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-label-caps text-xs transition-colors ${
              activeTab === 'teams'
                ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
                : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teams</span>
          </button>
        </div>
      </div>

      {/* Top 3 Cards for Individual */}
      {activeTab === 'individual' && filteredUsers.length >= 3 && !searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4">
          {[1, 0, 2].map((idx) => {
            const u = filteredUsers[idx];
            if (!u) return null;
            const rank = idx + 1;
            const isFirst = rank === 1;
            
            return (
              <div 
                key={u.uid} 
                className={`bg-[var(--color-surface-container)] rounded-2xl border ${isFirst ? 'border-[var(--color-primary-container)] md:-mt-4 relative shadow-lg' : 'border-[var(--color-outline-variant)]'} p-6 flex flex-col items-center text-center`}
              >
                {isFirst && (
                  <div className="absolute -top-4 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] p-2 rounded-full shadow-lg">
                    <Trophy className="w-6 h-6" />
                  </div>
                )}
                <div className="relative mt-2">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={u.displayName || u.name}
                    className={`w-20 h-20 rounded-full object-cover border-4 ${isFirst ? 'border-[var(--color-primary-container)]' : 'border-[var(--color-surface-container-high)]'}`}
                  />
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-[var(--color-on-primary)] ${isFirst ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-300' : 'bg-amber-600'}`}>
                    #{rank}
                  </div>
                </div>
                <h3 className="font-headline-md text-lg text-[var(--color-primary)] font-bold mt-4 truncate w-full">{u.displayName || u.name}</h3>
                <p className="font-body-sm text-sm text-[var(--color-secondary)]">{u.role.replace('_', ' ')}</p>
                <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]">
                  <Star className="w-4 h-4 text-[var(--color-primary-container)]" />
                  <span className="font-label-caps text-xs text-[var(--color-primary)] font-bold">{u.credits} PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Table Area */}
      <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--color-outline-variant)] flex items-center justify-between">
          <h2 className="font-headline-md text-lg text-[var(--color-primary)] font-bold">
            {activeTab === 'individual' ? 'All Participants' : 'All Teams'}
          </h2>
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-[var(--color-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'individual' ? 'participants' : 'teams'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-xl pl-9 pr-3.5 py-2 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)]"
            />
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="p-4 border-b border-[var(--color-outline-variant)] sm:hidden">
           <div className="relative w-full">
            <Search className="w-4 h-4 text-[var(--color-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-xl pl-9 pr-3.5 py-2 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <LeaderboardTable 
            type={activeTab} 
            users={filteredUsers} 
            teams={teamScores} 
            onNavigate={onNavigate} 
          />
        </div>
      </div>
    </div>
  );
};
