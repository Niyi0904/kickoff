// lib/playerLinking.ts
// Pure Firestore functions for player-auth linking system.
// No React — testable and reusable in Cloud Functions later.

import {
  doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, where, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type LinkRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LinkRequest {
  id:          string;
  userId:      string;       // Firebase Auth UID of the requesting user
  playerId:    string;       // Firestore player document ID
  userEmail:   string;
  userName:    string;
  playerName:  string;       // Denormalised for easy admin display
  teamName:    string;       // Denormalised for easy admin display
  status:      LinkRequestStatus;
  createdAt:   any;
  reviewedAt?: any;
  reviewedBy?: string;       // Admin UID who approved/rejected
  rejectNote?: string;
}

// ─────────────────────────────────────────────
// Submit a claim request
// Called when a user clicks "Claim this profile"
// ─────────────────────────────────────────────
export async function submitLinkRequest(
  userId:     string,
  playerId:   string,
  userEmail:  string,
  userName:   string,
  playerName: string,
  teamName:   string,
): Promise<{ id: string; error: null } | { error: any }> {
  try {
    console.log('Submitting link request for userId:', userId, 'playerId:', playerId);
    // Block if user already has a pending/approved request
    const existingUserReq = query(
      collection(db, 'link_requests'),
      where('userId', '==', userId),
      where('status', 'in', ['pending', 'approved']),
    );
    const userSnap = await getDocs(existingUserReq);
    if (!userSnap.empty) {
      return { error: { code: 'ALREADY_REQUESTED', message: 'You already have a pending or approved link request.' } };
    }

    // Block if player is already linked to another user
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    if (playerDoc.exists() && playerDoc.data()?.linkedUserId) {
      return { error: { code: 'ALREADY_LINKED', message: 'This player profile is already claimed.' } };
    }

    // Block if another user already has a pending request for this player
    const existingPlayerReq = query(
      collection(db, 'link_requests'),
      where('playerId', '==', playerId),
      where('status', '==', 'pending'),
    );
    const playerSnap = await getDocs(existingPlayerReq);
    if (!playerSnap.empty) {
      return { error: { code: 'PENDING_EXISTS', message: 'Another user has already requested this profile. Please wait for admin review.' } };
    }

    const ref = await addDoc(collection(db, 'link_requests'), {
      userId,
      playerId,
      userEmail,
      userName,
      playerName,
      teamName,
      status:    'pending' as LinkRequestStatus,
      createdAt: serverTimestamp(),
    });

    return { id: ref.id, error: null };
  } catch (error) {
    console.log('Error submitting link request:', error);
    return { error };
  }
}

// ─────────────────────────────────────────────
// Get all pending link requests (admin panel)
// ─────────────────────────────────────────────
export async function getPendingLinkRequests(): Promise<LinkRequest[]> {
  const q    = query(collection(db, 'link_requests'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as LinkRequest);
}

// ─────────────────────────────────────────────
// Get all link requests (admin panel — all statuses)
// ─────────────────────────────────────────────
export async function getAllLinkRequests(): Promise<LinkRequest[]> {
  const snap = await getDocs(collection(db, 'link_requests'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as LinkRequest)
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// ─────────────────────────────────────────────
// Get the link request for a specific user
// ─────────────────────────────────────────────
export async function getUserLinkRequest(userId: string): Promise<LinkRequest | null> {
  const q    = query(collection(db, 'link_requests'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as LinkRequest;
}

// ─────────────────────────────────────────────
// Approve a link request
// Writes linkedUserId to the player document
// ─────────────────────────────────────────────
export async function approveLinkRequest(
  requestId:  string,
  playerId:   string,
  userId:     string,
  adminUid:   string,
): Promise<void> {
  const playerSnap = await getDoc(doc(db, 'players', playerId));
  const playerData = playerSnap.exists() ? playerSnap.data() : null;
  const teamId = playerData?.team_id ?? playerData?.teamId ?? null;

  const batch = writeBatch(db);

  // Update request status
  batch.update(doc(db, 'link_requests', requestId), {
    status:     'approved' as LinkRequestStatus,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  });

  // Write linkedUserId to the player document
  batch.update(doc(db, 'players', playerId), {
    linkedUserId: userId,
  });

  // Update user roles document with linked playerId and teamId
  batch.set(doc(db, 'user_roles', userId), {
    playerId: playerId,
    teamId: teamId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();
}

// ─────────────────────────────────────────────
// Reject a link request
// ─────────────────────────────────────────────
export async function rejectLinkRequest(
  requestId: string,
  adminUid:  string,
  note:      string,
): Promise<void> {
  await updateDoc(doc(db, 'link_requests', requestId), {
    status:     'rejected' as LinkRequestStatus,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
    rejectNote: note,
  });
}

// ─────────────────────────────────────────────
// Get the player profile linked to a user
// Returns null if not linked yet
// ─────────────────────────────────────────────
export async function getLinkedPlayer(userId: string): Promise<{ id: string; [key: string]: any } | null> {
  const q    = query(collection(db, 'players'), where('linkedUserId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ─────────────────────────────────────────────
// Unlink a player from a user (admin action)
// ─────────────────────────────────────────────
export async function unlinkPlayer(playerId: string): Promise<void> {
  const playerSnap = await getDoc(doc(db, 'players', playerId));
  const linkedUserId = playerSnap.exists() ? playerSnap.data()?.linkedUserId : null;

  const batch = writeBatch(db);
  
  // Set player's linkedUserId to null
  batch.update(doc(db, 'players', playerId), { linkedUserId: null });

  if (linkedUserId) {
    // Remove playerId and teamId from user_roles
    batch.update(doc(db, 'user_roles', linkedUserId), {
      playerId: null,
      teamId: null,
      updatedAt: serverTimestamp()
    });
  }

  // Find any link requests for this playerId and delete them
  const q = query(collection(db, 'link_requests'), where('playerId', '==', playerId));
  const snap = await getDocs(q);
  snap.docs.forEach(d => {
    batch.delete(d.ref);
  });

  await batch.commit();
}