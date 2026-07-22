import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Clipboard,
  ShieldCheck,
  Trophy,
  UserRound,
  Check,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MANAGER_PLANS, PLAYER_FEE } from "@/lib/pricing-plans";

const organizerFeatures = [
  { title: "League Management", text: "Season setup, clubs, managers, and role-aware league control.", icon: Trophy },
  { title: "Fixture Scheduling", text: "Organize match weeks, kickoff times, venues, and generated schedules.", icon: CalendarClock },
  { title: "Match Reporting", text: "Capture scores, discipline, attendance, goals, assists, and final reports.", icon: Clipboard },
  { title: "Statistics Tracking", text: "Public tables, leaders, form, scorers, assists, and performance stories.", icon: Activity },
  { title: "Team Management", text: "Club profiles, squad lists, team branding, managers, and player links.", icon: ShieldCheck },
  { title: "Player Registration", text: "Invite-based accounts with profile linking and player dashboard access.", icon: UserRound },
];

const proofPoints = [
  { label: "Public league hub", value: "Fixtures, standings, teams, stats, and results in one polished place." },
  { label: "Protected operations", value: "Admins and managers can keep league work behind authenticated workflows." },
  { label: "Matchday pulse", value: "Live score context and public updates help the season feel active." },
];

export default function OrganizersPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07130f] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07130f]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex h-14 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kickoff-logo-wordmark.png" alt="KICKOFF" className="h-[150px] w-[170px]" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white">
              Browse Leagues
            </Link>
            <Link href="#pricing" className="rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white">
              Pricing
            </Link>
            <Link href="/auth" className="rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/8 hover:text-white">
              Sign In
            </Link>
          </nav>
          <Button asChild className="h-10 rounded-md bg-[#f5c84b] px-4 font-bold text-[#102018] hover:bg-[#ffd869]">
            <Link href="/onboarding/create-league">Create League</Link>
          </Button>
        </div>
      </header>

      <section className="relative min-h-[88vh] overflow-hidden pt-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1800&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#03120d]/75" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,13,0.96),rgba(3,18,13,0.62),rgba(3,18,13,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07130f] to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(88vh-5rem)] max-w-7xl flex-col justify-center px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-[#f5c84b]" />
              Built for organizers
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              Football league management with a live matchday pulse.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              Run the operations behind your competition and give supporters a public season hub for clubs, fixtures, tables, results, and top performers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-md bg-[#26c267] px-5 font-bold text-[#06110d] hover:bg-[#51d884]">
                <Link href="/onboarding/create-league">
                  Start Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-md border-white/25 bg-white/10 px-5 font-bold text-white hover:bg-white/18 hover:text-white">
                <Link href="/">Browse Leagues</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#07130f] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {proofPoints.map((point) => (
              <div key={point.label} className="rounded-md border border-white/10 bg-white/[0.05] p-5">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#51d884]">{point.label}</p>
                <p className="mt-3 text-base leading-7 text-white/64">{point.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7f1] px-4 py-16 text-[#102018] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248552]">Platform Features</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Built for organizers, teams, players, and supporters</h2>
            <p className="mt-4 text-base leading-7 text-[#526357]">
              Public discovery and protected operations work together so the league feels credible before login and powerful after it.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizerFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-md border border-[#102018]/10 bg-white p-5">
                  <Icon className="h-6 w-6 text-[#248552]" />
                  <h3 className="mt-4 text-xl font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#526357]">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#07130f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f5c84b]">Pricing</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55 max-w-2xl mx-auto">
              One low monthly or annual fee covers your entire league. No hidden fees, no per-player charges.
            </p>
          </div>

          {/* ── League Manager Plans ─────────────────────────── */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
            {MANAGER_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-[#f5c84b]/40 bg-[#f5c84b]/[0.04]'
                    : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-[#f5c84b] px-4 py-1 text-xs font-black uppercase tracking-wider text-[#102018]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Best Value
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-white/55 mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{plan.priceLabel}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      per {plan.interval}{plan.interval === 'year' ? ' (save 17%)' : ''}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-[#f5c84b]' : 'text-[#51d884]'}`} />
                      <span className="text-sm text-white/70">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-8 w-full h-12 rounded-xl font-bold ${
                    plan.highlighted
                      ? 'bg-[#f5c84b] text-[#102018] hover:bg-[#ffd869]'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/18'
                  }`}
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          {/* ── Player Fee ───────────────────────────────────── */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#26c267]/20 border border-[#26c267]/30 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[#26c267]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">For Players</h3>
                  <p className="text-sm text-white/55 mt-1">
                    Sign up free, then pay a one-time registration fee to join any league.
                  </p>
                  <ul className="mt-4 space-y-2">
                    {PLAYER_FEE.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#26c267]" />
                        <span className="text-sm text-white/70">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="text-center lg:text-right shrink-0">
                <p className="text-2xl font-black text-white">{PLAYER_FEE.priceLabel}</p>
                <p className="text-xs text-white/40 mt-0.5">one-time per league</p>
                <Button asChild className="mt-3 h-11 rounded-xl bg-[#26c267] font-bold text-[#06110d] hover:bg-[#51d884] px-6">
                  <Link href={PLAYER_FEE.ctaHref}>{PLAYER_FEE.cta}</Link>
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-white/30">
            All prices in Nigerian Naira (NGN). Subscription automatically renews. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="bg-[#f4f7f1] px-4 py-16 text-[#102018] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#248552]">Ready to create</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Set up the league and publish the season.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#526357]">
              Create the competition, invite the right people, and turn recorded match data into a public home supporters can follow.
            </p>
          </div>
          <Button asChild size="lg" className="h-12 rounded-md bg-[#102018] px-5 font-bold text-white hover:bg-[#1d3428]">
            <Link href="/onboarding/create-league">
              Create Your League
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
