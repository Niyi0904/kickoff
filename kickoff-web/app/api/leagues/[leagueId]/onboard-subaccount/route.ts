import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccountNumber, createSubaccount } from '@/lib/paystack';
import { REGISTRATION_FEE_SPLIT_PERCENTAGE } from '@/lib/config';

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
        { error: 'You must be the league manager of this league to onboard a subaccount' },
        { status: 403 },
      );
    }

    const leagueSnap = await adminDb.collection('leagues').doc(leagueId).get();
    if (!leagueSnap.exists) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 },
      );
    }

    const leagueData = leagueSnap.data()!;

    const body = await request.json();
    const { bankCode, accountNumber, confirmedAccountName } = body;

    if (!bankCode || typeof bankCode !== 'string') {
      return NextResponse.json(
        { error: 'Bank code is required' },
        { status: 400 },
      );
    }

    if (!accountNumber || typeof accountNumber !== 'string') {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 },
      );
    }

    const resolved = await resolveAccountNumber(accountNumber, bankCode);

    if (!confirmedAccountName) {
      return NextResponse.json({
        status: 'confirmation_required',
        accountName: resolved.accountName,
        accountNumber: resolved.accountNumber,
        bankCode: resolved.bankCode,
      });
    }

    if (confirmedAccountName !== resolved.accountName) {
      return NextResponse.json(
        {
          error: 'Confirmed account name does not match the resolved account name. Please re-verify the account details.',
          resolvedAccountName: resolved.accountName,
        },
        { status: 409 },
      );
    }

    const businessName = leagueData.name || `League ${leagueId}`;

    const { subaccountCode } = await createSubaccount(
      businessName,
      bankCode,
      accountNumber,
      REGISTRATION_FEE_SPLIT_PERCENTAGE,
    );

    await adminDb
      .collection('leagues')
      .doc(leagueId)
      .update({
        paystackSubaccountCode: subaccountCode,
        subaccountStatus: 'active',
      });

    return NextResponse.json({
      status: 'success',
      subaccountCode,
      accountName: resolved.accountName,
    });
  } catch (error: any) {
    const msg = error?.message || 'Failed to onboard subaccount';
    console.error('[leagues/onboard-subaccount] Error:', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
