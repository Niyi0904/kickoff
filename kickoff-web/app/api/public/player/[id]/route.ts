import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (rawKey && clientEmail && projectId) {
    const privateKey = rawKey.replace(/\\n/g, '\n');
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  return initializeApp();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const leagueSlug = searchParams.get('slug');
    let leagueId: string | null = null;

    if (leagueSlug) {
      const adminApp = getAdminApp();
      const adminDb = getFirestore(adminApp);
      const slugSnap = await adminDb.collection('leagues').where('slug', '==', leagueSlug).get();
      if (!slugSnap.empty) {
        leagueId = slugSnap.docs[0].id;
      } else {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      const doc = await adminDb.collection('players').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      }
      const data = doc.data()!;
      if (data.leagueId !== leagueId && data.league_id !== leagueId) {
        return NextResponse.json({ error: 'Player not found in this league' }, { status: 404 });
      }
      const teamDoc = data.teamId ? await adminDb.collection('teams').doc(data.teamId).get() : null;
      return NextResponse.json({
        id: doc.id,
        name: data.name ?? 'Unnamed Player',
        position: data.position ?? null,
        number: data.number ?? null,
        photo: data.photo ?? null,
        teamId: data.teamId ?? data.team_id ?? '',
        teamName: teamDoc?.exists ? (teamDoc.data()!.name ?? null) : null,
      });
    }
    return NextResponse.json({ error: 'League slug required' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
