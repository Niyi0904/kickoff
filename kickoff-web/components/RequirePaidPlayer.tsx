'use client';

import { useMyLinkedPlayer } from '@/app/hooks/usePlayerLinking';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function RequirePaidPlayer({ children }: { children: React.ReactNode }) {
  const { data: linkedPlayer, isLoading } = useMyLinkedPlayer();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (linkedPlayer && linkedPlayer.registrationFeeStatus !== 'paid') {
      router.push(`/my-profile?paymentRequired=true`);
    }
  }, [linkedPlayer, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (linkedPlayer && linkedPlayer.registrationFeeStatus !== 'paid') {
    return null;
  }

  return <>{children}</>;
}
