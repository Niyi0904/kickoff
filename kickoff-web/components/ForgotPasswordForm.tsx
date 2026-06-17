'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  onSwitchToSignIn: () => void;
}

export function ForgotPasswordForm({ onSwitchToSignIn }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }

    if (!validateEmail(email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await sendPasswordReset(email);
      if (error) {
        // Map common Firebase errors if possible
        let message = error.message || "Failed to send reset email";
        if (error.code === 'auth/user-not-found') {
          message = "No user found with this email address.";
        } else if (error.code === 'auth/invalid-email') {
          message = "Invalid email address format.";
        }
        toast({ title: "Error", description: message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Password reset email sent!" });
        setIsSent(true);
      }
    } catch (err) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {isSent ? (
        <div className="text-center space-y-4 py-4">
          <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 border border-primary/20">
            <span className="text-primary text-xl">✓</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've sent a password reset link to <span className="text-foreground font-semibold">{email}</span>.
          </p>
          <p className="text-xs text-muted-foreground/75 leading-relaxed">
            Please check your inbox (and spam folder) and follow the instructions to reset your password.
          </p>
          <Button onClick={onSwitchToSignIn} className="w-full mt-2">
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground text-center mb-2 leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-border focus-visible:ring-primary focus-visible:ring-1"
            required
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending Link..." : "Send Reset Link"}
          </Button>
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium focus-visible:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
