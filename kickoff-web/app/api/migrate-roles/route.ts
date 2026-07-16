import { NextResponse } from 'next/server';
import {
  collection, getDocs, writeBatch, doc, serverTimestamp, getDoc, setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LEAGUE_COLLECTIONS = [
  'teams',
  'players',
  'matches',
  'goals',
  'assists',
  'yellow_cards',
  'red_cards',
  'match_attendance',
  'suspensions',
  'match_records',
  'link_requests',
  'user_invites',
] as const;

async function ensureLeagueId(): Promise<string> {
  // Try to get leagueId from the old settings/league singleton first (backward compat)
  const settingsRef = doc(db, 'settings', 'league');
  const settingsSnap = await getDoc(settingsRef);
  const existingLeagueId = settingsSnap.exists() ? settingsSnap.data()?.leagueId : null;
  if (existingLeagueId) return existingLeagueId;
  // Fall back to the new per-league settings path
  const defaultLeagueId = 'default';
  // Write to both old singleton (for backward compat) and new path
  await setDoc(settingsRef, { leagueId: defaultLeagueId }, { merge: true });
  await setDoc(doc(db, 'settings', defaultLeagueId), {}, { merge: true });
  return defaultLeagueId;
}

async function backfillCollection(collectionName: string, leagueId: string) {
  const snap = await getDocs(collection(db, collectionName));
  const docs = snap.docs.filter((docSnap) => docSnap.data()?.leagueId == null);
  const chunkSize = 400;

  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    docs.slice(i, i + chunkSize).forEach((docSnap) => {
      batch.set(docSnap.ref, { leagueId }, { merge: true });
    });
    await batch.commit();
  }
}

export async function POST() {
  try {
    const leagueId = await ensureLeagueId();
    await Promise.all(LEAGUE_COLLECTIONS.map((collectionName) => backfillCollection(collectionName, leagueId)));

    const rolesSnap = await getDocs(collection(db, 'user_roles'));
    const playersSnap = await getDocs(collection(db, 'players'));

    const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const batch = writeBatch(db);
    let count = 0;

    for (const roleDoc of rolesSnap.docs) {
      const userId = roleDoc.id;
      const data = roleDoc.data();
      const currentRole = data.role;
      let newRole = currentRole;
      let playerId = data.playerId ?? null;
      let teamId = data.teamId ?? null;
      let currentLeagueId = data.leagueId ?? null;

      const linkedPlayer: any = players.find((p: any) => p.linkedUserId === userId);
      if (linkedPlayer) {
        playerId = linkedPlayer.id;
        teamId = linkedPlayer.team_id ?? linkedPlayer.teamId ?? null;
        currentLeagueId = currentLeagueId ?? linkedPlayer.leagueId ?? null;
      }

      if (currentRole === 'admin') {
        newRole = 'league_manager';
      } else if (currentRole === 'user' || currentRole === 'player' || !currentRole) {
        if (linkedPlayer && (linkedPlayer.is_manager === true || linkedPlayer.isManager === true)) {
          newRole = 'team_manager';
        } else {
          newRole = 'player';
        }
      }

      if (newRole !== currentRole || data.playerId !== playerId || data.teamId !== teamId || data.leagueId !== currentLeagueId) {
        batch.set(doc(db, 'user_roles', userId), {
          role: newRole,
          playerId,
          teamId,
          leagueId: currentLeagueId,
          updatedAt: serverTimestamp()
        }, { merge: true });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Role migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
