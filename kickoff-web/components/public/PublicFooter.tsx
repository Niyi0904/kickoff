'use client';

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeaderNavItem } from "./PublicHeader";

export function PublicFooter({ navItems }: { navItems: HeaderNavItem[] }) {
  const { user, loading: authLoading } = useAuth();
  const profileHref = user ? "/dashboard" : "/auth?redirect=/dashboard";

  return (
    <footer className="border-t border-white/10 bg-[#07130f] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.5fr_auto]">
        <div>
          <div className="flex items-center gap-3 h-14">
            <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-[150px] w-[170px]" />
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-white/58 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="h-11 w-full rounded-md bg-[#f5c84b] font-bold text-[#102018] hover:bg-[#ffd869]">
          <Link href={profileHref}>
            {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutDashboard className="mr-2 h-4 w-4" />}
            Profile Dashboard
          </Link>
        </Button>
      </div>
    </footer>
  );
}
