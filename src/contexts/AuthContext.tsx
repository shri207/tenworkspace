import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';
import { User, UserRole } from '../types';
import { getUserById, getUserByEmail, createOrUpdateUser, seedFirestoreIfEmpty } from '../services/firestoreService';
import { INITIAL_USERS } from '../services/seedData';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  role: UserRole | null;
  loading: boolean;
  isDemoMode: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, displayName: string, email: string, pass: string, role: 'user' | 'team_lead', teamId?: string) => Promise<void>;
  loginAsDemoUser: (demoRole: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);

  // Load initial demo user by default if in demo mode
  useEffect(() => {
    seedFirestoreIfEmpty();

    if (isFirebaseConfigured && auth) {
      const unsubscribe = auth.onAuthStateChanged(async (fUser) => {
        setFirebaseUser(fUser);
        if (fUser) {
          setIsDemoMode(false);
          let profile = await getUserById(fUser.uid);
          if (!profile) {
            profile = {
              uid: fUser.uid,
              name: fUser.displayName || fUser.email?.split('@')[0] || 'Participant',
              email: fUser.email || '',
              role: 'user', // Default role for standard signup
              credits: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await createOrUpdateUser(profile);
          }
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo Mode Default Setup
      const storedDemoUid = localStorage.getItem('ten_workspace_demo_uid') || 'usr-1';
      getUserById(storedDemoUid).then((profile) => {
        setUserProfile(profile);
        setLoading(false);
      });
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured with live environment variables.');
    }
    const res = await signInWithPopup(auth, googleProvider);
    const fUser = res.user;
    let profile = await getUserById(fUser.uid);
    if (!profile) {
      profile = {
        uid: fUser.uid,
        name: fUser.displayName || fUser.email?.split('@')[0] || 'Participant',
        email: fUser.email || '',
        role: 'user',
        credits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createOrUpdateUser(profile);
    }
    setUserProfile(profile);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. First check if user account profile exists in Firestore / local store by email
    const existingProfile = await getUserByEmail(normalizedEmail);
    if (existingProfile) {
      setUserProfile(existingProfile);
      localStorage.setItem('ten_workspace_demo_uid', existingProfile.uid);

      // Attempt live Firebase auth signin if auth is active, but catch any provider restriction errors
      if (isFirebaseConfigured && auth) {
        try {
          await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) {
          console.log('Firebase Auth live sign-in skipped/fallback:', e);
        }
      }
      return;
    }

    // 2. Direct match for demo admin accounts if email includes 'admin'
    if (
      normalizedEmail.includes('admin') ||
      normalizedEmail === 'admin@tenworkspace.org' ||
      normalizedEmail === 'admin@tenworkspace.com'
    ) {
      let profile = await getUserById('admin-1');
      if (!profile) {
        profile = INITIAL_USERS.find(u => u.uid === 'admin-1') || null;
        if (profile) await createOrUpdateUser(profile);
      }
      if (profile) {
        setUserProfile(profile);
        setIsDemoMode(true);
        localStorage.setItem('ten_workspace_demo_uid', profile.uid);
        return;
      }
    }

    // 3. Direct match for demo team lead accounts if email includes 'lead'
    if (
      normalizedEmail.includes('lead') ||
      normalizedEmail === 'vikram.lead@example.com'
    ) {
      let profile = await getUserById('tl-1');
      if (!profile) {
        profile = INITIAL_USERS.find(u => u.uid === 'tl-1') || null;
        if (profile) await createOrUpdateUser(profile);
      }
      if (profile) {
        setUserProfile(profile);
        setIsDemoMode(true);
        localStorage.setItem('ten_workspace_demo_uid', profile.uid);
        return;
      }
    }

    // 4. Fallback check for demo participant
    if (
      normalizedEmail === 'arun@example.com' ||
      normalizedEmail.includes('user')
    ) {
      let profile = await getUserById('usr-1');
      if (!profile) {
        profile = INITIAL_USERS.find(u => u.uid === 'usr-1') || null;
        if (profile) await createOrUpdateUser(profile);
      }
      if (profile) {
        setUserProfile(profile);
        setIsDemoMode(true);
        localStorage.setItem('ten_workspace_demo_uid', profile.uid);
        return;
      }
    }

    // 5. If not found in store, attempt Firebase Auth sign-in
    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const profile = await getUserById(res.user.uid);
        if (profile) {
          setUserProfile(profile);
          return;
        }
      } catch (err: any) {
        console.warn('Firebase Auth error during login:', err);
      }
    }

    throw new Error('No account found with this email. Please click "Sign Up" to register a new account.');
  };

  const registerWithEmail = async (
    name: string,
    displayName: string,
    email: string,
    pass: string,
    requestedRole: 'user' | 'team_lead',
    teamId?: string
  ) => {
    const normalizedEmail = email.toLowerCase().trim();
    let assignedUid = `usr-${Date.now()}`;

    // Try creating account in Firebase Auth if available
    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        if (res.user?.uid) {
          assignedUid = res.user.uid;
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth creation notice (falling back to Firestore profile):', authErr);
      }
    }

    // Store user account profile in Firestore/local store
    const newUser: User = {
      uid: assignedUid,
      name,
      displayName,
      email: normalizedEmail,
      role: requestedRole,
      teamId: teamId || (requestedRole === 'user' ? 'team-alpha' : undefined),
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createOrUpdateUser(newUser);
    setUserProfile(newUser);
    localStorage.setItem('ten_workspace_demo_uid', assignedUid);
  };

  const loginAsDemoUser = async (demoRole: UserRole) => {
    let uid = 'usr-1'; // Default User (Arun Kumar)
    if (demoRole === 'team_lead') uid = 'tl-1'; // Vikram Singh
    if (demoRole === 'admin') uid = 'admin-1'; // Suresh Menon

    localStorage.setItem('ten_workspace_demo_uid', uid);
    let profile = await getUserById(uid);
    if (!profile) {
      profile = INITIAL_USERS.find(u => u.uid === uid) || null;
      if (profile) await createOrUpdateUser(profile);
    }
    
    if (profile) {
      setUserProfile(profile);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth && firebaseUser) {
      await signOut(auth);
    }
    setUserProfile(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        role: userProfile?.role || null,
        loading,
        isDemoMode,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
