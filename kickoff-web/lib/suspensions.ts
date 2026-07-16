// lib/suspensions.ts
// Pure Firestore functions for the suspension system.
// No React — fully testable, usable in Cloud Functions later.

import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, writeBatch,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type SuspensionReason = 'yellow_accumulation' | 'red_card';
export type SuspensionStatus = 'active' | 'served' | 'overridden';

export interface Suspension {
  id:             string;
  playerId:       string;
  reason:         SuspensionReason;
  triggerMatchId: string;   // match that triggered the suspension
  matchesBanned:  number;   // total matches to sit out
  matchesServed:  number;   // matches already served
  active:         boolean;
  status:         SuspensionStatus;
  createdAt:      any;
  leagueId?:      string | null;
  overriddenBy?:  string;   // admin UID who overrode
  overrideNote?:  string;   // reason for override
  overriddenAt?:  any;
}

export interface SuspensionCheck {
  isSuspended:   boolean;
  suspension:    Suspension | null;
  matchesLeft:   number;
}

// ─────────────────────────────────────────────
// Check if a player is currently suspended
// ─────────────────────────────────────────────
export async function checkPlayerSuspension(playerId: string): Promise<SuspensionCheck> {
  try {
    const q = query(
      collection(db, 'suspensions'),
      where('playerId', '==', playerId),
      where('active', '==', true),
    );
    const snap = await getDocs(q);

    if (snap.empty) return { isSuspended: false, suspension: null, matchesLeft: 0 };

    const suspDoc  = snap.docs[0];
    const susp     = { id: suspDoc.id, ...suspDoc.data() } as Suspension;
    const matchesLeft = susp.matchesBanned - susp.matchesServed;

    return { isSuspended: matchesLeft > 0, suspension: susp, matchesLeft };
  } catch {
    return { isSuspended: false, suspension: null, matchesLeft: 0 };
  }
}

// ─────────────────────────────────────────────
// Get all active suspensions (for admin panel)
// ─────────────────────────────────────────────
export async function getActiveSuspensions(leagueId?: string): Promise<Suspension[]> {
  const constraints = leagueId
    ? [where('active', '==', true), where('leagueId', '==', leagueId), orderBy('createdAt', 'desc')]
    : [where('active', '==', true), orderBy('createdAt', 'desc')];
  const q = query(collection(db, 'suspensions'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Suspension);
}

// ─────────────────────────────────────────────
// Get all suspensions for a specific player
// ─────────────────────────────────────────────
export async function getPlayerSuspensions(playerId: string): Promise<Suspension[]> {
  const q = query(
    collection(db, 'suspensions'),
    where('playerId', '==', playerId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Suspension);
}

// ─────────────────────────────────────────────
// Create a suspension
// Called automatically after recording match stats
// ─────────────────────────────────────────────
export async function createSuspension(
  playerId:       string,
  reason:         SuspensionReason,
  triggerMatchId: string,
  matchesBanned:  number = 1,
): Promise<string> {
  let leagueId: string | null = null;
  const matchSnap = await getDoc(doc(db, 'matches', triggerMatchId));
  if (matchSnap.exists()) {
    leagueId = matchSnap.data()?.leagueId ?? null;
  }

  if (!leagueId) {
    const playerSnap = await getDoc(doc(db, 'players', playerId));
    leagueId = playerSnap.exists() ? playerSnap.data()?.leagueId ?? null : null;
  }

  const ref = await addDoc(collection(db, 'suspensions'), {
    playerId,
    reason,
    triggerMatchId,
    matchesBanned,
    matchesServed: 0,
    active:        true,
    status:        'active' as SuspensionStatus,
    leagueId,
    createdAt:     serverTimestamp(),
  });
  return ref.id;
}

// ─────────────────────────────────────────────
// Evaluate whether a match event should trigger a suspension
// Called after recording yellow/red cards for a match
// ─────────────────────────────────────────────
export async function evaluateSuspensions(
  matchId:      string,
  playerIds:    { yellows: string[]; reds: string[] },
  yellowsPerBan: number = 3,
): Promise<{ created: string[]; errors: string[] }> {
  const created: string[] = [];
  const errors:  string[] = [];

  // ── Red cards — instant 1-match ban ───────────────────────────────────
  for (const playerId of playerIds.reds) {
    try {
      // Check if suspension already exists for this match + player
      const existing = query(
        collection(db, 'suspensions'),
        where('playerId',       '==', playerId),
        where('triggerMatchId', '==', matchId),
        where('reason',         '==', 'red_card'),
      );
      const existingSnap = await getDocs(existing);
      if (!existingSnap.empty) continue;

      const id = await createSuspension(playerId, 'red_card', matchId, 1);
      created.push(id);
    } catch (e: any) {
      errors.push(`Red card suspension failed for ${playerId}: ${e.message}`);
    }
  }

  // ── Yellow card accumulation ───────────────────────────────────────────
  for (const playerId of playerIds.yellows) {
    try {
      // Count ALL yellow cards for this player across all matches
      const yellowSnap = await getDocs(
        query(collection(db, 'yellow_cards'), where('playerId', '==', playerId))
      );
      const totalYellows = yellowSnap.size;

      // A ban triggers when total yellows is an exact multiple of yellowsPerBan
      if (totalYellows > 0 && totalYellows % yellowsPerBan === 0) {
        // Check if suspension already exists for this threshold
        const existing = query(
          collection(db, 'suspensions'),
          where('playerId',       '==', playerId),
          where('triggerMatchId', '==', matchId),
          where('reason',         '==', 'yellow_accumulation'),
        );
        const existingSnap = await getDocs(existing);
        if (!existingSnap.empty) continue;

        const id = await createSuspension(playerId, 'yellow_accumulation', matchId, 1);
        created.push(id);
      }
    } catch (e: any) {
      errors.push(`Yellow accumulation check failed for ${playerId}: ${e.message}`);
    }
  }

  return { created, errors };
}

// ─────────────────────────────────────────────
// Mark a suspension as served (called when a match is played)
// Pass in all player IDs who participated in the match
// ─────────────────────────────────────────────
export async function markSuspensionsServed(participatingPlayerIds: string[]): Promise<void> {
  if (participatingPlayerIds.length === 0) return;

  const batch = writeBatch(db);

  for (const playerId of participatingPlayerIds) {
    const q = query(
      collection(db, 'suspensions'),
      where('playerId', '==', playerId),
      where('active',   '==', true),
    );
    const snap = await getDocs(q);

    snap.docs.forEach(d => {
      const susp = d.data() as Suspension;
      const newServed = susp.matchesServed + 1;
      const isFullyServed = newServed >= susp.matchesBanned;

      batch.update(d.ref, {
        matchesServed: newServed,
        active:        !isFullyServed,
        status:        isFullyServed ? 'served' : 'active',
      });
    });
  }

  await batch.commit();
}

// ─────────────────────────────────────────────
// Admin override — lift a suspension
// ─────────────────────────────────────────────
export async function overrideSuspension(
  suspensionId: string,
  adminUid:     string,
  note:         string,
): Promise<void> {
  await updateDoc(doc(db, 'suspensions', suspensionId), {
    active:        false,
    status:        'overridden' as SuspensionStatus,
    overriddenBy:  adminUid,
    overrideNote:  note,
    overriddenAt:  serverTimestamp(),
  });
}