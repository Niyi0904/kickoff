'use client';

import { useState, useEffect, useRef } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument } from "@/lib/firestore";
import { uploadProfileImage } from "@/lib/uploadImage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─────────────────────────────────────────────
// Secure admin check
//
// We do NOT use the isAdmin boolean from client
// state as the source of truth for writes —
// Firestore Security Rules handle that server-side.
//
// This function's job is purely to control UI
// visibility (show/hide admin buttons). It reads
// user_roles/{uid} directly, same collection the
// Security Rules check, so it stays in sync.
//
// Failures default to false — a Firestore error
// never accidentally grants admin access.
// ─────────────────────────────────────────────
async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    // Force a fresh token to ensure the auth session is valid
    // before making the role check. This prevents stale sessions
    // from retaining admin state after a password change or revocation.
    await auth.currentUser?.getIdToken(/* forceRefresh */ true);

    const roleSnap = await getDoc(doc(db, "user_roles", uid));
    if (!roleSnap.exists()) return false;
    return roleSnap.data()?.role === "admin";
  } catch (error) {
    // Deliberately fail closed — never grant admin on error
    console.error("Admin check failed:", error);
    return false;
  }
}

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track the current user's uid in a ref so the async admin
  // check can bail out if the user logs out while it's in flight.
  // Without this, a slow Firestore read could set isAdmin: true
  // on a session that no longer exists.
  const currentUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      currentUidRef.current = currentUser?.uid ?? null;

      if (currentUser) {
        // isAdmin defaults to false while the async check runs.
        // Users see non-admin UI momentarily, never admin UI incorrectly.
        setIsAdmin(false);

        const adminStatus = await checkIsAdmin(currentUser.uid);

        // Only apply the result if this user is still the active session.
        // Guards against the race condition: user logs out while
        // checkIsAdmin is awaiting the Firestore read.
        if (currentUidRef.current === currentUser.uid) {
          setIsAdmin(adminStatus);
        }
      } else {
        // Signed out — always clear admin state immediately
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Sign in ────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // ── Sign up ────────────────────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    file?: File | null
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      let photoUrl: string | null = null;
      if (file) {
        try {
          const uploadRes = await uploadProfileImage(file);
          photoUrl = uploadRes?.data?.url ?? null;
        } catch (uploadError) {
          console.error("Profile image upload failed", uploadError);
        }
      }

      try {
        await updateProfile(result.user, {
          displayName,
          photoURL: photoUrl ?? undefined,
        });
      } catch (profileErr) {
        console.error("updateProfile error", profileErr);
      }

      await createUserDocument(
        result.user.uid,
        email,
        displayName,
        photoUrl ?? undefined
      );

      return { error: null, userId: result.user.uid };
    } catch (error: any) {
      return { error, userId: null };
    }
  };

  // ── Sign out ───────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      // Clear admin state immediately on sign out — don't wait for
      // onAuthStateChanged to fire, which could have a small delay
      setIsAdmin(false);
      currentUidRef.current = null;
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error("Sign out error:", error);
    }
  };

  return { user, isAdmin, loading, signIn, signUp, signOut };
}