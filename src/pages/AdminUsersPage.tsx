import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Team, UserRole } from '../types';
import { createOrUpdateUser, deleteUserAccount } from '../services/firestoreService';

interface AdminUsersPageProps {
  users: User[];
  teams: Team[];
  onNavigate: (path: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  onAssignUserTeam: (userId: string, teamId: string) => Promise<void>;
  onAdjustUserCredits: (userId: string, newCredits: number, reason: string) => Promise<void>;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({
  users,
  teams,
  onNavigate,
  onUpdateUserRole,
  onAssignUserTeam,
  onAdjustUserCredits,
}) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // New Account Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newTeamId, setNewTeamId] = useState('');
  const [creating, setCreating] = useState(false);

  // Credit Adjustment State
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const [creditReason, setCreditReason] = useState('Admin Bonus');

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleEditUser = (usr: User) => {
    setEditingUserId(usr.uid);
    setSelectedRole(usr.role);
    setSelectedTeamId(usr.teamId || '');
  };

  const handleSaveUser = async (userId: string) => {
    try {
      setSaving(true);
      await onUpdateUserRole(userId, selectedRole);
      if (selectedTeamId !== undefined) {
        await onAssignUserTeam(userId, selectedTeamId);
      }
      setSaving(false);
      setEditingUserId(null);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleDeleteUser = async (usr: User) => {
    if (usr.uid === userProfile?.uid) {
      alert('You cannot delete your own admin account while logged in.');
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to permanently remove the account for "${usr.name}" (${usr.email})?`
      )
    ) {
      try {
        await deleteUserAccount(usr.uid);
      } catch (err) {
        console.error('Failed to delete account:', err);
      }
    }
  };

  const handleCreateNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      setCreating(true);
      const newUid = `usr-${Date.now()}`;
      const newUserProfile: User = {
        uid: newUid,
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        teamId: newTeamId || (newRole === 'user' ? 'team-alpha' : undefined),
        credits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createOrUpdateUser(newUserProfile);
      setCreating(false);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
    } catch (err) {
      console.error('Failed to create account:', err);
      setCreating(false);
    }
  };

  const handleConfirmCredits = async (userId: string) => {
    const targetUser = users.find((u) => u.uid === userId);
    if (!targetUser) return;
    try {
      const newTotal = (targetUser.credits || 0) + Number(creditAmount);
      await onAdjustUserCredits(userId, newTotal, creditReason);
      setAdjustingUserId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="font-headline-md text-[24px] text-[var(--color-primary)]">Users</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('/admin')}
            className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-primary)] hover:border-[var(--color-primary-container)] transition-colors px-4 py-2 font-mono-data text-[13px] flex items-center gap-2 rounded"
          >
            ← Overview
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] px-4 py-2 font-mono-data text-[13px] flex items-center gap-2 font-semibold hover:bg-[var(--color-primary-fixed)] transition-colors rounded"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create User
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg p-4 flex flex-col justify-center">
          <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-1 uppercase tracking-wider">Total Users</span>
          <span className="font-headline-md text-[24px] text-[var(--color-primary)]">{users.length}</span>
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg p-4 flex flex-col justify-center">
          <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-1 uppercase tracking-wider">Admins</span>
          <span className="font-headline-md text-[24px] text-[var(--color-primary)]">{users.filter((u) => u.role === 'admin').length}</span>
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg p-4 flex flex-col justify-center">
          <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-1 uppercase tracking-wider">Team Leads</span>
          <span className="font-headline-md text-[24px] text-[var(--color-primary)]">{users.filter((u) => u.role === 'team_lead').length}</span>
        </div>
        <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg p-4 flex flex-col justify-center">
          <span className="font-label-caps text-[12px] text-[var(--color-secondary)] mb-1 uppercase tracking-wider">Participants</span>
          <span className="font-headline-md text-[24px] text-[var(--color-primary-container)]">{users.filter((u) => u.role === 'user').length}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-4 shrink-0">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] text-[20px]">search</span>
          <input 
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded pl-10 pr-4 font-body-sm text-[14px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-lg flex-1 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[var(--color-surface-container-low)] z-10 border-b border-[var(--color-outline-variant)]">
              <tr>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase">User</th>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase">Email</th>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase">Role</th>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase">Team</th>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase text-right">Credits</th>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase">Joined</th>
                <th className="py-3 px-4 font-label-caps text-[12px] text-[var(--color-secondary)] font-normal uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-[14px] overflow-y-auto divide-y divide-[var(--color-outline-variant)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center font-mono-data text-[13px] text-[var(--color-secondary)]">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const isEditing = editingUserId === usr.uid;
                  const userTeam = teams.find((t) => t.id === usr.teamId);

                  return (
                    <tr key={usr.uid} className="hover:bg-[var(--color-surface-container-highest)] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt=""
                            className="w-8 h-8 rounded-full border border-[var(--color-outline-variant)] object-cover bg-black"
                          />
                          <div>
                            <div className="font-medium text-[var(--color-primary)]">{usr.name}</div>
                            <div className="text-[var(--color-secondary)] text-[11px] font-mono-data mt-0.5">ID: {usr.uid}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 font-mono-data text-[13px] text-[var(--color-secondary)]">
                        {usr.email}
                      </td>

                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as any)}
                            className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-2 py-1 text-[12px] font-mono-data text-[var(--color-primary-container)]"
                          >
                            <option value="user">Participant</option>
                            <option value="team_lead">Team Lead</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-block border px-2 py-0.5 text-[10px] font-mono-data rounded-sm uppercase ${
                            usr.role === 'admin' ? 'border-[var(--color-primary-container)] text-[var(--color-primary-container)]' :
                            usr.role === 'team_lead' ? 'border-blue-400 text-blue-400' :
                            'border-[var(--color-outline-variant)] text-[var(--color-primary)]'
                          }`}>
                            {usr.role.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono-data text-[13px] text-[var(--color-primary)]">
                        {isEditing ? (
                          <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded px-2 py-1 text-[12px] font-mono-data text-[var(--color-primary)]"
                          >
                            <option value="">Independent</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={userTeam ? '' : 'italic text-[var(--color-secondary)]'}>
                            {userTeam?.name || 'System / Independent'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {adjustingUserId === usr.uid ? (
                          <div className="flex items-center justify-end space-x-1">
                            <input
                              type="number"
                              value={creditAmount}
                              onChange={(e) => setCreditAmount(Number(e.target.value))}
                              className="w-16 bg-[var(--color-surface-container-lowest)] border border-[var(--color-primary-container)] rounded px-1 py-0.5 text-[13px] text-[var(--color-primary-container)] font-mono-data text-right"
                            />
                            <button
                              onClick={() => handleConfirmCredits(usr.uid)}
                              className="px-1.5 py-0.5 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded font-bold text-[10px] uppercase"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAdjustingUserId(usr.uid)}
                            className="font-mono-data font-bold text-[13px] text-[var(--color-primary-container)] hover:underline"
                            title="Click to adjust credits"
                          >
                            {usr.credits || 0}
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono-data text-[12px] text-[var(--color-secondary)]">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveUser(usr.uid)}
                              disabled={saving}
                              className="px-2 py-1 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded text-[11px] font-mono-data uppercase font-bold"
                            >
                              {saving ? 'Wait' : 'Save'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditUser(usr)}
                              className="p-1.5 text-[var(--color-secondary)] hover:text-[var(--color-primary-container)] transition-colors rounded hover:bg-[var(--color-surface-container)]"
                              title="Edit Role / Team"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(usr)}
                            className="p-1.5 text-[var(--color-secondary)] hover:text-red-400 transition-colors rounded hover:bg-[var(--color-surface-container)]"
                            title="Remove Account"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-headline-md text-[20px] text-[var(--color-primary)] mb-1">
              Create New Platform Account
            </h3>
            <p className="font-mono-data text-[13px] text-[var(--color-secondary)] mb-5">
              Directly register a participant, team lead, or admin profile
            </p>

            <form onSubmit={handleCreateNewAccount} className="space-y-4">
              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                />
              </div>

              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                />
              </div>

              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  System Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                >
                  <option value="user">Participant</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-mono-data text-[11px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
                  Assigned Team
                </label>
                <select
                  value={newTeamId}
                  onChange={(e) => setNewTeamId(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded p-2.5 text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
                >
                  <option value="">Independent / None</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded font-label-caps text-[12px] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-label-caps text-[12px] font-bold hover:bg-[var(--color-primary-fixed)] transition-colors"
                >
                  {creating ? 'CREATING...' : 'REGISTER ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
