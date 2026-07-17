import crypto from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';

function getSecretKey(): string {
  const key = process.env.PAYSTACK_TEST_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_TEST_SECRET_KEY is not configured');
  }
  return key;
}

async function paystackGet(path: string) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
  });
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || 'Paystack API error');
  }
  return json;
}

async function paystackPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message || 'Paystack API error');
  }
  return json;
}

export interface ResolvedAccount {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

export async function resolveAccountNumber(
  accountNumber: string,
  bankCode: string,
): Promise<ResolvedAccount> {
  const data = await paystackGet(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
  );
  return {
    accountName: data.data.account_name,
    accountNumber: data.data.account_number,
    bankCode,
  };
}

export async function createSubaccount(
  businessName: string,
  bankCode: string,
  accountNumber: string,
  percentageCharge: number,
): Promise<{ subaccountCode: string }> {
  const data = await paystackPost('/subaccount', {
    business_name: businessName,
    bank_code: bankCode,
    account_number: accountNumber,
    percentage_charge: percentageCharge,
  });
  return { subaccountCode: data.data.subaccount_code };
}

export async function initializeTransaction(
  email: string,
  amountInKobo: number,
  subaccountCode: string | null,
  metadata: Record<string, unknown>,
): Promise<{ authorizationUrl: string; reference: string }> {
  const body: Record<string, unknown> = {
    email,
    amount: amountInKobo,
    currency: 'NGN',
    metadata,
  };
  if (subaccountCode) {
    body.subaccount = subaccountCode;
    body.transaction_charge = 0;
    body.bearer = 'subaccount';
  }
  const data = await paystackPost('/transaction/initialize', body);
  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export interface PaystackTransactionData {
  id: number;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  customer?: {
    id: number;
    email: string;
    customer_code: string;
  };
  metadata?: Record<string, unknown>;
}

export async function verifyTransaction(
  reference: string,
): Promise<PaystackTransactionData> {
  const data = await paystackGet(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data;
}

export async function createCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<{ customerCode: string; email: string }> {
  const body: Record<string, unknown> = { email };
  if (firstName) body.first_name = firstName;
  if (lastName) body.last_name = lastName;
  const data = await paystackPost('/customer', body);
  return {
    customerCode: data.data.customer_code,
    email: data.data.email,
  };
}

export async function createSubscription(
  customerCode: string,
  planCode: string,
  authorization: string,
): Promise<{ subscriptionCode: string; status: string }> {
  const data = await paystackPost('/subscription', {
    customer: customerCode,
    plan: planCode,
    authorization,
  });
  return {
    subscriptionCode: data.data.subscription_code,
    status: data.data.status,
  };
}

export function verifyWebhookSignature(
  body: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha512', getSecretKey())
    .update(body)
    .digest('hex');
  return hash === signature;
}
