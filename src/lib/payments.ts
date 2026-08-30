import type { Booking, BookingStatus, PaymentStatus, Receipt, Refund } from './models';

type PaymentStore = {
  receipts: Record<string, Receipt>;
  refunds: Record<string, Refund>;
};

const store: PaymentStore = {
  receipts: {},
  refunds: {},
};

export function getReceipts(): Record<string, Receipt> {
  return { ...store.receipts };
}

export function getRefunds(): Record<string, Refund> {
  return { ...store.refunds };
}

function randomHex(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function pad(num: number, digits: number): string {
  return String(num).padStart(digits, '0');
}

function buildReceiptNumber(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = pad(now.getUTCMonth() + 1, 2);
  const dd = pad(now.getUTCDate(), 2);
  const seq = Math.floor(Math.random() * 100000000);
  return `RCPT-${yyyy}${mm}${dd}-${pad(seq, 8)}`;
}

export function updateBookingPaymentStatus(
  booking: Booking,
  paymentStatus: PaymentStatus,
  status?: BookingStatus,
): Booking {
  const clone: Booking = { ...booking };
  clone.paymentStatus = paymentStatus;
  if (status !== undefined) clone.status = status;
  return clone;
}

/**
 * There's no dedicated receipt-generation endpoint on the backend — once a
 * real Paystack/Flutterwave payment is verified, this builds a display-only
 * receipt from the booking's own (now-real) totals. `paymentReference`, when
 * available, is the real provider reference rather than a synthesized id.
 */
export function recordReceiptForPaidBooking(booking: Booking, paymentReference?: string): Receipt {
  const existing = getReceiptForBooking(booking.id);
  if (existing) return existing;

  const receipt: Receipt = {
    id: `rcpt-${Date.now()}-${randomHex(6)}`,
    bookingId: booking.id,
    transactionId: paymentReference ?? `txn-${Date.now()}-${randomHex(6)}`,
    number: buildReceiptNumber(),
    issuedAt: new Date().toISOString(),
    lineItems: [
      { label: 'Accommodation', amount: booking.subtotal },
      { label: 'Service fee', amount: booking.serviceFee },
    ],
    subtotal: booking.subtotal,
    serviceFee: booking.serviceFee,
    total: booking.total,
    currency: booking.currency,
    payer: 'Guest',
    recipient: 'BlueRock',
  };
  store.receipts[receipt.id] = receipt;
  return receipt;
}

export function getReceiptForBooking(bookingId: string): Receipt | undefined {
  const entries = Object.values(store.receipts);
  return entries.find((r) => r.bookingId === bookingId);
}

export function isRefundEligible(booking: Booking): boolean {
  if (booking.paymentStatus !== 'PAID') return false;
  const startDate = new Date(booking.startDate + 'T00:00:00Z');
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return startDate.getTime() > todayUtc.getTime();
}

/**
 * Refunds are explicitly out of scope for the real-payment integration —
 * this stays local/fake exactly as before, just sourced from the booking's
 * own real totals instead of a fake transaction record (which no longer
 * exists now that payments are real).
 */
export function issueRefund(booking: Booking, reason: string): Refund {
  const refund: Refund = {
    id: `ref-${Date.now()}-${randomHex(6)}`,
    bookingId: booking.id,
    transactionId: getReceiptForBooking(booking.id)?.transactionId ?? `txn-${Date.now()}-${randomHex(6)}`,
    amount: booking.total,
    currency: booking.currency,
    reason,
    status: 'COMPLETED',
    reference: `RFD-${randomHex(8)}`,
    requestedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  store.refunds[refund.id] = refund;
  return refund;
}
