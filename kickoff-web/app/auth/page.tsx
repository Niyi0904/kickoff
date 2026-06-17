'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteCode = searchParams.get('inviteCode');
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  
  type AuthMode = 'login' | 'signup' | 'forgot-password';
  const [mode, setMode] = useState<AuthMode>(inviteCode ? 'signup' : 'login');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">KICKOFF</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Team Manager</p>
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-center mb-6">
          {mode === 'login' && "Sign In"}
          {mode === 'signup' && "Create Account"}
          {mode === 'forgot-password' && "Reset Password"}
        </h2>

        {mode === 'login' && (
          <SignInForm
            onSuccess={() => router.push(redirectTo)}
            onSwitchToSignUp={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}
        {mode === 'signup' && (
          <SignUpForm
            onSuccess={() => router.push(redirectTo)}
            onSwitchToLogin={() => setMode('login')}
            initialInviteCode={inviteCode || undefined}
          />
        )}
        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onSwitchToSignIn={() => setMode('login')}
          />
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
