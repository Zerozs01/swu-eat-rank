import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types/menu';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signInAnon: () => Promise<FirebaseUser>;
  signInWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Create or update user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser, displayName?: string): Promise<User> => {
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      displayName: displayName || firebaseUser.displayName || undefined,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    const updatedData = {
      ...data,
      lastLoginAt: Date.now(),
    };

    await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
    
    // Update local state
    setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
  };

  // Authentication methods
  const signInAnon = async (): Promise<FirebaseUser> => {
    const result = await signInAnonymously(auth);
    return result.user;
  };

  const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile
    await createUserProfile(result.user, displayName);
    
    return result.user;
  };

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create one
    const existingProfile = await fetchUserProfile(result.user.uid);
    if (!existingProfile) {
      await createUserProfile(result.user);
    }
    
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
        
        // Update last login time
        if (profile) {
          await updateUserProfile({ lastLoginAt: Date.now() });
        }
      } else {
        setUserProfile(null);
        // Auto sign in anonymously if no user is signed in
        try {
          console.log('No user found, auto-signing in anonymously...');
          await signInAnon();
        } catch (error) {
          console.error('Failed to auto-sign in anonymously:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInAnon,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
