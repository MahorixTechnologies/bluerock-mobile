import type { Booking } from './models';
import { mockListings } from './mock-data';

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
  listingId: string,
  startOffsetDays: number,
  nights: number,
  status: Booking['status'],
  paymentStatus: Booking['paymentStatus'],
  todayUtc: Date,
): Booking | null {
  const listing = mockListings.find((l) => l.id === listingId);
  if (!listing) return null;
  const start = addDays(todayUtc, startOffsetDays);
  const end = addDays(start, nights);
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  return {
    id,
    listingId,
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
    status,
    paymentStatus,
    createdAt: addDays(start, -Math.min(14, nights + 5)).toISOString(),
  };
}

export function makeMockBookings(): Booking[] {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  return [
    buildBooking('mock-b1', 'l1', 3, 2, 'CONFIRMED', 'PAID', todayUtc),
    buildBooking('mock-b2', 'l3', 11, 4, 'CONFIRMED', 'PAID', todayUtc),
    buildBooking('mock-b3', 'l5', 22, 3, 'PENDING', 'UNPAID', todayUtc),
    buildBooking('mock-b4', 'l6', 35, 7, 'PENDING', 'PAID', todayUtc),
    buildBooking('mock-b5', 'l7', 49, 5, 'CONFIRMED', 'PAID', todayUtc),
    buildBooking('mock-b6', 'l2', -5, 2, 'CANCELLED', 'REFUNDED', todayUtc),
    buildBooking('mock-b7', 'l4', -20, 4, 'COMPLETED', 'PAID', todayUtc),
    buildBooking('mock-b8', 'l8', -36, 3, 'COMPLETED', 'PAID', todayUtc),
    buildBooking('mock-b9', 'l9', -60, 6, 'COMPLETED', 'PAID', todayUtc),
    buildBooking('mock-b10', 'l10', -98, 2, 'COMPLETED', 'REFUNDED', todayUtc),
    buildBooking('mock-b11', 'l2', -140, 5, 'REJECTED', 'UNPAID', todayUtc),
  ].filter((b): b is Booking => b !== null);
}

export type OwnerBooking = {
  id: string;
  startDate: string;
  endDate: string;
  nights: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  status: Booking['status'];
  paymentStatus: Booking['paymentStatus'];
  listing: { id: string; title: string; location: string; currency: 'USD' | 'NGN' };
  renter: { id: string; email: string; name: string; phone: string };
};

export function makeMockOwnerBookings(): OwnerBooking[] {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const renters = [
    { id: 'gr-1', email: 'amanda@example.com', name: 'Amanda Okafor', phone: '+2348010000001' },
    { id: 'gr-2', email: 'tunde@example.com', name: 'Tunde Bakare', phone: '+2348010000002' },
    { id: 'gr-3', email: 'sarah@example.com', name: 'Sarah Johnson', phone: '+2348010000003' },
    { id: 'gr-4', email: 'kofi@example.com', name: 'Kofi Mensah', phone: '+2348010000004' },
    { id: 'gr-5', email: 'zainab@example.com', name: 'Zainab Umar', phone: '+2348010000005' },
    { id: 'gr-6', email: 'david@example.com', name: 'David Chen', phone: '+2348010000006' },
    { id: 'gr-7', email: 'amina@example.com', name: 'Amina Hassan', phone: '+2348010000007' },
  ];
  const plans: {
    id: string;
    listingId: string;
    renterIdx: number;
    startOffset: number;
    nights: number;
    status: OwnerBooking['status'];
    paymentStatus: OwnerBooking['paymentStatus'];
  }[] = [
    { id: 'mock-ob1', listingId: 'l1', renterIdx: 0, startOffset: 3, nights: 2, status: 'CONFIRMED', paymentStatus: 'PAID' },
    { id: 'mock-ob2', listingId: 'l3', renterIdx: 1, startOffset: 11, nights: 4, status: 'CONFIRMED', paymentStatus: 'PAID' },
    { id: 'mock-ob3', listingId: 'l5', renterIdx: 2, startOffset: 22, nights: 3, status: 'PENDING', paymentStatus: 'UNPAID' },
    { id: 'mock-ob4', listingId: 'l6', renterIdx: 3, startOffset: 35, nights: 7, status: 'PENDING', paymentStatus: 'PAID' },
    { id: 'mock-ob5', listingId: 'l7', renterIdx: 4, startOffset: 49, nights: 5, status: 'CONFIRMED', paymentStatus: 'PAID' },
    { id: 'mock-ob6', listingId: 'l2', renterIdx: 5, startOffset: -5, nights: 2, status: 'CANCELLED', paymentStatus: 'REFUNDED' },
    { id: 'mock-ob7', listingId: 'l4', renterIdx: 6, startOffset: -20, nights: 4, status: 'COMPLETED', paymentStatus: 'PAID' },
    { id: 'mock-ob8', listingId: 'l8', renterIdx: 0, startOffset: -36, nights: 3, status: 'COMPLETED', paymentStatus: 'PAID' },
    { id: 'mock-ob9', listingId: 'l9', renterIdx: 1, startOffset: -60, nights: 6, status: 'COMPLETED', paymentStatus: 'PAID' },
    { id: 'mock-ob10', listingId: 'l2', renterIdx: 2, startOffset: -140, nights: 5, status: 'REJECTED', paymentStatus: 'UNPAID' },
  ];

  return plans
    .map((p) => {
      const listing = mockListings.find((l) => l.id === p.listingId);
      if (!listing) return null;
      const start = addDays(todayUtc, p.startOffset);
      const end = addDays(start, p.nights);
      const subtotal = p.nights * listing.pricePerNight;
      const serviceFee = Math.round(subtotal * 0.1);
      const total = subtotal + serviceFee;
      const renter = renters[p.renterIdx];
      return {
        id: p.id,
        startDate: toISODate(start),
        endDate: toISODate(end),
        nights: p.nights,
        subtotal,
        serviceFee,
        total,
        status: p.status,
        paymentStatus: p.paymentStatus,
        listing: {
          id: listing.id,
          title: listing.title,
          location: listing.location,
          currency: listing.currency,
        },
        renter,
      };
    })
    .filter((b): b is OwnerBooking => b !== null);
}

export function createFakeBooking(
  opts?: {
    listingId?: string;
    startOffsetDays?: number;
    nights?: number;
    status?: Booking['status'];
    paymentStatus?: Booking['paymentStatus'];
    role?: 'RENTER' | 'LANDLORD';
  },
): { booking: Booking; ownerBooking?: OwnerBooking } | null {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const candidate = mockListings.filter((l) => opts?.listingId ? l.id === opts.listingId : true);
  const listing = candidate[Math.floor(Math.random() * candidate.length)] ?? candidate[0];
  if (!listing) return null;
  const nights = opts?.nights ?? 2 + Math.floor(Math.random() * 6);
  const startOffset = opts?.startOffsetDays ?? 2 + Math.floor(Math.random() * 50);
  const renterPool = [
    { id: 'gr-1', email: 'amanda@example.com', name: 'Amanda Okafor', phone: '+2348010000001' },
    { id: 'gr-2', email: 'tunde@example.com', name: 'Tunde Bakare', phone: '+2348010000002' },
    { id: 'gr-3', email: 'sarah@example.com', name: 'Sarah Johnson', phone: '+2348010000003' },
    { id: 'gr-4', email: 'kofi@example.com', name: 'Kofi Mensah', phone: '+2348010000004' },
    { id: 'gr-5', email: 'zainab@example.com', name: 'Zainab Umar', phone: '+2348010000005' },
  ];
  const renter = renterPool[Math.floor(Math.random() * renterPool.length)];
  const status = opts?.status ?? (Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING');
  const paymentStatus = opts?.paymentStatus ?? (status === 'CONFIRMED' ? 'PAID' : Math.random() > 0.5 ? 'PAID' : 'UNPAID');

  const start = addDays(todayUtc, startOffset);
  const end = addDays(start, nights);
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  const id = `fake-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const booking: Booking = {
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
    status,
    paymentStatus,
    createdAt: new Date().toISOString(),
  };

  if ((opts?.role ?? 'LANDLORD') === 'LANDLORD') {
    const ownerBooking: OwnerBooking = {
      id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      nights,
      subtotal,
      serviceFee,
      total,
      status,
      paymentStatus,
      listing: {
        id: listing.id,
        title: listing.title,
        location: listing.location,
        currency: listing.currency,
      },
      renter,
    };
    return { booking, ownerBooking };
  }

  return { booking };
}
