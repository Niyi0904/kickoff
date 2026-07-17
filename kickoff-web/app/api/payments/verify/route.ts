import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack';

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
    const body = await request.json();
    const { reference } = body;

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 },
      );
    }

    const txnData = await verifyTransaction(reference);

    const status = txnData.status === 'success' ? 'success' : 'failed';
    const amount = txnData.amount;
    const currency = txnData.currency;
    const payerEmail = txnData.customer?.email;
    const metadata = (txnData.metadata || {}) as Record<string, string | undefined>;

    const adminDb = getFirestore(getAdminApp());

    const existingTx = await adminDb
      .collection('payment_transactions')
      .doc(reference)
      .get();

    if (existingTx.exists && existingTx.data()?.status === 'success') {
      return NextResponse.json({
        status: 'success',
        alreadyProcessed: true,
        transaction: existingTx.data(),
      });
    }

    if (status === 'success') {
      const leagueId = metadata.leagueId ?? '';
      const relatedPlayerId = metadata.relatedPlayerId ?? null;

      await adminDb
        .collection('payment_transactions')
        .doc(reference)
        .set(
          {
            leagueId,
            type: 'registration_fee',
            amount,
            currency,
            paystackReference: reference,
            status: 'success',
            payerEmail: payerEmail ?? null,
            relatedPlayerId,
            splitApplied: true,
            createdAt: FieldValue.serverTimestamp(),
            paidAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

      if (relatedPlayerId) {
        const playerSnap = await adminDb
          .collection('players')
          .doc(relatedPlayerId)
          .get();
        if (playerSnap.exists) {
          await adminDb
            .collection('players')
            .doc(relatedPlayerId)
            .update({
              registrationFeeStatus: 'paid',
              updatedAt: FieldValue.serverTimestamp(),
            });
        }
      }

      return NextResponse.json({
        status: 'success',
        alreadyProcessed: false,
      });
    }

    return NextResponse.json({
      status: 'failed',
      message: 'Transaction was not successful according to Paystack',
    });
  } catch (error: any) {
    const msg = error?.message || 'Failed to verify transaction';
    console.error('[payments/verify] Error:', msg, error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
