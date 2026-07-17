'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { Button } from "@/components/ui/button";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteCode = searchParams.get('inviteCode');
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  
  type AuthMode = 'login' | 'signup' | 'forgot-password' | 'choose-path';
  const [mode, setMode] = useState<AuthMode>(inviteCode ? 'signup' : 'choose-path');
  const [signupNeedsInvite, setSignupNeedsInvite] = useState(!!inviteCode);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-10 w-auto" />
        </div>

        {mode === 'choose-path' && (
          <>
            <h2 className="font-display text-xl font-bold text-center mb-2">
              Welcome to KICKOFF
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Join an existing league or start your own
            </p>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-auto min-h-[44px] py-4 flex flex-col items-start gap-0.5"
                onClick={() => { setMode('signup'); setSignupNeedsInvite(true); }}
              >
                <span className="text-sm font-medium">Have an invite code?</span>
                <span className="text-xs text-muted-foreground font-normal">Join an existing league</span>
              </Button>
              <Button
                className="w-full h-auto min-h-[44px] py-4 flex flex-col items-start gap-0.5"
                onClick={() => { setMode('signup'); setSignupNeedsInvite(false); }}
              >
                <span className="text-sm font-medium">Start your own league</span>
                <span className="text-xs text-primary-foreground/80 font-normal">Create and manage a league</span>
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </>
        )}

        {mode === 'login' && (
          <>
            <h2 className="font-display text-xl font-bold text-center mb-6">Sign In</h2>
            <SignInForm
              onSuccess={() => router.push(redirectTo)}
              onSwitchToSignUp={() => {
                if (inviteCode) {
                  setMode('signup');
                  setSignupNeedsInvite(true);
                } else {
                  setMode('choose-path');
                }
              }}
              onForgotPassword={() => setMode('forgot-password')}
            />
          </>
        )}

        {mode === 'signup' && (
          <>
            {!inviteCode && (
              <button
                type="button"
                onClick={() => setMode('choose-path')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors mb-4 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <h2 className="font-display text-xl font-bold text-center mb-6">Create Account</h2>
            <SignUpForm
              onSuccess={() => router.push(signupNeedsInvite ? redirectTo : '/onboarding/create-league')}
              onSwitchToLogin={() => { setMode('login'); setSignupNeedsInvite(false); }}
              initialInviteCode={signupNeedsInvite ? (inviteCode || undefined) : undefined}
              requireInviteCode={signupNeedsInvite}
            />
          </>
        )}

        {mode === 'forgot-password' && (
          <>
            <h2 className="font-display text-xl font-bold text-center mb-6">Reset Password</h2>
            <ForgotPasswordForm
              onSwitchToSignIn={() => setMode('login')}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={<div />}>
      <AuthContent />
    </Suspense>
  );
}
