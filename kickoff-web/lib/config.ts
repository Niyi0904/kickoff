export const ENABLE_LEAGUE_FILTERING = true;

export const CURRENT_LEAGUE_ID = 'default';

export const ENABLE_LEAGUES_COLLECTION = true;

// Paystack subscription plan codes — create these plans in the Paystack
// test dashboard, then paste their plan_code values here. These are the
// single source of truth; never inline these values in route handlers.
export const PAYSTACK_SUBSCRIPTION_PLAN_CODE_MONTHLY = 'PLN_mgny4y2m1u9d0lm';
export const PAYSTACK_SUBSCRIPTION_PLAN_CODE_ANNUAL = 'PLN_ww79vrl1zfbgrk4';

export function getSubscriptionPlanCode(interval: 'monthly' | 'annual'): string {
  return interval === 'annual'
    ? PAYSTACK_SUBSCRIPTION_PLAN_CODE_ANNUAL
    : PAYSTACK_SUBSCRIPTION_PLAN_CODE_MONTHLY;
}

// Registration fee in kobo (e.g. NGN 5,000 = 500000 kobo)
export const REGISTRATION_FEE_AMOUNT_KOBO = 500000;

// Percentage of each registration fee that goes to the league subaccount
export const REGISTRATION_FEE_SPLIT_PERCENTAGE = 100;
