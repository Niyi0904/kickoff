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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    const adminApp = getAdminApp();
    const adminDb = getFirestore(adminApp);
    const slugSnap = await adminDb.collection('leagues').where('slug', '==', slug).get();
    if (slugSnap.empty) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }
    const leagueDoc = slugSnap.docs[0];
    return NextResponse.json({ id: leagueDoc.id, name: leagueDoc.data().name ?? null });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
