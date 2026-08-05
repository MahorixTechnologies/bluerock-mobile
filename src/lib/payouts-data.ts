export type PayoutBatch = {
  id: string;
  date: string;
  label: string;
  bookingIds: string;
  method: 'Bank Transfer' | 'Wallet' | 'Card';
  amount: number;
  currency: 'USD' | 'NGN';
  fee: number;
  status: 'Paid' | 'Pending' | 'Failed';
  reference: string;
};

export type PayoutPaymentMethod = {
  icon: string;
  title: string;
  sub: string;
  tag: string;
  color: string;
};

function buildGrossFeeNet(gross: number) {
  const fee = Math.round(gross * 0.05);
  const amount = gross - fee;
  return { fee, amount };
}

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function randomRef(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

export const payoutBatches: PayoutBatch[] = [
  (() => {
    const gross = 4250;
    const { fee, amount } = buildGrossFeeNet(gross);
    return {
      id: 'PO-2026-0006',
      date: isoDate(3),
      label: 'Weekly settlement #26',
      bookingIds: 'b-0518, b-0520, b-0521',
      method: 'Bank Transfer' as const,
      amount,
      currency: 'USD' as const,
      fee,
      status: 'Paid' as const,
      reference: randomRef('PYT'),
    };
  })(),
  (() => {
    const gross = 1820;
    const { fee, amount } = buildGrossFeeNet(gross);
    return {
      id: 'PO-2026-0005',
      date: isoDate(10),
      label: 'Weekly settlement #25',
      bookingIds: 'b-0489, b-0492',
      method: 'Bank Transfer' as const,
      amount,
      currency: 'USD' as const,
      fee,
      status: 'Paid' as const,
      reference: randomRef('PYT'),
    };
  })(),
  (() => {
    const gross = 6780;
    const { fee, amount } = buildGrossFeeNet(gross);
    return {
      id: 'PO-2026-0004',
      date: isoDate(17),
      label: 'Weekly settlement #24',
      bookingIds: 'b-0461, b-0465, b-0468, b-0470',
      method: 'Wallet' as const,
      amount,
      currency: 'USD' as const,
      fee,
      status: 'Paid' as const,
      reference: randomRef('PYT'),
    };
  })(),
  (() => {
    const gross = 940;
    const { fee, amount } = buildGrossFeeNet(gross);
    return {
      id: 'PO-2026-0003',
      date: isoDate(24),
      label: 'Weekly settlement #23',
      bookingIds: 'b-0433',
      method: 'Bank Transfer' as const,
      amount,
      currency: 'USD' as const,
      fee,
      status: 'Paid' as const,
      reference: randomRef('PYT'),
    };
  })(),
  (() => {
    const gross = 3100;
    const { fee, amount } = buildGrossFeeNet(gross);
    return {
      id: 'PO-2026-0002',
      date: isoDate(-4),
      label: 'Weekly settlement #27',
      bookingIds: 'b-0541, b-0543, b-0545',
      method: 'Bank Transfer' as const,
      amount,
      currency: 'USD' as const,
      fee,
      status: 'Pending' as const,
      reference: randomRef('PYT'),
    };
  })(),
  (() => {
    const gross = 2200;
    const { fee, amount } = buildGrossFeeNet(gross);
    return {
      id: 'PO-2026-0001',
      date: isoDate(31),
      label: 'Weekly settlement #22',
      bookingIds: 'b-0398, b-0402',
      method: 'Card' as const,
      amount,
      currency: 'USD' as const,
      fee,
      status: 'Failed' as const,
      reference: randomRef('PYT'),
    };
  })(),
];

export const payoutPaymentMethods: PayoutPaymentMethod[] = [
  {
    icon: '🏦',
    title: 'Stanbic IBTC · 0123456789',
    sub: 'Default · Verified · Nigeria',
    tag: 'Default',
    color: '#1E5BFF',
  },
  {
    icon: '👛',
    title: 'BlueRock Wallet',
    sub: 'Instant · Available balance',
    tag: 'Instant',
    color: '#10b981',
  },
];

export function computeTotals() {
  let paid = 0;
  let pending = 0;
  let failed = 0;
  let totalGross = 0;
  let fees = 0;

  for (const batch of payoutBatches) {
    const gross = batch.amount + batch.fee;
    totalGross += gross;
    fees += batch.fee;
    if (batch.status === 'Paid') paid += batch.amount;
    else if (batch.status === 'Pending') pending += batch.amount;
    else if (batch.status === 'Failed') failed += batch.amount;
  }

  return { paid, pending, failed, totalGross, fees };
}
