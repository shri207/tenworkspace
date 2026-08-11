import React, { useState } from 'react';
import { Module, Team } from '../../types';
import { Layers, Calendar, Award, FileText, CheckCircle2, X, Users, Lock } from 'lucide-react';

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams?: Team[];
  onCreateModule: (moduleData: Omit<Module, 'id' | 'createdAt'>) => Promise<void>;
}

export const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  teams = [],
  onCreateModule,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [creditValue, setCreditValue] = useState<number>(200);
  const [deadline, setDeadline] = useState('2026-09-30');
  const [status, setStatus] = useState<'active' | 'upcoming' | 'archived'>('active');
  const [targetTeamId, setTargetTeamId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreateModule({
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim() || 'Follow standard repository guidelines and submit your code link.',
        creditValue: Number(creditValue) || 100,
        deadline,
        status,
        ...(targetTeamId ? { targetTeamId } : {}),
      });
      setLoading(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setInstructions('');
      setTargetTeamId('');
      setCreditValue(200);
    } catch (err: any) {
      console.error('Error creating module:', err);
      setError(err?.message || 'Failed to create challenge module.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-xl relative overflow-y-auto max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-primary)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline-md font-bold text-xl text-[var(--color-primary)]">
              Create Challenge Module
            </h3>
            <p className="font-body-sm text-sm text-[var(--color-secondary)]">
              Add a new module for students & team members to complete
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
              Module Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Module 4: Real-time WebSockets & Canvas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
            />
          </div>

          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
              Short Summary *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Build authority state and sync cursors across clients."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
            />
          </div>

          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
              Detailed Requirements & Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Specify requirements, acceptance criteria, recommended libraries, or starter setup..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary-container)] resize-none opacity-70 focus:opacity-100 transition-opacity"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
                Credit Reward (PTS)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={10}
                  step={10}
                  required
                  value={creditValue}
                  onChange={(e) => setCreditValue(Number(e.target.value))}
                  className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] font-bold focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1">
              Initial Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'upcoming' | 'archived')}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
            >
              <option value="active">🟢 Active (Open for Submissions)</option>
              <option value="upcoming">🟡 Upcoming (Preview Mode)</option>
              <option value="archived">🔴 Archived</option>
            </select>
          </div>

          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase mb-1 flex items-center justify-between">
              <span>Assign to Group (Exclusive)</span>
              {targetTeamId && (
                <span className="text-[var(--color-primary)] font-normal text-[10px] lowercase flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Group Restricted</span>
                </span>
              )}
            </label>
            <select
              value={targetTeamId}
              onChange={(e) => setTargetTeamId(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)] opacity-70 focus:opacity-100 transition-opacity"
            >
              <option value="">🌐 All Groups / Public (Available to Everyone)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  👥 Group: {t.name} (Restricted Only To This Group)
                </option>
              ))}
            </select>
            <p className="font-body-sm text-xs text-[var(--color-secondary)] mt-1">
              If a group is selected, this module will only be accessible to members of that specific group.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 mt-2">
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
              className="px-6 py-2.5 rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-caps text-xs uppercase hover:bg-[var(--color-inverse-surface)] shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish Module'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
