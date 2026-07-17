'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Loader2, ArrowRight, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get('reference');
  const leagueId = searchParams.get('leagueId');
  const playerId = searchParams.get('playerId');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No transaction reference provided.');
      return;
    }

    const verify = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();

        if (data.status === 'success') {
          setStatus('success');
          setMessage('Your registration fee has been confirmed as paid. Thank you!');
        } else {
          setStatus('failed');
          setMessage(
            data.message ||
              'Payment could not be verified. If you believe this is an error, please contact the league manager.',
          );
        }
      } catch {
        setStatus('failed');
        setMessage(
          'We could not verify the payment right now. If your bank confirmed the payment, it will be processed shortly.',
        );
      }
    };

    const timeout = setTimeout(verify, 1500);
    return () => clearTimeout(timeout);
  }, [reference]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-8 text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Verifying Payment</h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your transaction with Paystack...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Payment Successful</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Button
              onClick={() => router.push(playerId ? `/players/${playerId}` : '/my-profile')}
              className="w-full gap-2"
            >
              View My Profile <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Payment Issue</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="flex flex-col gap-3">
              {reference && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setStatus('loading');
                    setMessage('');
                  }}
                >
                  Try Again
                </Button>
              )}
              <Button
                onClick={() => router.push('/my-profile')}
                className="w-full gap-2"
              >
                Back to Profile <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {reference && (
          <p className="text-[11px] text-muted-foreground font-mono">
            Ref: {reference}
          </p>
        )}
      </motion.div>
    </div>
  );
}
