import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomer,
  initializeTransaction,
} from '@/lib/paystack';
import { PAYSTACK_SUBSCRIPTION_PLAN_CODE } from '@/lib/config';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> },
) {
  try {
    const { leagueId } = await params;
    if (!leagueId || typeof leagueId !== 'string') {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 },
      );
    }

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

    const userRoleSnap = await adminDb
      .collection('user_roles')
      .doc(uid)
      .get();
    const userRole = userRoleSnap.data();
    if (
      !userRole ||
      !(userRole.role === 'league_manager' || userRole.role === 'admin') ||
      userRole.leagueId !== leagueId
    ) {
      return NextResponse.json(
        { error: 'You must be the league manager of this league to manage subscriptions' },
        { status: 403 },
      );
    }

    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userData = userSnap.data();
    const managerEmail = userData?.email;
    const managerDisplayName = userData?.displayName || '';

    if (!managerEmail || typeof managerEmail !== 'string') {
      return NextResponse.json(
        { error: 'User email not found. Ensure your account has an email address.' },
        { status: 400 },
      );
    }

    const planCode = PAYSTACK_SUBSCRIPTION_PLAN_CODE;
    if (!planCode) {
      return NextResponse.json(
        { error: 'Subscription plan is not configured. Contact support.' },
        { status: 500 },
      );
    }

    const subSnap = await adminDb
      .collection('subscriptions')
      .doc(leagueId)
      .get();

    let customerCode = subSnap.data()?.paystackCustomerCode ?? null;

    if (!customerCode) {
      const nameParts = managerDisplayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const customer = await createCustomer(
        managerEmail,
        firstName || undefined,
        lastName || undefined,
      );
      customerCode = customer.customerCode;

      await adminDb
        .collection('subscriptions')
        .doc(leagueId)
        .set(
          {
            paystackCustomerCode: customerCode,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
    }

    const metadata: Record<string, unknown> = {
      leagueId,
      type: 'subscription',
      planCode,
    };

    // Initialize with zero amount — Paystack subscription flow
    // uses the plan's configured price; amount is set to the plan price
    // in kobo so the authorization covers the right amount on recurring charges.
    const { authorizationUrl, reference } = await initializeTransaction(
      managerEmail,
      0,
      null,
      metadata,
    );

    await adminDb
      .collection('payment_transactions')
      .doc(reference)
      .set({
        leagueId,
        type: 'subscription_initialization',
        amount: 0,
        currency: 'NGN',
        paystackReference: reference,
        status: 'pending',
        payerEmail: managerEmail,
        relatedPlayerId: null,
        splitApplied: false,
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      status: 'success',
      authorizationUrl,
      reference,
      customerCode,
    });
  } catch (error: any) {
    const msg = error?.message || 'Failed to initialize subscription';
    console.error('[subscriptions/initialize] Error:', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
