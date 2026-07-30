import type { Booking, Listing } from './models';
import { mockListings } from './mock-data';

/** Format a Date as a UTC `YYYY-MM-DD` string (matches the booking date format). */
function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildBooking(
  id: string,
  listing: Listing | undefined,
  startOffsetDays: number,
  nights: number,
  todayUtc: Date,
): Booking | null {
  if (!listing) return null;
  const start = addDays(todayUtc, startOffsetDays);
  const end = addDays(start, nights);
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  return {
    id,
    listingId: listing.id,
    listingTitle: listing.title,
    location: listing.location,
    currency: listing.currency,
    startDate: toISODate(start),
    endDate: toISODate(end),
    nights,
    pricePerNight: listing.pricePerNight,
    subtotal,
    serviceFee,
    total,
    // Booked a little before the stay begins.
    createdAt: addDays(start, -Math.min(14, nights + 5)).toISOString(),
  };
}

const byId = (id: string) => mockListings.find((l) => l.id === id);

/**
 * A curated set of demo bookings (a mix of upcoming and completed stays) used
 * when the app runs without a backend (`EXPO_PUBLIC_API_URL` unset). Dates are
 * generated relative to today so the "Upcoming"/"Completed" states stay correct.
 */
export function makeMockBookings(): Booking[] {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const bookings = [
    buildBooking('mock-b1', byId('l4'), 12, 3, todayUtc), // upcoming — Aurora Retreat
    buildBooking('mock-b2', byId('l1'), 34, 5, todayUtc), // upcoming — Modern 2BR Apartment
    buildBooking('mock-b3', byId('l8'), -18, 4, todayUtc), // completed — Skyline Nest
    buildBooking('mock-b4', byId('l10'), -47, 2, todayUtc), // completed — Marina Pearl
    buildBooking('mock-b5', byId('l2'), -92, 6, todayUtc), // completed — Cozy 3BR House
  ].filter((b): b is Booking => b !== null);

  return bookings;
}
