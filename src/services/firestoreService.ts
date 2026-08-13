import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/handleError';
import {
  User,
  Team,
  Module,
  Submission,
  CreditTransaction,
  Notification,
  SubmissionStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TEAMS,
  INITIAL_MODULES,
  INITIAL_SUBMISSIONS,
  INITIAL_CREDIT_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from './seedData';

const LOCAL_STORAGE_KEY = 'ten_workspace_challenge_state_v1';

// Internal state for demo/fallback mode
interface LocalStore {
  users: User[];
  teams: Team[];
  modules: Module[];
  submissions: Submission[];
  creditTransactions: CreditTransaction[];
  notifications: Notification[];
}

function loadLocalStore(): LocalStore {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse local storage:', e);
  }

  const initial: LocalStore = {
    users: INITIAL_USERS,
    teams: INITIAL_TEAMS,
    modules: INITIAL_MODULES,
    submissions: INITIAL_SUBMISSIONS,
    creditTransactions: INITIAL_CREDIT_TRANSACTIONS,
    notifications: INITIAL_NOTIFICATIONS,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveLocalStore(store: LocalStore) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save to local storage:', e);
  }
}

// Event listeners for local mode reactive updates
type ChangeCallback = () => void;
const localChangeListeners: Set<ChangeCallback> = new Set();

function notifyLocalChanges() {
  localChangeListeners.forEach((cb) => cb());
}

export function subscribeToStoreChanges(callback: () => void): () => void {
  localChangeListeners.add(callback);
  return () => {
    localChangeListeners.delete(callback);
  };
}

// Seed Firestore with initial demo data if empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    if (!usersSnap.empty) return; // already seeded

    console.log('Seeding initial Firestore benchmark data...');

    for (const u of INITIAL_USERS) {
      await setDoc(doc(db, 'users', u.uid), u);
    }
    for (const t of INITIAL_TEAMS) {
      await setDoc(doc(db, 'teams', t.id), t);
    }
    for (const m of INITIAL_MODULES) {
      await setDoc(doc(db, 'modules', m.id), m);
    }
    for (const s of INITIAL_SUBMISSIONS) {
      await setDoc(doc(db, 'submissions', s.id), s);
    }
    for (const ct of INITIAL_CREDIT_TRANSACTIONS) {
      await setDoc(doc(db, 'creditTransactions', ct.id), ct);
    }
    for (const n of INITIAL_NOTIFICATIONS) {
      await setDoc(doc(db, 'notifications', n.id), n);
    }
    console.log('Firestore seed completed successfully.');
  } catch (err) {
    console.warn('Firestore seed warning:', err);
  }
}

// ================= USER OPERATIONS =================

export function listenToUsers(callback: (users: User[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'users'), orderBy('credits', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => doc.data() as User);
        callback(users);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'users')
    );
  } else {
    const update = () => {
      const store = loadLocalStore();
      const sorted = [...store.users].sort((a, b) => b.credits - a.credits);
      callback(sorted);
    };
    update();
    return subscribeToStoreChanges(update);
  }
}

export async function getUserById(uid: string): Promise<User | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      return docSnap.exists() ? (docSnap.data() as User) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  } else {
    const store = loadLocalStore();
    return store.users.find((u) => u.uid === uid) || null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normEmail = email.toLowerCase().trim();
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', normEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as User;
      }
      // Fallback check case-insensitive in all users list if needed
      const allUsersSnap = await getDocs(collection(db, 'users'));
      const found = allUsersSnap.docs.find(
        (d) => (d.data() as User).email?.toLowerCase().trim() === normEmail
      );
      return found ? (found.data() as User) : null;
    } catch (error) {
      console.warn('getUserByEmail error, checking local store:', error);
    }
  }
  const store = loadLocalStore();
  return (
    store.users.find((u) => u.email?.toLowerCase().trim() === normEmail) || null
  );
}

export async function deleteUserAccount(userId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  } else {
    const store = loadLocalStore();
    store.users = store.users.filter((u) => u.uid !== userId);
    saveLocalStore(store);
    notifyLocalChanges();
  }
}

export async function createOrUpdateUser(user: User): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.users.findIndex((u) => u.uid === user.uid);
    if (idx >= 0) {
      store.users[idx] = { ...store.users[idx], ...user };
    } else {
      store.users.push(user);
    }
    saveLocalStore(store);
    notifyLocalChanges();
  }
}

// ================= TEAMS OPERATIONS =================

export function listenToTeams(callback: (teams: Team[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    return onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const teams = snapshot.docs.map((doc) => doc.data() as Team);
        callback(teams);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'teams')
    );
  } else {
    const update = () => {
      const store = loadLocalStore();
      callback(store.teams);
    };
    update();
    return subscribeToStoreChanges(update);
  }
}

export async function createTeamGroup(teamData: {
  name: string;
  teamLeadId: string;
  memberIds: string[];
}): Promise<Team> {
  const teamId = `team-${Date.now()}`;
  const now = new Date().toISOString();

  // Ensure unique list of member IDs and include teamLeadId
  const allMemberIds = Array.from(new Set([...teamData.memberIds, teamData.teamLeadId]));

  const newTeam: Team = {
    id: teamId,
    name: teamData.name,
    teamLeadId: teamData.teamLeadId,
    memberIds: allMemberIds,
    createdAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);

      // Save Team doc
      batch.set(doc(db, 'teams', teamId), newTeam);

      // Update users teamId and send notifications
      for (const uid of allMemberIds) {
        batch.update(doc(db, 'users', uid), { teamId, updatedAt: now });

        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          id: notifRef.id,
          userId: uid,
          title: `Added to Group: ${newTeam.name}`,
          message: `You have been added to group "${newTeam.name}" by your Team Lead.`,
          type: 'system',
          read: false,
          createdAt: now,
          link: '/team',
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'teams');
    }
  } else {
    const store = loadLocalStore();
    store.teams.push(newTeam);

    for (const uid of allMemberIds) {
      const uIdx = store.users.findIndex((u) => u.uid === uid);
      if (uIdx >= 0) {
        store.users[uIdx].teamId = teamId;
        store.users[uIdx].updatedAt = now;
      }

      store.notifications.push({
        id: `notif-${Date.now()}-${uid}`,
        userId: uid,
        title: `Added to Group: ${newTeam.name}`,
        message: `You have been added to group "${newTeam.name}" by your Team Lead.`,
        type: 'system',
        read: false,
        createdAt: now,
        link: '/team',
      });
    }

    saveLocalStore(store);
    notifyLocalChanges();
  }

  return newTeam;
}

export async function updateTeamGroupMembers(
  teamId: string,
  memberIds: string[]
): Promise<void> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, { memberIds });
      for (const uid of memberIds) {
        await updateDoc(doc(db, 'users', uid), { teamId, updatedAt: now });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `teams/${teamId}`);
    }
  } else {
    const store = loadLocalStore();
    const tIdx = store.teams.findIndex((t) => t.id === teamId);
    if (tIdx >= 0) {
      store.teams[tIdx].memberIds = memberIds;
      for (const uid of memberIds) {
        const uIdx = store.users.findIndex((u) => u.uid === uid);
        if (uIdx >= 0) {
          store.users[uIdx].teamId = teamId;
          store.users[uIdx].updatedAt = now;
        }
      }
      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}


// ================= MODULES OPERATIONS =================

export function listenToModules(callback: (modules: Module[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'modules'), orderBy('createdAt', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const modules = snapshot.docs.map((doc) => doc.data() as Module);
        callback(modules);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'modules')
    );
  } else {
    const update = () => {
      const store = loadLocalStore();
      callback(store.modules);
    };
    update();
    return subscribeToStoreChanges(update);
  }
}

export async function createModule(moduleData: Omit<Module, 'id' | 'createdAt'>): Promise<Module> {
  const newModule: Module = {
    ...moduleData,
    id: `mod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'modules', newModule.id), newModule);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'modules');
    }
  } else {
    const store = loadLocalStore();
    store.modules.push(newModule);
    saveLocalStore(store);
    notifyLocalChanges();
  }

  return newModule;
}

export async function deleteModule(moduleId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'modules', moduleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `modules/${moduleId}`);
    }
  } else {
    const store = loadLocalStore();
    store.modules = store.modules.filter((m) => m.id !== moduleId);
    saveLocalStore(store);
    notifyLocalChanges();
  }
}

// ================= SUBMISSIONS OPERATIONS =================

export function listenToSubmissions(callback: (submissions: Submission[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const subs = snapshot.docs.map((doc) => doc.data() as Submission);
        callback(subs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'submissions')
    );
  } else {
    const update = () => {
      const store = loadLocalStore();
      const sorted = [...store.submissions].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      callback(sorted);
    };
    update();
    return subscribeToStoreChanges(update);
  }
}

export async function createSubmission(
  subData: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Submission> {
  const store = loadLocalStore();
  
  // Prevent duplicate submissions for the same module unless previous was rejected
  const existingSubmissions = isFirebaseConfigured && db
    ? (await getDocs(query(collection(db, 'submissions'), where('userId', '==', subData.userId), where('moduleId', '==', subData.moduleId)))).docs.map((d) => d.data() as Submission)
    : store.submissions.filter((s) => s.userId === subData.userId && s.moduleId === subData.moduleId);

  const activeSub = existingSubmissions.find((s) => s.status !== 'rejected');
  if (activeSub) {
    throw new Error('You already have an active submission for this module.');
  }

  const now = new Date().toISOString();
  const newSub: Submission = {
    ...subData,
    id: `sub-${Date.now()}`,
    submittedAt: now,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'submissions', newSub.id), newSub);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  } else {
    store.submissions.push(newSub);
    
    // Create notification for team lead
    const team = store.teams.find((t) => t.id === subData.teamId);
    if (team) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: team.teamLeadId,
        title: 'New Submission Pending Review',
        message: `A team member submitted a solution for Module review.`,
        type: 'verification',
        read: false,
        createdAt: now,
        link: `/submission/${newSub.id}`,
      };
      store.notifications.push(notif);
    }

    saveLocalStore(store);
    notifyLocalChanges();
  }

  return newSub;
}

// Convenience exported aliases for app components
export const createSubmissionRecord = createSubmission;
export const verifySubmissionByLead = verifySubmission;
export const approveSubmissionByAdmin = approveSubmissionAndAwardCredits;

export async function adjustUserCredits(
  userId: string,
  newCredits: number,
  reason: string
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        credits: newCredits,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.users.findIndex((u) => u.uid === userId);
    if (idx >= 0) {
      store.users[idx].credits = newCredits;
      store.users[idx].updatedAt = now;

      store.creditTransactions.push({
        id: `ctx-adj-${Date.now()}`,
        userId,
        amount: newCredits,
        type: 'admin_adjustment',
        description: `Admin Adjustment: ${reason}`,
        createdAt: now,
      });

      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.users.findIndex((u) => u.uid === userId);
    if (idx >= 0) {
      store.users[idx] = { ...store.users[idx], ...updates, updatedAt: now };
      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'team_lead' | 'admin'
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.users.findIndex((u) => u.uid === userId);
    if (idx >= 0) {
      store.users[idx].role = role;
      store.users[idx].updatedAt = now;
      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}

export async function assignUserToTeam(userId: string, teamId: string): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        teamId,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.users.findIndex((u) => u.uid === userId);
    if (idx >= 0) {
      store.users[idx].teamId = teamId;
      store.users[idx].updatedAt = now;
      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}
export async function verifySubmission(
  submissionId: string,
  reviewerId: string,
  comment?: string
): Promise<void> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const subRef = doc(db, 'submissions', submissionId);
      await updateDoc(subRef, {
        status: 'verified',
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewComment: comment || 'Verified by Team Lead.',
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${submissionId}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.submissions.findIndex((s) => s.id === submissionId);
    if (idx >= 0) {
      store.submissions[idx] = {
        ...store.submissions[idx],
        status: 'verified',
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewComment: comment || 'Verified by Team Lead.',
        updatedAt: now,
      };

      // Create notification for user
      const userNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: store.submissions[idx].userId,
        title: 'Submission Verified',
        message: 'Your module submission was verified by your Team Lead and is now in Admin queue.',
        type: 'verification',
        read: false,
        createdAt: now,
        link: `/submission/${submissionId}`,
      };
      store.notifications.push(userNotif);

      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}

// Team Lead or Admin Rejection
export async function rejectSubmission(
  submissionId: string,
  reviewerId: string,
  comment: string
): Promise<void> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const subRef = doc(db, 'submissions', submissionId);
      await updateDoc(subRef, {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewComment: comment,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${submissionId}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.submissions.findIndex((s) => s.id === submissionId);
    if (idx >= 0) {
      store.submissions[idx] = {
        ...store.submissions[idx],
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewComment: comment,
        updatedAt: now,
      };

      // Create notification for user
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: store.submissions[idx].userId,
        title: 'Submission Requires Revision',
        message: `Your submission was rejected. Feedback: ${comment}`,
        type: 'rejection',
        read: false,
        createdAt: now,
        link: `/submission/${submissionId}`,
      };
      store.notifications.push(notif);

      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}

// Admin Approval & Atomic Credit Allocation
export async function approveSubmissionAndAwardCredits(
  submissionId: string,
  adminId: string,
  reviewComment?: string
): Promise<void> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      await runTransaction(db, async (transaction) => {
        const subRef = doc(db, 'submissions', submissionId);
        const subSnap = await transaction.get(subRef);
        if (!subSnap.exists()) throw new Error('Submission not found.');

        const sub = subSnap.data() as Submission;
        if (sub.status === 'approved' || sub.userCreditsAwarded) {
          throw new Error('Submission is already approved and credits have been awarded.');
        }

        const modRef = doc(db, 'modules', sub.moduleId);
        const modSnap = await transaction.get(modRef);
        if (!modSnap.exists()) throw new Error('Associated module not found.');
        const mod = modSnap.data() as Module;

        const creditValue = mod.creditValue || 100;

        // Fetch User
        const userRef = doc(db, 'users', sub.userId);
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.exists() ? (userSnap.data() as User) : null;

        // Fetch Team & Team Lead
        let teamLeadUserRef = null;
        let teamLeadData: User | null = null;
        if (sub.teamId) {
          const teamRef = doc(db, 'teams', sub.teamId);
          const teamSnap = await transaction.get(teamRef);
          if (teamSnap.exists()) {
            const team = teamSnap.data() as Team;
            if (team.teamLeadId) {
              teamLeadUserRef = doc(db, 'users', team.teamLeadId);
              const tlSnap = await transaction.get(teamLeadUserRef);
              if (tlSnap.exists()) {
                teamLeadData = tlSnap.data() as User;
              }
            }
          }
        }

        // 1. Update Submission status
        transaction.update(subRef, {
          status: 'approved',
          approvedBy: adminId,
          approvedAt: now,
          userCreditsAwarded: creditValue,
          teamLeadCreditsAwarded: creditValue,
          reviewComment: reviewComment || sub.reviewComment || 'Approved by Admin.',
          updatedAt: now,
        });

        // 2. Award credits to User
        if (userSnap.exists() && userData) {
          transaction.update(userRef, {
            credits: (userData.credits || 0) + creditValue,
            updatedAt: now,
          });

          // User Credit Transaction
          const uTxRef = doc(collection(db, 'creditTransactions'));
          transaction.set(uTxRef, {
            id: uTxRef.id,
            userId: sub.userId,
            submissionId,
            amount: creditValue,
            type: 'module_completion',
            description: `${mod.title} approved (+${creditValue} credits)`,
            createdAt: now,
          });
        }

        // 3. Award credits to Team Lead
        if (teamLeadUserRef && teamLeadData) {
          transaction.update(teamLeadUserRef, {
            credits: (teamLeadData.credits || 0) + creditValue,
            updatedAt: now,
          });

          // Team Lead Credit Transaction
          const tlTxRef = doc(collection(db, 'creditTransactions'));
          transaction.set(tlTxRef, {
            id: tlTxRef.id,
            userId: teamLeadData.uid,
            submissionId,
            amount: creditValue,
            type: 'team_lead_bonus',
            description: `Team member module completion bonus (+${creditValue} credits)`,
            createdAt: now,
          });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `submissions/${submissionId}`);
    }
  } else {
    // Local / Demo Mode Execution
    const store = loadLocalStore();
    const idx = store.submissions.findIndex((s) => s.id === submissionId);
    if (idx < 0) throw new Error('Submission not found');

    const sub = store.submissions[idx];
    if (sub.status === 'approved' || sub.userCreditsAwarded) {
      throw new Error('Credits already awarded for this submission.');
    }

    const mod = store.modules.find((m) => m.id === sub.moduleId);
    const creditValue = mod?.creditValue || 100;

    // 1. Update Submission
    store.submissions[idx] = {
      ...sub,
      status: 'approved',
      approvedBy: adminId,
      approvedAt: now,
      userCreditsAwarded: creditValue,
      teamLeadCreditsAwarded: creditValue,
      reviewComment: reviewComment || sub.reviewComment || 'Approved by Admin.',
      updatedAt: now,
    };

    // 2. Update User credits
    const uIdx = store.users.findIndex((u) => u.uid === sub.userId);
    if (uIdx >= 0) {
      store.users[uIdx].credits = (store.users[uIdx].credits || 0) + creditValue;
      store.users[uIdx].updatedAt = now;

      store.creditTransactions.push({
        id: `ctx-${Date.now()}-1`,
        userId: sub.userId,
        submissionId,
        amount: creditValue,
        type: 'module_completion',
        description: `${mod?.title || 'Module'} approved (+${creditValue} credits)`,
        createdAt: now,
      });

      // User notification
      store.notifications.push({
        id: `notif-${Date.now()}-u`,
        userId: sub.userId,
        title: `+${creditValue} Credits Awarded!`,
        message: `Admin approved your submission for ${mod?.title || 'Module'}.`,
        type: 'credits',
        read: false,
        createdAt: now,
        link: `/submission/${submissionId}`,
      });
    }

    // 3. Update Team Lead credits
    if (sub.teamId) {
      const team = store.teams.find((t) => t.id === sub.teamId);
      if (team && team.teamLeadId) {
        const tlIdx = store.users.findIndex((u) => u.uid === team.teamLeadId);
        if (tlIdx >= 0) {
          store.users[tlIdx].credits = (store.users[tlIdx].credits || 0) + creditValue;
          store.users[tlIdx].updatedAt = now;

          store.creditTransactions.push({
            id: `ctx-${Date.now()}-2`,
            userId: team.teamLeadId,
            submissionId,
            amount: creditValue,
            type: 'team_lead_bonus',
            description: `Team lead bonus for member completion (+${creditValue} credits)`,
            createdAt: now,
          });

          // Team lead notification
          store.notifications.push({
            id: `notif-${Date.now()}-tl`,
            userId: team.teamLeadId,
            title: `+${creditValue} Team Lead Bonus!`,
            message: `Submission by ${store.users[uIdx]?.name || 'team member'} was approved.`,
            type: 'credits',
            read: false,
            createdAt: now,
            link: `/submission/${submissionId}`,
          });
        }
      }
    }

    saveLocalStore(store);
    notifyLocalChanges();
  }
}

// ================= CREDIT TRANSACTIONS =================

export function listenToCreditTransactions(
  userId: string,
  callback: (txs: CreditTransaction[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'creditTransactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const txs = snapshot.docs.map((doc) => doc.data() as CreditTransaction);
        callback(txs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'creditTransactions')
    );
  } else {
    const update = () => {
      const store = loadLocalStore();
      const filtered = store.creditTransactions
        .filter((t) => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(filtered);
    };
    update();
    return subscribeToStoreChanges(update);
  }
}

// ================= NOTIFICATIONS =================

export function listenToNotifications(
  userId: string,
  callback: (notifs: Notification[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => doc.data() as Notification);
        callback(notifs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'notifications')
    );
  } else {
    const update = () => {
      const store = loadLocalStore();
      const filtered = store.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(filtered);
    };
    update();
    return subscribeToStoreChanges(update);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  } else {
    const store = loadLocalStore();
    const idx = store.notifications.findIndex((n) => n.id === id);
    if (idx >= 0) {
      store.notifications[idx].read = true;
      saveLocalStore(store);
      notifyLocalChanges();
    }
  }
}
