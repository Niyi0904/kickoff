'use client';

import { useAuth } from "@/app/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar p-6 fixed inset-y-0 left-0 z-30">
          <div className="h-8 w-32 bg-secondary/50 animate-pulse rounded-lg mb-10" />
          <div className="space-y-2 flex-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary/30 animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="mt-auto pt-6 border-t border-border">
            <div className="h-10 bg-secondary/30 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="flex-1 lg:ml-64 min-w-0">
          <div className="lg:hidden h-14 border-b border-border bg-sidebar px-4 flex items-center">
            <div className="h-6 w-24 bg-secondary/50 animate-pulse rounded-lg" />
          </div>
          <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-secondary/50 animate-pulse rounded-xl" />
              <div className="h-4 w-48 bg-secondary/30 animate-pulse rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-secondary/30 animate-pulse rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 bg-secondary/30 animate-pulse rounded-2xl" />
              <div className="h-72 bg-secondary/30 animate-pulse rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
