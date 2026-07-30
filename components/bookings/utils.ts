import type { Booking } from '@/lib/models';

function parseDate(value: string): Date | null {
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
