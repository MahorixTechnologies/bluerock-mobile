import type { Booking, BookingStatus, PaymentStatus } from '@/lib/models';

export function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function prettyDate(value: string): string {
  const dt = parseDate(value);
  if (!dt) return value;
  return dt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function bookingStatus(endDate: string, todayUtc: number) {
  const endDt = parseDate(endDate);
  return endDt && endDt.getTime() >= todayUtc ? 'Upcoming' : 'Completed';
}

export function summaryRange(bookings: Booking[]) {
  if (!bookings.length) return null;
  const dates = bookings
    .flatMap((item) => [parseDate(item.startDate), parseDate(item.endDate)])
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());

  if (!dates.length) return null;
  return {
    earliest: new Date(Math.min(...dates)),
    latest: new Date(Math.max(...dates)),
  };
}

export function formatBookingDatesCompact(startDate: string, endDate: string): string {
  const s = parseDate(startDate);
  const e = parseDate(endDate);
  if (!s || !e) return `${startDate} → ${endDate}`;
  const sameMonth = s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear();
  const fmtMonthDay = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', timeZone: 'UTC' });
  const fmtYear = (d: Date) => d.toLocaleDateString(undefined, { year: 'numeric', timeZone: 'UTC' });
  if (sameMonth) return `${fmtMonthDay(s)} – ${fmtDay(e)}, ${fmtYear(e)}`;
  return `${fmtMonthDay(s)} – ${fmtMonthDay(e)}, ${fmtYear(e)}`;
}

export type BookingStatusMeta = {
  label: string;
  color: string;
  background: string;
  ring: string;
};

export function getBookingStatusMeta(status: BookingStatus): BookingStatusMeta {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending host',
        color: '#92400e',
        background: '#fffbeb',
        ring: '#fde68a',
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        color: '#065f46',
        background: '#ecfdf5',
        ring: '#a7f3d0',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: '#374151',
        background: '#f3f4f6',
        ring: '#d1d5db',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        color: '#991b1b',
        background: '#fef2f2',
        ring: '#fecaca',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: '#4b5563',
        background: '#f9fafb',
        ring: '#e5e7eb',
      };
    default:
      return {
        label: status || '—',
        color: '#374151',
        background: '#f9fafb',
        ring: '#e5e7eb',
      };
  }
}

export type PaymentStatusMeta = {
  label: string;
  color: string;
  background: string;
  ring: string;
  dot: string;
};

export function getPaymentStatusMeta(status: PaymentStatus): PaymentStatusMeta {
  switch (status) {
    case 'UNPAID':
      return {
        label: 'Awaiting payment',
        color: '#92400e',
        background: '#fffbeb',
        ring: '#fde68a',
        dot: '#f59e0b',
      };
    case 'PAID':
      return {
        label: 'Paid',
        color: '#065f46',
        background: '#ecfdf5',
        ring: '#a7f3d0',
        dot: '#10b981',
      };
    case 'REFUNDED':
      return {
        label: 'Refunded',
        color: '#1e3a8a',
        background: '#eff6ff',
        ring: '#bfdbfe',
        dot: '#3b82f6',
      };
    default:
      return {
        label: status || '—',
        color: '#374151',
        background: '#f9fafb',
        ring: '#e5e7eb',
        dot: '#6b7280',
      };
  }
}

export type TimelineEvent = {
  key: string;
  label: string;
  when: string | null;
  done: boolean;
  active: boolean;
};

export function getTimelineEvents(booking: Pick<Booking, 'createdAt' | 'startDate' | 'endDate' | 'status' | 'paymentStatus'>): TimelineEvent[] {
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const toDayUtc = (s: string) => {
    const d = parseDate(s);
    return d ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) : null;
  };
  const createdUtc = new Date(booking.createdAt || Date.now()).getTime();
  const startUtc = toDayUtc(booking.startDate);
  const endUtc = toDayUtc(booking.endDate);

  const paymentSettled = booking.paymentStatus === 'PAID' || booking.paymentStatus === 'REFUNDED';
  const hostResponded = booking.status !== 'PENDING';
  const started = startUtc != null && startUtc <= todayUtc;
  const ended = endUtc != null && endUtc < todayUtc;

  return [
    {
      key: 'created',
      label: 'Booking requested',
      when: booking.createdAt ? new Date(booking.createdAt).toISOString().slice(0, 10) : null,
      done: true,
      active: false,
    },
    {
      key: 'confirmed',
      label: booking.status === 'REJECTED' ? 'Host declined' : 'Host confirmed',
      when: hostResponded && booking.createdAt
        ? new Date(createdUtc + 1000 * 60 * 60 * 6).toISOString().slice(0, 10)
        : null,
      done: hostResponded,
      active: !hostResponded,
    },
    {
      key: 'paid',
      label: booking.paymentStatus === 'REFUNDED' ? 'Refund processed' : 'Payment received',
      when: paymentSettled && booking.createdAt
        ? new Date(createdUtc + 1000 * 60 * 60 * 12).toISOString().slice(0, 10)
        : null,
      done: paymentSettled,
      active: !paymentSettled && hostResponded,
    },
    {
      key: 'checkin',
      label: 'Check-in',
      when: booking.startDate || null,
      done: !!started,
      active: !started && !!paymentSettled,
    },
    {
      key: 'checkout',
      label: 'Check-out & review',
      when: booking.endDate || null,
      done: !!ended,
      active: !ended && !!started,
    },
  ];
}
