import type {
  Booking,
  BookingStatus,
  PaymentIntent,
  PaymentStatus,
  PaymentTransaction,
  Receipt,
  Refund,
} from './models';

type PaymentStore = {
  intents: Record<string, PaymentIntent>;
  transactions: Record<string, PaymentTransaction>;
  receipts: Record<string, Receipt>;
  refunds: Record<string, Refund>;
};

const store: PaymentStore = {
  intents: {},
  transactions: {},
  receipts: {},
  refunds: {},
};

export function getIntents(): Record<string, PaymentIntent> {
  return { ...store.intents };
}

export function getTransactions(): Record<string, PaymentTransaction> {
  return { ...store.transactions };
}

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

function buildTxnReference(): string {
  return `TXN-${randomHex(8)}-${randomHex(6)}`;
}

export function createPaymentIntent(booking: Booking): PaymentIntent {
  const intent: PaymentIntent = {
    id: `pi-${Date.now()}-${randomHex(6)}`,
    bookingId: booking.id,
    amount: booking.total,
    currency: booking.currency,
    status: 'CREATED',
    createdAt: new Date().toISOString(),
  };
  store.intents[intent.id] = intent;
  return intent;
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

export function confirmPayment(
  intentId: string,
  method: 'Card' | 'Bank' | 'Wallet' = 'Card',
): { transaction: PaymentTransaction; receipt: Receipt } {
  const intent = store.intents[intentId];
  if (!intent) {
    throw new Error(`Payment intent ${intentId} not found`);
  }

  const gross = intent.amount;
  const fee = Math.round(gross * 0.1);
  const net = gross - fee;

  const transaction: PaymentTransaction = {
    id: `txn-${Date.now()}-${randomHex(6)}`,
    intentId: intent.id,
    bookingId: intent.bookingId,
    amount: gross,
    currency: intent.currency,
    status: 'SUCCESS',
    method,
    reference: buildTxnReference(),
    processedAt: new Date().toISOString(),
    fee,
    net,
  };
  store.transactions[transaction.id] = transaction;
  store.intents[intent.id] = { ...intent, status: 'CAPTURED' };

  const subtotal = gross - fee;
  const serviceFee = fee;

  const lineItems: { label: string; amount: number }[] = [
    { label: 'Accommodation', amount: subtotal },
    { label: 'Service fee', amount: serviceFee },
  ];

  const receipt: Receipt = {
    id: `rcpt-${Date.now()}-${randomHex(6)}`,
    bookingId: intent.bookingId,
    transactionId: transaction.id,
    number: buildReceiptNumber(),
    issuedAt: new Date().toISOString(),
    lineItems,
    subtotal,
    serviceFee,
    total: gross,
    currency: intent.currency,
    payer: 'Guest',
    recipient: 'BlueRock',
  };
  store.receipts[receipt.id] = receipt;

  return { transaction, receipt };
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

export function issueRefund(bookingId: string, reason: string): Refund {
  const entries = Object.values(store.transactions).filter((t) => t.bookingId === bookingId);
  const lastTx = entries[entries.length - 1];
  if (!lastTx) {
    throw new Error(`No transaction found for booking ${bookingId}`);
  }

  const refund: Refund = {
    id: `ref-${Date.now()}-${randomHex(6)}`,
    bookingId,
    transactionId: lastTx.id,
    amount: lastTx.amount,
    currency: lastTx.currency,
    reason,
    status: 'COMPLETED',
    reference: `RFD-${randomHex(8)}`,
    requestedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  store.refunds[refund.id] = refund;
  return refund;
}
