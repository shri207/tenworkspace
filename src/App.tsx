import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';

// Pages
import { LandingLoginPage } from './pages/LandingLoginPage';
import { UserDashboard } from './pages/UserDashboard';
import { TeamLeadDashboard } from './pages/TeamLeadDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ModulesListPage } from './pages/ModulesListPage';
import { SubmissionsListPage } from './pages/SubmissionsListPage';
import { SubmissionDetailsPage } from './pages/SubmissionDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TeamPage } from './pages/TeamPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

// Types & Services
import { Module, Submission, User, Team } from './types';
import {
  listenToModules,
  listenToSubmissions,
  listenToUsers,
  listenToTeams,
  seedFirestoreIfEmpty,
  createModule,
  deleteModule,
  createTeamGroup,
  createSubmissionRecord,
  verifySubmissionByLead,
  approveSubmissionByAdmin,
  rejectSubmission,
  adjustUserCredits,
  updateUserRole,
  assignUserToTeam,
} from './services/firestoreService';

function MainAppContent() {
  const { userProfile, role, loading } = useAuth();

  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Firestore Data State
  const [modules, setModules] = useState<Module[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Listen to Firestore real-time updates
  useEffect(() => {
    seedFirestoreIfEmpty();
    const unsubMods = listenToModules(setModules);
    const unsubSubs = listenToSubmissions(setSubmissions);
    const unsubUsers = listenToUsers(setUsers);
    const unsubTeams = listenToTeams(setTeams);

    return () => {
      unsubMods();
      unsubSubs();
      unsubUsers();
      unsubTeams();
    };
  }, []);

  // Auto-route admin to /admin when logged in
  useEffect(() => {
    if (userProfile && role === 'admin' && currentPath === '/dashboard') {
      setCurrentPath('/admin');
    }
  }, [userProfile, role]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-background)] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-[var(--color-primary-container)] animate-ping" />
          <span>Initializing TEN Workspace Challenge...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated -> Show Landing / Login
  if (!userProfile) {
    return <LandingLoginPage onNavigate={handleNavigate} />;
  }

  // Service Action Handlers
  const handleSubmitWork = async (subData: {
    moduleId: string;
    githubUrl: string;
    title: string;
    description: string;
  }) => {
    if (!userProfile) return;
    await createSubmissionRecord({
      userId: userProfile.uid,
      teamId: userProfile.teamId,
      moduleId: subData.moduleId,
      githubUrl: subData.githubUrl,
      title: subData.title,
      description: subData.description,
    });
  };

  const handleVerifySubmission = async (
    submissionId: string,
    reviewerId: string,
    comment?: string
  ) => {
    await verifySubmissionByLead(submissionId, reviewerId, comment);
  };

  const handleApproveSubmission = async (
    submissionId: string,
    adminId: string,
    comment?: string
  ) => {
    const sub = submissions.find((s) => s.id === submissionId);
    const mod = modules.find((m) => m.id === sub?.moduleId);
    const creditValue = mod?.creditValue || 100;

    await approveSubmissionByAdmin(
      submissionId,
      adminId,
      comment
    );
  };

  const handleRejectSubmission = async (
    submissionId: string,
    reviewerId: string,
    comment: string
  ) => {
    await rejectSubmission(submissionId, reviewerId, comment);
  };

  const handleAdjustCredits = async (
    userId: string,
    newCredits: number,
    reason: string
  ) => {
    await adjustUserCredits(userId, newCredits, reason);
  };

  const handleCreateModule = async (
    moduleData: Omit<Module, 'id' | 'createdAt'>
  ) => {
    await createModule(moduleData);
  };

  const handleDeleteModule = async (moduleId: string) => {
    await deleteModule(moduleId);
  };

  const handleCreateGroup = async (groupData: { name: string; memberIds: string[] }) => {
    if (!userProfile) return;
    await createTeamGroup({
      name: groupData.name,
      teamLeadId: userProfile.uid,
      memberIds: groupData.memberIds,
    });
  };

  // Determine Page Title
  const getPageTitle = () => {
    if (currentPath === '/dashboard') {
      if (role === 'admin') return 'Admin Control Center';
      if (role === 'team_lead') return 'Team Lead Hub';
      return 'Participant Dashboard';
    }
    if (currentPath === '/modules') return 'Challenge Modules';
    if (currentPath === '/submissions') return 'Submissions Hub';
    if (currentPath === '/leaderboard') return 'Global Leaderboard';
    if (currentPath.startsWith('/submission/')) return 'Submission Inspection';
    if (currentPath === '/profile') return 'User Profile';
    if (currentPath === '/team') return 'Team Workspace';
    if (currentPath === '/admin') return 'Admin Workspace';
    if (currentPath === '/admin/users') return 'User Permissions';
    return 'TEN Workspace';
  };

  // Render view router based on current path
  const renderMainView = () => {
    if (currentPath.startsWith('/submission/')) {
      const subId = currentPath.split('/submission/')[1];
      return (
        <SubmissionDetailsPage
          submissionId={subId}
          submissions={submissions}
          modules={modules}
          users={users}
          teams={teams}
          onNavigate={handleNavigate}
          onVerifySubmission={handleVerifySubmission}
          onApproveSubmission={handleApproveSubmission}
          onRejectSubmission={handleRejectSubmission}
        />
      );
    }

    switch (currentPath) {
      case '/modules':
        return (
          <ModulesListPage
            modules={modules}
            submissions={submissions}
            teams={teams}
            users={users}
            onNavigate={handleNavigate}
            onSubmitWork={handleSubmitWork}
            onCreateModule={handleCreateModule}
            onDeleteModule={handleDeleteModule}
          />
        );

      case '/submissions':
        return (
          <SubmissionsListPage
            submissions={submissions}
            modules={modules}
            users={users}
            teams={teams}
            onNavigate={handleNavigate}
            onSubmitWork={handleSubmitWork}
          />
        );

      case '/profile':
        return (
          <ProfilePage
            submissions={submissions}
            modules={modules}
            teams={teams}
            onNavigate={handleNavigate}
          />
        );

      case '/leaderboard':
        return (
          <LeaderboardPage
            users={users}
            teams={teams}
            submissions={submissions}
            onNavigate={handleNavigate}
          />
        );

      case '/team':
        return (
          <TeamPage
            teams={teams}
            users={users}
            submissions={submissions}
            modules={modules}
            onNavigate={handleNavigate}
            onCreateGroup={handleCreateGroup}
          />
        );

      case '/admin':
        return (
          <AdminDashboard
            modules={modules}
            submissions={submissions}
            users={users}
            teams={teams}
            onNavigate={handleNavigate}
            onApproveSubmission={handleApproveSubmission}
            onVerifySubmission={handleVerifySubmission}
            onRejectSubmission={handleRejectSubmission}
            onAdjustUserCredits={handleAdjustCredits}
            onCreateModule={handleCreateModule}
          />
        );

      case '/admin/users':
        return (
          <AdminUsersPage
            users={users}
            teams={teams}
            onNavigate={handleNavigate}
            onUpdateUserRole={updateUserRole}
            onAssignUserTeam={assignUserToTeam}
            onAdjustUserCredits={handleAdjustCredits}
          />
        );

      case '/dashboard':
      default:
        if (role === 'admin') {
          return (
            <AdminDashboard
              modules={modules}
              submissions={submissions}
              users={users}
              teams={teams}
              onNavigate={handleNavigate}
              onApproveSubmission={handleApproveSubmission}
              onVerifySubmission={handleVerifySubmission}
              onRejectSubmission={handleRejectSubmission}
              onAdjustUserCredits={handleAdjustCredits}
              onCreateModule={handleCreateModule}
            />
          );
        }
        if (role === 'team_lead') {
          return (
            <TeamLeadDashboard
              modules={modules}
              submissions={submissions}
              users={users}
              teams={teams}
              onNavigate={handleNavigate}
              onVerifySubmission={handleVerifySubmission}
              onRejectSubmission={handleRejectSubmission}
              onCreateModule={handleCreateModule}
              onCreateGroup={handleCreateGroup}
            />
          );
        }
        return (
          <UserDashboard
            modules={modules}
            submissions={submissions}
            users={users}
            teams={teams}
            onNavigate={handleNavigate}
            onSubmitWork={handleSubmitWork}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-background)] text-[var(--color-on-background)] font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          pageTitle={getPageTitle()}
          onNavigate={handleNavigate}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileOpen={isMobileSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
