import { NextResponse } from 'next/server';
import {
  collection, getDocs, writeBatch, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    const rolesSnap = await getDocs(collection(db, 'user_roles'));
    const playersSnap = await getDocs(collection(db, 'players'));
    const batch = writeBatch(db);
    let count = 0;

    const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const roleDoc of rolesSnap.docs) {
      const userId = roleDoc.id;
      const data = roleDoc.data();
      const currentRole = data.role;
      let newRole = currentRole;
      let playerId = data.playerId ?? null;
      let teamId = data.teamId ?? null;

      // Find if this user is linked to a player profile
      const linkedPlayer: any = players.find((p: any) => p.linkedUserId === userId);
      if (linkedPlayer) {
        playerId = linkedPlayer.id;
        teamId = linkedPlayer.team_id ?? linkedPlayer.teamId ?? null;
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

      // Update if role, teamId, or playerId changes
      if (newRole !== currentRole || data.playerId !== playerId || data.teamId !== teamId) {
        batch.set(doc(db, 'user_roles', userId), {
          role: newRole,
          playerId,
          teamId,
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
