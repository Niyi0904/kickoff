'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Shield, CheckCircle2, XCircle,
  Clock, ArrowUpCircle, Loader2, AlertTriangle,
  Lock, ExternalLink, Zap,
} from 'lucide-react';
import { useAppContext } from '@/app/context/AppDataContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/hooks/useAuth';
import { useToast } from '@/app/hooks/use-toast';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';

function StatusBadge({
  status,
  plan,
}: {
  status: string;
  plan: string;
}) {
  const isActive = status === 'active' || status === 'trial';
  const isCancelled = status === 'cancelled' || status === 'expired';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
        isActive && 'bg-green-500/10 border-green-500/30 text-green-500',
        isCancelled && 'bg-red-500/10 border-red-500/30 text-red-500',
        !isActive && !isCancelled && 'bg-accent/10 border-accent/30 text-accent',
      )}
    >
      {isActive ? <CheckCircle2 className="w-3 h-3" /> : isCancelled ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {plan === 'free' ? 'Free' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function BillingContent() {
  const { isAdmin } = useAppContext();
  const { user, leagueId } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState<{
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    paystackCustomerCode?: string | null;
    paystackSubscriptionCode?: string | null;
  } | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!leagueId) return;

    const fetchFromFirestore = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDoc(doc(db, 'subscriptions', leagueId));
        if (snap.exists()) {
          setSubData(snap.data() as any);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchFromFirestore();
  }, [leagueId]);

  const handleUpgrade = async () => {
    if (!leagueId) return;
    setUpgrading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/subscriptions/${leagueId}/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Upgrade failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        });
        return;
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to initialize upgrade',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-10 bg-card rounded-2xl border border-border max-w-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Admin Only</h2>
          <p className="text-muted-foreground text-sm">
            Only league admins can access the billing page.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 pb-20 max-w-3xl">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-secondary/50 animate-pulse rounded-xl" />
          <div className="h-4 w-64 bg-secondary/30 animate-pulse rounded-xl" />
        </div>
        <div className="glass-card rounded-2xl border border-border/50 p-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-secondary/40 animate-pulse rounded-lg" />
              <div className="h-10 bg-secondary/30 animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isOnPaidPlan = subData?.plan === 'pro' || subData?.plan === 'paid';
  const isCancelled = subData?.status === 'cancelled' || subData?.status === 'expired';
  const isTrialing = subData?.status === 'trial' && subData?.plan === 'free';

  return (
    <div className="space-y-8 pb-20 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
          Billing
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your league&apos;s subscription and payment settings.
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-secondary/20">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Current Plan</h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              Your league&apos;s subscription status
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subData?.plan === 'free' ? 'Free (Trial)' : 'Premium'}
              </p>
            </div>
            <StatusBadge
              status={subData?.status || 'trial'}
              plan={subData?.plan || 'free'}
            />
          </div>

          <div className="border-t border-border/50" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Period End</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subData?.currentPeriodEnd
                  ? new Date(subData.currentPeriodEnd).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {subData?.paystackSubscriptionCode && (
            <>
              <div className="border-t border-border/50" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Subscription Code</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {subData.paystackSubscriptionCode}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-secondary/20">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Actions</h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              Upgrade or manage your subscription
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {isTrialing || isCancelled ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isTrialing
                      ? 'Your trial is active'
                      : 'Your subscription has ended'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isTrialing
                      ? 'Upgrade to a paid plan to unlock premium features for your league.'
                      : 'Re-subscribe to continue using premium features.'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full gap-2 shadow-lg shadow-primary/20"
                size="lg"
              >
                {upgrading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                {upgrading ? 'Processing...' : isCancelled ? 'Re-subscribe' : 'Upgrade to Premium'}
              </Button>
            </div>
          ) : isOnPaidPlan ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    You&apos;re on the premium plan
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All premium features are active. Your subscription auto-renews.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-border/50 rounded-xl">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Current plan active
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your current plan is active. No action needed.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full gap-2"
                variant="outline"
                size="lg"
              >
                {upgrading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                {upgrading ? 'Processing...' : 'Manage Subscription'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
