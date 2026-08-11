import React, { useState, useEffect } from 'react';
import { Module, Team } from '../../types';
import { fetchGitHubRepoMeta } from '../../services/githubService';
import { GitHubRepoMeta } from '../../types';
import { Github, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Module[];
  teams: Team[];
  userTeamId?: string;
  initialModuleId?: string;
  onSubmit: (subData: {
    moduleId: string;
    githubUrl: string;
    title: string;
    description: string;
  }) => Promise<void>;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  modules,
  initialModuleId,
  onSubmit,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState(initialModuleId || '');
  const [githubUrl, setGithubUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validatingRepo, setValidatingRepo] = useState(false);
  const [repoMeta, setRepoMeta] = useState<GitHubRepoMeta | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialModuleId) setSelectedModuleId(initialModuleId);
    else if (modules.length > 0 && !selectedModuleId) setSelectedModuleId(modules[0].id);
  }, [initialModuleId, modules]);

  // Debounce GitHub URL validation
  useEffect(() => {
    if (!githubUrl || !githubUrl.includes('github.com/')) {
      setRepoMeta(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingRepo(true);
      const meta = await fetchGitHubRepoMeta(githubUrl);
      setRepoMeta(meta);
      setValidatingRepo(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [githubUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedModuleId) {
      setError('Please select a module.');
      return;
    }
    if (!githubUrl || !githubUrl.includes('github.com')) {
      setError('Please enter a valid public GitHub repository URL.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a submission title.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        moduleId: selectedModuleId,
        githubUrl,
        title,
        description,
      });
      setSubmitting(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit repository.');
      setSubmitting(false);
    }
  };

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-2xl w-full max-w-xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--color-secondary)] hover:text-[var(--color-primary)] p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[var(--color-outline-variant)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-primary)]">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline-md text-lg text-[var(--color-primary)] font-bold">
              Submit Work
            </h3>
            <p className="font-body-sm text-sm text-[var(--color-secondary)]">
              Submit your GitHub repository for team lead verification
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Module Selector */}
          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
              Target Module
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary-container)]"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} (+{m.creditValue} PTS)
                </option>
              ))}
            </select>
          </div>

          {/* GitHub Repository URL */}
          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
              GitHub Repository URL
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] opacity-70 focus:outline-none focus:border-[var(--color-primary-container)] focus:opacity-100 transition-opacity"
                required
              />
              <Github className="w-4 h-4 text-[var(--color-secondary)] absolute left-3.5 top-3" />
              {validatingRepo && (
                <Loader2 className="w-4 h-4 text-[var(--color-primary-container)] animate-spin absolute right-3.5 top-3" />
              )}
            </div>

            {/* GitHub Repo Validation Banner */}
            {repoMeta && repoMeta.isValid && (
              <div className="mt-2.5 p-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <span className="font-body-sm font-bold text-[var(--color-primary)]">
                      {repoMeta.owner} / {repoMeta.repo}
                    </span>
                    <p className="text-xs text-[var(--color-secondary)]">{repoMeta.description}</p>
                  </div>
                </div>
                {repoMeta.language && (
                  <span className="font-label-caps text-[10px] bg-[var(--color-surface-container-high)] text-[var(--color-primary)] px-2 py-0.5 rounded border border-[var(--color-outline-variant)]">
                    {repoMeta.language}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Submission Title */}
          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
              Submission Title
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Foundation Implementation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] opacity-70 focus:outline-none focus:border-[var(--color-primary-container)] focus:opacity-100 transition-opacity"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-label-caps text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1.5">
              Implementation Notes / Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of how you met the module requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-primary)] placeholder-[var(--color-on-surface-variant)] opacity-70 focus:outline-none focus:border-[var(--color-primary-container)] focus:opacity-100 transition-opacity"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded font-label-caps text-xs text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-container-low)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] font-label-caps text-xs uppercase hover:bg-[var(--color-inverse-surface)] flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Submitting...' : 'Submit Repository'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
