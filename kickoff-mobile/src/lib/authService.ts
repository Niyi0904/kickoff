/**
 * authService.ts
 *
 * Thin wrappers around the Firebase auth functions so that screens
 * can continue to import from this file without needing to know about
 * the firebase package directly.
 */

import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOutUser,
} from '../firebase/auth';

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  displayName?: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

/** Sign in with Firebase email/password. */
export async function signIn({ email, password }: SignInPayload): Promise<any> {
  try {
    return await firebaseSignIn(email, password);
  } catch (error: any) {
    throw new Error(error?.message || 'Sign-in failed');
  }
}

/** Sign up a new user with Firebase. */
export async function signUp({
  email,
  password,
  displayName = '',
}: SignUpPayload): Promise<any> {
  try {
    return await firebaseSignUp(email, password, displayName);
  } catch (error: any) {
    throw new Error(error?.message || 'Sign-up failed');
  }
}

/** Send a password-reset email via Firebase. */
export async function forgotPassword({
  email,
}: ForgotPasswordPayload): Promise<void> {
  try {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    const { auth } = await import('../firebase/config');
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error?.message || 'Password reset failed');
  }
}

/** Sign out the current user. */
export { signOutUser };
