import type { Booking, Listing, OwnerBooking } from '@/lib/models';

export type ModalMode = 'booking' | 'listing' | 'welcome';
export type TabKey = 'info' | 'actions' | 'history';

export type NormalizedBooking = Booking & {
  listing: { id: string };
  renter?: { name: string };
};

export function normalizeBooking(b: Booking | OwnerBooking): NormalizedBooking {
  if ('listingTitle' in b) {
    return {
      ...b,
      listing: { id: b.listingId },
      renter: undefined,
    };
  }
  return {
    id: b.id,
    listingId: b.listing.id,
    listingTitle: b.listing.title,
    location: b.listing.location,
    currency: b.listing.currency,
    startDate: b.startDate,
    endDate: b.endDate,
    nights: b.nights,
    pricePerNight: Math.round(b.total / Math.max(1, b.nights)),
    subtotal: b.subtotal,
    serviceFee: b.serviceFee,
    total: b.total,
    createdAt: `${Date.now()}`,
    status: b.status,
    paymentStatus: b.paymentStatus,
    listing: { id: b.listing.id },
    renter: { name: b.renter.name },
  };
}

export function initialsFor(nameOrEmail: string): string {
  const clean = nameOrEmail.trim() || 'BR';
  const parts = clean.split(/[\s@]/).filter(Boolean).slice(0, 2);
  return parts.map((p) => (p[0]?.toUpperCase() ?? '')).join('') || 'BR';
}

export function toTitleCase(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase().replace(/_/g, ' ');
}

export type { Booking, Listing };
