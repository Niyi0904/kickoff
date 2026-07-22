import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { initializeTransaction } from '@/lib/paystack';
import {
  REGISTRATION_FEE_AMOUNT_KOBO,
} from '@/lib/config';

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 },
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
        { status: 401 },
      );
    }

    const uid = decodedToken.uid;
    const adminDb = getFirestore(app);

    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userData = userSnap.data();
    const payerEmail = userData?.email;

    if (!payerEmail || typeof payerEmail !== 'string') {
      return NextResponse.json(
        { error: 'User email not found. Ensure your account has an email address.' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { leagueId, relatedPlayerId } = body;

    if (!leagueId || typeof leagueId !== 'string') {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 },
      );
    }

    const leagueSnap = await adminDb.collection('leagues').doc(leagueId).get();
    if (!leagueSnap.exists) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 },
      );
    }

    if (relatedPlayerId && typeof relatedPlayerId === 'string') {
      const playerSnap = await adminDb
        .collection('players')
        .doc(relatedPlayerId)
        .get();
      if (!playerSnap.exists) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 },
        );
      }
      const playerData = playerSnap.data()!;
      if (playerData.leagueId !== leagueId) {
        return NextResponse.json(
          { error: 'Player does not belong to the specified league' },
          { status: 400 },
        );
      }
    }

    const leagueData = leagueSnap.data()!;
    const subaccountCode = leagueData.paystackSubaccountCode ?? null;
    const subaccountStatus = leagueData.subaccountStatus ?? null;

    if (subaccountStatus !== 'active' || !subaccountCode) {
      return NextResponse.json(
        { error: 'This league has not completed subaccount onboarding. Registration fee payments are not available yet.' },
        { status: 400 },
      );
    }

    const amount = REGISTRATION_FEE_AMOUNT_KOBO;

    const metadata: Record<string, unknown> = {
      leagueId,
      type: 'registration_fee',
    };
    if (relatedPlayerId) {
      metadata.relatedPlayerId = relatedPlayerId;
    }

    const { authorizationUrl, reference } = await initializeTransaction(
      payerEmail,
      amount,
      subaccountCode,
      metadata,
    );

    await adminDb.collection('payment_transactions').doc(reference).set({
      leagueId,
      type: 'registration_fee',
      amount,
      currency: 'NGN',
      paystackReference: reference,
      status: 'pending',
      payerEmail,
      relatedPlayerId: relatedPlayerId ?? null,
      splitApplied: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (relatedPlayerId) {
      await adminDb
        .collection('players')
        .doc(relatedPlayerId)
        .update({
          registrationFeeStatus: 'pending',
          updatedAt: FieldValue.serverTimestamp(),
        });
    }

    return NextResponse.json({
      status: 'success',
      authorizationUrl,
      reference,
    });
  } catch (error: any) {
    const msg = error?.message || 'Failed to initialize payment';
    console.error('[payments/initialize] Error:', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
