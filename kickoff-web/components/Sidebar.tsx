'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  Users,
  ClipboardList,
  Trophy,
  Menu,
  X,
  TrendingUp,
  Settings,
  ShieldAlert,
  User,
  UserCheck,
  Globe2,
  BarChart2,
  Radio
} from "lucide-react";
import { useMyLinkedPlayer } from '@/app/hooks/usePlayerLinking';
import { useAppContext } from "@/app/context/AppDataContext";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { usePendingLinkRequests } from '@/app/hooks/usePlayerLinking';

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/live", label: "Live", icon: Radio },
  { path: "/teams", label: "Teams", icon: Shield },
  { path: "/players", label: "Players", icon: Users },
  { path: "/stats", label: "Stats", icon: TrendingUp },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/standings", label: "Standings", icon: Trophy },
  { path: "/matches", label: "Matches", icon: ClipboardList },
  { path: "/", label: "Public Home", icon: Globe2 },
];

const adminNavItems = [
  { path: "/admin/onboarding", label: "User Management", icon: Users },
  { path: "/admin/users", label: "All Users", icon: Users },
  { path: "/admin/settings", label: "Settings", icon: Settings },
  { path: "/admin/suspensions",  label: "Suspensions", icon: ShieldAlert },
  { path: "/admin/link-requests", label: "Profile Requests",  icon: UserCheck  }
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user, isLeagueManager, isTeamManager, isPlayer } = useAppContext();

  const { data: pending = [] } = usePendingLinkRequests();

  const { data: linkedPlayer } = useMyLinkedPlayer();

  const showAdminMenu = isLeagueManager;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar px-6 py-2 fixed inset-y-0 left-0 z-30 overflow-y-auto">
        <Link href="/">
          <div className="flex items-center cursor-pointer justify-center h-14  mb-3">
            <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-[150px] w-[200px]" />
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                    ? "bg-primary/15 text-primary glow-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {linkedPlayer && (
            <Link
                href="/my-profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === "/my-profile"
                    ? "bg-primary/15 text-primary glow-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
          )}

          {showAdminMenu && (
            <>
              <div className="my-4 border-t border-border" />
              <p className="text-xs text-muted-foreground font-semibold px-4 py-2 uppercase tracking-wider">Admin</p>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-primary/15 text-primary glow-green"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {pending.length > 0 && (
                <span className="inline-block text-[10px] uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
                  {pending.length} Pending Requests
                </span>
              )}
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-border space-y-3 flex flex-col">
          {isLeagueManager && (
            <span className="inline-block self-start text-[10px] uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
              League Manager
            </span>
          )}
          {isTeamManager && (
            <span className="inline-block self-start text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
              Team Manager
            </span>
          )}
          {isPlayer && (
            <span className="inline-block self-start text-[10px] uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
              Player
            </span>
          )}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <UserProfileDropdown
              user={user}
              onSignOut={signOut}
              size="md"
            />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-6 w-auto" />
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur-md pt-16 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {showAdminMenu && (
                <>
                  <div className="my-4 border-t border-border" />
                  <p className="text-xs text-muted-foreground font-semibold px-4 py-2 uppercase tracking-wider">Admin</p>
                  {adminNavItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-border bg-sidebar mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <p className="text-xs font-medium truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <UserProfileDropdown
                user={user}
                onSignOut={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                size="sm"
              />
            </div>
            {isLeagueManager && (
              <span className="inline-block text-[10px] uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full font-semibold">
                League Manager
              </span>
            )}
            {isTeamManager && (
              <span className="inline-block text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                Team Manager
              </span>
            )}
            {isPlayer && (
              <span className="inline-block text-[10px] uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                Player
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
