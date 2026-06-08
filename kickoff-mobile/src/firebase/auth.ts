import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, UserRoleDoc, RoleType } from '../lib/types';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user document
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      displayName,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Assign default role (player)
    const roleData: UserRoleDoc = {
      uid: firebaseUser.uid,
      role: 'player',
    };

    await setDoc(doc(db, 'user_roles', firebaseUser.uid), roleData);

    return firebaseUser;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

/**
 * Get user role
 */
export const getUserRole = async (uid: string): Promise<UserRoleDoc | null> => {
  try {
    const roleDoc = await getDoc(doc(db, 'user_roles', uid));
    if (!roleDoc.exists()) return { uid, role: 'player' };
    const data = roleDoc.data();
    return {
      uid,
      role: (data?.role as RoleType) ?? 'player',
      teamId: data?.teamId ?? undefined,
      playerId: data?.playerId ?? undefined,
    };
  } catch (error) {
    console.error('Get user role error:', error);
    return { uid, role: 'player' };
  }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current auth user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
