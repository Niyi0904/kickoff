import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paystack';
import {
  PAYSTACK_SUBSCRIPTION_PLAN_CODE,
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
    const bodyText = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!verifyWebhookSignature(bodyText, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 },
      );
    }

    const event = JSON.parse(bodyText);
    const adminDb = getFirestore(getAdminApp());

    switch (event.event) {
      // ───────────────────────────────────────
      // Registration fee charge success
      // ───────────────────────────────────────
      case 'charge.success': {
        const data = event.data;
        const reference = data.reference;

        if (!reference) {
          return NextResponse.json(
            { error: 'Missing reference in charge.success event' },
            { status: 400 },
          );
        }

        const existingTx = await adminDb
          .collection('payment_transactions')
          .doc(reference)
          .get();

        if (existingTx.exists && existingTx.data()?.status === 'success') {
          return NextResponse.json({ status: 'idempotent_skipped' });
        }

        const metadata = data.metadata || {};
        const txType = metadata.type;
        const leagueId = metadata.leagueId;
        const relatedPlayerId = metadata.relatedPlayerId ?? null;

        if (!leagueId || typeof leagueId !== 'string') {
          return NextResponse.json(
            { error: 'Missing leagueId in transaction metadata' },
            { status: 400 },
          );
        }

        if (txType === 'registration_fee') {
          const amount = data.amount;
          const currency = data.currency;
          const payerEmail = data.customer?.email;

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
        } else if (
          txType === 'subscription' ||
          data.plan?.plan_code === PAYSTACK_SUBSCRIPTION_PLAN_CODE
        ) {
          const subscriptionCode =
            data.subscription?.subscription_code ??
            data.subscription_code ??
            null;
          const subLeagueId = metadata.leagueId ?? leagueId;

          if (subLeagueId && subscriptionCode) {
            const periodEnd = data.subscription?.next_payment_date
              ? new Date(data.subscription.next_payment_date).toISOString()
              : null;

            await adminDb
              .collection('subscriptions')
              .doc(subLeagueId)
              .set(
                {
                  status: 'active',
                  currentPeriodEnd: periodEnd,
                  updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true },
              );
          }
        }
        break;
      }

      // ───────────────────────────────────────
      // Subscription created
      // ───────────────────────────────────────
      case 'subscription.create': {
        const data = event.data;
        const subscriptionCode = data.subscription_code;
        const customerCode = data.customer?.customer_code;
        const planCode = data.plan?.plan_code;
        const leagueIdFromMeta = data.metadata?.leagueId;

        if (!subscriptionCode || !leagueIdFromMeta) {
          return NextResponse.json(
            { error: 'Missing subscription_code or leagueId in metadata' },
            { status: 400 },
          );
        }

        await adminDb
          .collection('subscriptions')
          .doc(leagueIdFromMeta)
          .set(
            {
              paystackSubscriptionCode: subscriptionCode,
              paystackCustomerCode: customerCode ?? null,
              paystackPlanCode: planCode ?? null,
              status: 'active',
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        break;
      }

      // ───────────────────────────────────────
      // Subscription disabled / cancelled
      // ───────────────────────────────────────
      case 'subscription.disable': {
        const data = event.data;
        const subCode = data.subscription_code;
        const leagueIdFromMeta = data.metadata?.leagueId;

        if (!subCode) {
          return NextResponse.json(
            { error: 'Missing subscription_code' },
            { status: 400 },
          );
        }

        let targetLeagueId = leagueIdFromMeta;

        if (!targetLeagueId) {
          const subsSnap = await adminDb
            .collection('subscriptions')
            .where('paystackSubscriptionCode', '==', subCode)
            .limit(1)
            .get();
          if (!subsSnap.empty) {
            targetLeagueId = subsSnap.docs[0].id;
          }
        }

        if (targetLeagueId) {
          await adminDb
            .collection('subscriptions')
            .doc(targetLeagueId)
            .set(
              {
                status: 'cancelled',
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true },
            );
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    const msg = error?.message || 'Webhook processing failed';
    console.error('[payments/webhooks/paystack] Error:', msg, error);
    return NextResponse.json({ status: 'error', message: msg });
  }
}
