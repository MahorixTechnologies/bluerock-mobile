import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { apiFetch } from '@/lib/api-client';

export type PaymentProvider = 'PAYSTACK' | 'FLUTTERWAVE';
export type PaymentPurpose = 'BOOKING' | 'FEATURED_LISTING';

type InitiateResponse = { authorizationUrl: string; reference: string };
type VerifyResponse = { success: boolean; alreadyProcessed?: boolean };

/**
 * Shared by booking payment and listing-boost purchase: opens a
 * Paystack/Flutterwave hosted checkout in an auth session and verifies the
 * result with the backend once the provider redirects back to the app via
 * deep link. Uses expo-web-browser + expo-linking — both already
 * dependencies, no config plugin or EAS rebuild needed.
 */
export async function payWithProvider(params: {
  purpose: PaymentPurpose;
  targetId: string;
  provider: PaymentProvider;
}): Promise<{ reference: string }> {
  const redirectUri = Linking.createURL('payment-callback');

  const initiated = (await apiFetch('/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose: params.purpose,
      targetId: params.targetId,
      provider: params.provider,
      callbackUrl: redirectUri,
    }),
  })) as InitiateResponse;

  const result = await WebBrowser.openAuthSessionAsync(initiated.authorizationUrl, redirectUri);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Payment was cancelled.');
  }

  const parsed = Linking.parse(result.url);
  const query = parsed.queryParams ?? {};
  const status = typeof query.status === 'string' ? query.status : undefined;
  if (status && status !== 'successful' && status !== 'completed') {
    throw new Error('Payment was not completed.');
  }

  const reference =
    (typeof query.reference === 'string' && query.reference) ||
    (typeof query.tx_ref === 'string' && query.tx_ref) ||
    undefined;
  if (!reference) {
    throw new Error('Payment could not be verified.');
  }
  const providerTransactionId =
    typeof query.transaction_id === 'string' ? query.transaction_id : undefined;

  const verified = (await apiFetch('/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, providerTransactionId }),
  })) as VerifyResponse;

  if (!verified.success) {
    throw new Error('Payment could not be verified.');
  }

  return { reference };
}
