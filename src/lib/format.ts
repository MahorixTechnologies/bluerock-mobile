import type { Listing } from './models';

type Currency = Listing['currency'];

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  NGN: '₦',
};

export function currencySymbol(currency: Currency): string {
  return SYMBOLS[currency] ?? '';
}

/**
 * Format a monetary amount with the correct currency symbol and grouped
 * thousands, e.g. `formatMoney(85000, 'NGN')` → `₦85,000`.
 */
export function formatMoney(value: number, currency: Currency): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${currencySymbol(currency)}${safe.toLocaleString()}`;
}

/** Same as `formatMoney` but suffixed with `/night`. */
export function formatPricePerNight(value: number, currency: Currency): string {
  return `${formatMoney(value, currency)} / night`;
}
