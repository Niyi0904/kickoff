// lib/transfers.ts
// Pure Firestore functions for the player transfer system.
// No React — fully testable, usable in Cloud Functions later.
//
// Design notes:
//  - The player's canonical current team stays `team_id` (as stored today).
//    We additionally mirror it into `current_team_id` for the new schema.
//  - `team_history` is an ordered array of stints. The open stint is the one
//    with `left_at === null`.
//  - Career stats are never stored — they're derived from match events, so a
//    transfer can never make them stale. `team_history` is the audit source.
//  - Suspensions are keyed by `playerId` only, so bans already carry across
//    teams. We stamp `original_team_id` + `transfer_status` on the active
//    suspension for the audit trail.

import {
  collection, doc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, writeBatch,
  type FieldValue, type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** A Firestore timestamp field — a resolved Timestamp, a pending sentinel, or unset. */
export type FirestoreTime = Timestamp | FieldValue | null;

/** Resolve a Firestore timestamp field to epoch milliseconds, or null when unset/pending. */
export function firestoreTimeToMillis(ts: FirestoreTime): number | null {
  if (!ts) return null;
  const t = ts as { seconds?: number; toDate?: () => Date };
  if (typeof t.seconds === 'number') return t.seconds * 1000;
  if (typeof t.toDate === 'function') return t.toDate().getTime();
  return null;
}

export interface TeamHistoryEntry {
  team_id: string;
  joined_at: FirestoreTime;
  left_at: FirestoreTime;
  order: number;
}

export type TransferStatus = 'approved';

export interface Transfer {
  id: string;
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  transferDate: FirestoreTime;
  approvedBy: string;
  approvedAt: FirestoreTime;
  status: TransferStatus;
  notes: string;
}

// ─────────────────────────────────────────────
// Transfer a player between teams
//
// Atomically:
//   1. Records the transfer in the `transfers` audit collection.
//   2. Updates the player's current team + team_history.
//   3. Stamps active suspensions with the origin team (ban carries over).
// ─────────────────────────────────────────────
export async function transferPlayer(
  playerId: string,
  fromTeamId: string,
  toTeamId: string,
  approvedByAdminId: string,
  notes?: string,
): Promise<string> {
  if (fromTeamId === toTeamId) {
    throw new Error('Source and destination teams must be different');
  }

  // 1. Fetch current player document
  const playerRef = doc(db, 'players', playerId);
  const playerSnap = await getDoc(playerRef);

  if (!playerSnap.exists()) {
    throw new Error(`Player ${playerId} not found`);
  }

  const player = playerSnap.data();
  const currentTeamId: string | null = player.team_id ?? player.teamId ?? null;

  // 2. Validate: player is currently at fromTeamId
  if (currentTeamId !== fromTeamId) {
    throw new Error(
      `Player is not at team ${fromTeamId}. Current team: ${currentTeamId ?? 'none'}`,
    );
  }

  // 3. Build the updated team_history — close the open stint, append the new one.
  const history: TeamHistoryEntry[] = Array.isArray(player.team_history)
    ? player.team_history.map((e: TeamHistoryEntry) => ({ ...e }))
    : [];

  if (history.length === 0) {
    // Legacy player (never migrated) — seed the first stint from their old team.
    history.push({
      team_id: fromTeamId,
      joined_at: player.createdAt ?? serverTimestamp(),
      left_at: null,
      order: 0,
    });
  }

  const openEntry = history.find((e) => e.left_at === null);
  if (openEntry) openEntry.left_at = serverTimestamp();

  history.push({
    team_id: toTeamId,
    joined_at: serverTimestamp(),
    left_at: null,
    order: history.length,
  });

  // 4. Read active suspensions before writing (batch reads must precede writes).
  //    Excluding soft-deleted so deleted suspensions aren't resurrected.
  const suspensionsSnap = await getDocs(
    query(
      collection(db, 'suspensions'),
      where('playerId', '==', playerId),
      where('active', '==', true),
    ),
  );

  // 5. Commit everything in one batch
  const transferRef = doc(collection(db, 'transfers'));
  const batch = writeBatch(db);

  batch.set(transferRef, {
    playerId,
    fromTeamId,
    toTeamId,
    transferDate: serverTimestamp(),
    approvedBy: approvedByAdminId,
    approvedAt: serverTimestamp(),
    status: 'approved',
    notes: notes ?? '',
  });

  batch.update(playerRef, {
    team_id: toTeamId,
    current_team_id: toTeamId,
    team_history: history,
  });

  suspensionsSnap.docs.forEach((d) => {
    const data = d.data();
    if (!data.original_team_id) {
      batch.update(d.ref, {
        original_team_id: fromTeamId,
        transfer_status: 'carries_over',
      });
    }
  });

  await batch.commit();

  return transferRef.id;
}

// ─────────────────────────────────────────────
// Read the full transfer audit trail (admin page)
// ─────────────────────────────────────────────
export async function getTransfers(): Promise<Transfer[]> {
  const snap = await getDocs(
    query(collection(db, 'transfers'), orderBy('transferDate', 'desc')),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transfer);
}

// ─────────────────────────────────────────────
// Read a single player's transfer history
// ─────────────────────────────────────────────
export async function getPlayerTransfers(playerId: string): Promise<Transfer[]> {
  const snap = await getDocs(
    query(
      collection(db, 'transfers'),
      where('playerId', '==', playerId),
      orderBy('transferDate', 'desc'),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transfer);
}
