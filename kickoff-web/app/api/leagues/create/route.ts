import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SETTINGS } from '@/app/hooks/use-leagueSettings';

export const runtime = 'nodejs';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!;

  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (rawKey && clientEmail && projectId) {
    const privateKey = rawKey
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n');

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return initializeApp();
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.slice(7);
    const app = getAdminApp();

    let decodedToken: { uid: string };
    try {
      decodedToken = await getAuth(app).verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const adminDb = getFirestore(app);

    const userRoleSnap = await adminDb.collection('user_roles').doc(uid).get();
    if (userRoleSnap.exists) {
      const existingData = userRoleSnap.data();
      if (existingData?.leagueId) {
        return NextResponse.json(
          { error: 'You already belong to a league and cannot create a new one. Multi-league membership is not supported yet.' },
          { status: 409 }
        );
      }
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'League name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const normalizedSlug = normalizeSlug(slug);
    if (normalizedSlug.length < 3) {
      return NextResponse.json(
        { error: 'Slug must be at least 3 characters' },
        { status: 400 }
      );
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      return NextResponse.json(
        { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const existingSlugQuery = await adminDb
      .collection('leagues')
      .where('slug', '==', normalizedSlug)
      .get();

    if (!existingSlugQuery.empty) {
      return NextResponse.json(
        { error: `The slug "${normalizedSlug}" is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    const leagueRef = adminDb.collection('leagues').doc();
    const leagueId = leagueRef.id;
    const now = new Date().toISOString();

    const batch = adminDb.batch();

    batch.set(leagueRef, {
      id: leagueId,
      slug: normalizedSlug,
      name: name.trim(),
      ownerId: uid,
      adminIds: [uid],
      logoUrl: null,
      createdAt: now,
    });

    batch.set(adminDb.collection('settings').doc(leagueId), DEFAULT_SETTINGS);

    batch.set(adminDb.collection('subscriptions').doc(leagueId), {
      plan: 'free',
      status: 'trial',
      currentPeriodEnd: null,
    });

    batch.set(adminDb.collection('user_roles').doc(uid), {
      role: 'league_manager',
      leagueId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ leagueId, slug: normalizedSlug }, { status: 201 });
  } catch (error: any) {
    const msg = error?.message || 'Failed to create league';
    console.error('[leagues/create] Error:', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
