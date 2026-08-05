import type { Listing } from '@/lib/models';
import type { LandlordPropertyItem, LandlordStats } from './types';

export function deriveLandlordStats(listings: Listing[]): LandlordStats {
  const totalProperties = listings.length;
  let occupied = 0;
  let vacant = 0;

  listings.forEach((listing, index) => {
    const status =
      listing.occupancyStatus ??
      (index % 3 === 0 ? 'Vacant' : 'Occupied');
    if (status === 'Occupied') occupied += 1;
    else if (status === 'Vacant') vacant += 1;
  });

  const yearlyRevenue = listings.reduce((sum, l, index) => {
    const status =
      l.occupancyStatus ??
      (index % 3 === 0 ? 'Vacant' : 'Occupied');
    if (status !== 'Occupied') return sum;
    return sum + l.pricePerNight * 365 * 0.65;
  }, 0);

  const monthlyRevenue = Math.round(yearlyRevenue / 12);

  return {
    totalProperties,
    occupied,
    vacant,
    monthlyRevenue,
    currency: listings[0]?.currency ?? 'NGN',
  };
}

export function deriveLandlordProperties(listings: Listing[]): LandlordPropertyItem[] {
  return listings.map((listing, index) => {
    const status =
      (listing.occupancyStatus as 'Occupied' | 'Vacant' | 'Draft') ??
      (index % 3 === 0 ? 'Vacant' : 'Occupied');
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
