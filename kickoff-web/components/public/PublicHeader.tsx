'use client';

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { LayoutDashboard, Menu, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HeaderNavItem = {
  label: string;
  href: string;
};

export function PublicHeader({ navItems }: { navItems: HeaderNavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const profileHref = user ? "/dashboard" : "/auth?redirect=/dashboard";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07130f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 h-14">
          <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-[150px] w-[170px]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!user && !authLoading && (
            <Button asChild variant="outline" className="h-10 rounded-md border-white/25 bg-white/10 px-4 font-bold text-white hover:bg-white/18 hover:text-white">
              <Link href="/auth">Get Started</Link>
            </Button>
          )}
          <Button asChild className="h-10 rounded-md bg-[#f5c84b] px-4 font-bold text-[#102018] hover:bg-[#ffd869]">
            <Link href={profileHref}>
              {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutDashboard className="mr-2 h-4 w-4" />}
              Profile Dashboard
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#07130f] px-4 py-4 lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white/78 hover:bg-white/8 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {!user && !authLoading && (
              <Button asChild className="h-11 w-full rounded-md border-white/25 bg-white/10 font-bold text-white hover:bg-white/18">
                <Link href="/auth" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </Button>
            )}
            <Button asChild className="h-11 w-full rounded-md bg-[#f5c84b] font-bold text-[#102018] hover:bg-[#ffd869]">
              <Link href={profileHref} onClick={() => setMobileOpen(false)}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Profile Dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
