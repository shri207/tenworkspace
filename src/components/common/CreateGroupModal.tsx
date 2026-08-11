import React, { useState } from 'react';
import { User } from '../../types';
import { Users, UserPlus, Search, CheckCircle2, X, Shield, Sparkles } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onCreateGroup: (groupData: { name: string; memberIds: string[] }) => Promise<void>;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Exclude current team lead from selectable list as they are automatically included
  const selectableUsers = users.filter((u) => u.uid !== currentUserId);

  const filteredUsers = selectableUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.teamId && u.teamId.toLowerCase().includes(q))
    );
  });

  const toggleUser = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectUnassigned = () => {
    const unassignedIds = selectableUsers
      .filter((u) => !u.teamId)
      .map((u) => u.uid);
    setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...unassignedIds])));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Group name is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreateGroup({
        name: groupName.trim(),
        memberIds: selectedUserIds,
      });
      setLoading(false);
      onClose();
      // Reset state
      setGroupName('');
      setSelectedUserIds([]);
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err?.message || 'Failed to create team group.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-xl relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-primary)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline-md font-bold text-xl text-[var(--color-primary)]">
              Create New Group
            </h3>
            <p className="font-body-sm text-sm text-[var(--color-secondary)]">
              Form a new team or study group and assign students
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono shrink-0">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-1 flex flex-col min-h-0">
          <div className="shrink-0">
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
              Group / Team Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Squad Delta, AI Innovators, Group 4"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0 space-y-2">
            <div className="flex items-center justify-between shrink-0">
              <label className="font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase">
                Select Members ({selectedUserIds.length} selected)
              </label>

              <button
                type="button"
                onClick={handleSelectUnassigned}
                className="text-[12px] font-label-caps text-[var(--color-primary)] hover:underline"
              >
                + Select All Unassigned
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 mt-2">
              <Search className="w-4 h-4 text-[var(--color-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl pl-9 pr-3.5 py-2 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)] placeholder-[var(--color-on-surface-variant)] opacity-70 focus:opacity-100 transition-opacity"
              />
            </div>

            {/* User Selection List */}
            <div className="flex-1 overflow-y-auto border border-[var(--color-outline-variant)] rounded-xl bg-[var(--color-surface-container)] divide-y divide-[var(--color-outline-variant)] p-2 space-y-1 mt-2">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-sm font-body-sm text-[var(--color-secondary)]">
                  No users found matching your search.
                </div>
              ) : (
                filteredUsers.map((usr) => {
                  const isSelected = selectedUserIds.includes(usr.uid);

                  return (
                    <div
                      key={usr.uid}
                      onClick={() => toggleUser(usr.uid)}
                      className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-surface-container-high)] border border-[var(--color-primary-container)]'
                          : 'hover:bg-[var(--color-surface-container-low)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-primary-container)] border-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
                              : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <img
                          src={
                            usr.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                          }
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-[var(--color-outline-variant)]"
                        />

                        <div>
                          <span className="font-bold text-sm text-[var(--color-primary)] block">{usr.name}</span>
                          <span className="font-body-sm text-xs text-[var(--color-secondary)]">{usr.email}</span>
                        </div>
                      </div>

                      <div className="text-right font-label-caps text-[10px]">
                        <span className="text-[var(--color-primary)] font-bold block">{usr.credits} PTS</span>
                        <span className="text-[var(--color-secondary)]">
                          {usr.teamId ? `Team: ${usr.teamId}` : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-label-caps text-xs text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-caps uppercase text-xs hover:bg-[var(--color-inverse-surface)] transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Group...' : 'Create Group'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
