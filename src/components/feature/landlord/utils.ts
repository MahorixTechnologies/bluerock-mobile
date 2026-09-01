import type { Listing, OwnerBooking } from '@/lib/models';
import type { LandlordPropertyItem, LandlordStats } from './types';

function isActiveToday(booking: OwnerBooking, todayIso: string): boolean {
  return (
    booking.status === 'CONFIRMED' &&
    booking.startDate <= todayIso &&
    booking.endDate >= todayIso
  );
}

export function deriveLandlordStats(listings: Listing[], bookings: OwnerBooking[]): LandlordStats {
  const totalProperties = listings.length;
  const todayIso = new Date().toISOString().slice(0, 10);
  const occupiedListingIds = new Set(
    bookings.filter((b) => isActiveToday(b, todayIso)).map((b) => b.listing.id),
  );
  const occupied = listings.filter((l) => occupiedListingIds.has(l.id)).length;
  const vacant = totalProperties - occupied;

  const now = new Date();
  const monthlyRevenue = bookings.reduce((sum, b) => {
    if (b.paymentStatus !== 'PAID') return sum;
    const start = new Date(b.startDate + 'T00:00:00Z');
    if (start.getUTCFullYear() !== now.getUTCFullYear() || start.getUTCMonth() !== now.getUTCMonth()) {
      return sum;
    }
    return sum + b.total;
  }, 0);

  return {
    totalProperties,
    occupied,
    vacant,
    monthlyRevenue,
    currency: listings[0]?.currency ?? 'NGN',
  };
}

export function deriveLandlordProperties(listings: Listing[], bookings: OwnerBooking[]): LandlordPropertyItem[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const occupiedListingIds = new Set(
    bookings.filter((b) => isActiveToday(b, todayIso)).map((b) => b.listing.id),
  );

  return listings.map((listing) => {
    const status: LandlordPropertyItem['status'] = occupiedListingIds.has(listing.id)
      ? 'Occupied'
      : listing.status === 'PENDING'
        ? 'Draft'
        : 'Vacant';
    const pricePerYear = Math.round(listing.pricePerNight * 365);
    return {
      id: listing.id,
      title: listing.title,
      location: listing.location,
      status,
      pricePerYear,
      currency: listing.currency,
      image: listing.images[0] ?? '',
    };
  });
}
