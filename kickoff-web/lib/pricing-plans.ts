export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  interval: 'month' | 'year' | 'one-time' | null;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  features: PricingFeature[];
}

export const MANAGER_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'League Manager',
    description: 'Everything you need to run a single league season.',
    price: 10000,
    priceLabel: 'NGN 10,000',
    interval: 'month',
    cta: 'Start Free',
    ctaHref: '/onboarding/create-league',
    features: [
      { text: 'League creation & configuration', included: true },
      { text: 'Team management (add/edit/approve)', included: true },
      { text: 'Player registration & invite codes', included: true },
      { text: 'Match scheduling & auto fixture generation', included: true },
      { text: 'Match reporting (scores, goals, assists, cards)', included: true },
      { text: 'Live match centre with real-time updates', included: true },
      { text: 'League standings & statistics', included: true },
      { text: 'Analytics & insights dashboard', included: true },
      { text: 'Public league hub (fixtures, tables, stats)', included: true },
      { text: 'Subaccount onboarding for payment splits', included: true },
      { text: 'Player registration fee collection', included: true },
      { text: 'Suspension & link request management', included: true },
      { text: 'Role-based user management', included: true },
      { text: 'Email notifications & invites', included: true },
    ],
  },
  {
    id: 'annual',
    name: 'League Manager',
    description: 'Everything in Monthly, plus two months free.',
    price: 100000,
    priceLabel: 'NGN 100,000',
    interval: 'year',
    cta: 'Start Free',
    ctaHref: '/onboarding/create-league',
    highlighted: true,
    features: [
      { text: 'All Monthly features', included: true },
      { text: 'Two months free (vs monthly billing)', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new features', included: true },
    ],
  },
];

export const PLAYER_FEE: PricingPlan = {
  id: 'player',
  name: 'Player',
  description: 'Join any league and track your performance.',
  price: 5000,
  priceLabel: 'NGN 5,000',
  interval: 'one-time',
  cta: 'Get Started',
  ctaHref: '/auth',
  features: [
    { text: 'Create an account for free', included: true },
    { text: 'One-time registration fee of NGN 5,000', included: true },
    { text: 'Personal player profile & dashboard', included: true },
    { text: 'Season stats tracking (goals, assists, cards)', included: true },
    { text: 'Match history & performance timeline', included: true },
    { text: 'View team rosters & league standings', included: true },
    { text: 'Receive match notifications', included: true },
  ],
};
