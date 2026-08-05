import { useMemo } from 'react';

import { useBookings } from '@/providers/BookingProvider';
import { makeMockBookings, makeMockOwnerBookings, type OwnerBooking } from '@/lib/mock-bookings';
import { mockListings } from '@/lib/mock-data';
import type { Booking } from '@/lib/models';
import { useAuth } from '@/providers/AuthProvider';

export type EnrichedBooking = Booking & {
  listing: { id: string; title: string; location: string; currency: 'USD' | 'NGN'; type?: string; imageUrl?: string };
  renter?: { id: string; name: string; email: string };
};

function ownerBookingToBooking(ob: OwnerBooking): Booking {
  return {
    id: ob.id,
    listingId: ob.listing.id,
    listingTitle: ob.listing.title,
    location: ob.listing.location,
    currency: ob.listing.currency,
    startDate: ob.startDate,
    endDate: ob.endDate,
    nights: ob.nights,
    pricePerNight: Math.round(ob.subtotal / Math.max(1, ob.nights)),
    subtotal: ob.subtotal,
    serviceFee: ob.serviceFee,
    total: ob.total,
    createdAt: ob.startDate,
    status: ob.status,
    paymentStatus: ob.paymentStatus,
  };
}

export function useBooking(id: string) {
  const { bookings, ownerBookings } = useBookings();
  const { profile } = useAuth();
  const role = profile?.role ?? 'RENTER';

  const booking: EnrichedBooking | null = useMemo(() => {
    if (!id) return null;

    let foundBooking: Booking | null = null;
    let foundRenter: { id: string; name: string; email: string } | undefined = undefined;

    const renterMatch = bookings.find((b) => b.id === id);
    if (renterMatch) {
      foundBooking = renterMatch;
    }

    if (!foundBooking) {
      const ownerMatch = ownerBookings.find((ob) => ob.id === id);
      if (ownerMatch) {
        foundBooking = ownerBookingToBooking(ownerMatch);
        foundRenter = {
          id: ownerMatch.renter.id,
          name: ownerMatch.renter.name,
          email: ownerMatch.renter.email,
        };
      }
    }

    if (!foundBooking) {
      const mockRenterBookings = makeMockBookings();
      const mockRenterMatch = mockRenterBookings.find((b) => b.id === id);
      if (mockRenterMatch) {
        foundBooking = mockRenterMatch;
      }
    }

    if (!foundBooking) {
      const mockOwnerBookings = makeMockOwnerBookings();
      const mockOwnerMatch = mockOwnerBookings.find((ob) => ob.id === id);
      if (mockOwnerMatch) {
        foundBooking = ownerBookingToBooking(mockOwnerMatch);
        foundRenter = {
          id: mockOwnerMatch.renter.id,
          name: mockOwnerMatch.renter.name,
          email: mockOwnerMatch.renter.email,
        };
      }
    }

    if (!foundBooking) return null;

    const listingData = mockListings.find((l) => l.id === foundBooking!.listingId);
    const enrichedListing: EnrichedBooking['listing'] = {
      id: foundBooking!.listingId,
      title: listingData?.title ?? foundBooking!.listingTitle,
      location: listingData?.location ?? foundBooking!.location,
      currency: listingData?.currency ?? foundBooking!.currency,
      type: listingData?.type,
      imageUrl: listingData?.images?.[0],
    };

    return {
      ...foundBooking,
      listing: enrichedListing,
      renter: foundRenter,
    } as EnrichedBooking;
  }, [id, bookings, ownerBookings, role]);

  return { data: booking };
}
