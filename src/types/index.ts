export type UserRole = 'user' | 'team_lead' | 'admin';

export type SubmissionStatus = 'submitted' | 'under_review' | 'verified' | 'rejected' | 'approved';

export interface User {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  teamId?: string;
  avatar?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  teamLeadId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  instructions: string;
  creditValue: number;
  deadline: string;
  status: 'active' | 'archived' | 'upcoming';
  targetTeamId?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  moduleId: string;
  userId: string;
  teamId?: string;
  githubUrl: string;
  title: string;
  description: string;
  submittedAt: string;

  status: SubmissionStatus;

  reviewedBy?: string; // Team Lead UID
  reviewedAt?: string;

  approvedBy?: string; // Admin UID
  approvedAt?: string;

  userCreditsAwarded?: number;
  teamLeadCreditsAwarded?: number;

  reviewComment?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  submissionId?: string;
  amount: number;
  type: 'module_completion' | 'team_lead_bonus' | 'admin_adjustment';
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'verification' | 'approval' | 'rejection' | 'credits' | 'leaderboard' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface GitHubRepoMeta {
  owner: string;
  repo: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  updatedAt?: string;
  isValid: boolean;
}
