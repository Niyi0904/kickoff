'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/app/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateLeaguePage() {
  return (
    <ProtectedRoute>
      <CreateLeagueContent />
    </ProtectedRoute>
  );
}

function CreateLeagueContent() {
  const { user, leagueId } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (!slugEditedManually) {
      setSlug(slugify(value));
    }
  }, [slugEditedManually]);
  const handleSlugChange = useCallback((value: string) => {
    setSlugEditedManually(true);
    setSlug(value);
  }, []);

  if (leagueId) {
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
          <div role="alert" className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="font-display text-xl font-bold mb-3">Already in a League</h2>
            <p className="text-muted-foreground">
              You already belong to a league and cannot create a new one.
              Multi-league membership is not supported yet.
            </p>
            <Button asChild className="mt-6 min-h-[44px]">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (trimmedName.length < 2) {
      toast({ title: 'Error', description: 'League name must be at least 2 characters.', variant: 'destructive' });
      return;
    }
    if (trimmedSlug.length < 3) {
      toast({ title: 'Error', description: 'Slug must be at least 3 characters.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) {
        toast({ title: 'Error', description: 'You must be signed in.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/leagues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: trimmedName, slug: trimmedSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create league', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      toast({ title: 'Success', description: 'Your league has been created!' });
      router.push('/admin/onboarding');
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <h2 className="font-display text-xl font-bold text-center mb-6">
          Create Your League
        </h2>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              League Name
            </label>
            <Input
              placeholder="My Awesome League"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              URL Slug
            </label>
            <Input
              placeholder="my-awesome-league"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="bg-secondary border-border font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Auto-suggested from the name. You can edit it. Use lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full gap-2"
            disabled={isSubmitting || name.trim().length < 2 || slug.trim().length < 3}
          >
            <Shield className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : 'Create League'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
