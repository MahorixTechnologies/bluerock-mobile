import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api-client';
import { mapApiListing } from '@/lib/listing-mapper';
import type { Booking, OwnerBooking } from '@/lib/models';
import { useBookings } from '@/providers/BookingProvider';
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
  void profile;

  let foundBooking: Booking | null = null;
  let foundRenter: { id: string; name: string; email: string } | undefined;

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

  const [listingExtra, setListingExtra] = useState<{ type?: string; imageUrl?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setListingExtra(null);
    if (!foundBooking?.listingId) return;
    void (async () => {
      try {
        const raw = await apiFetch(`/listings/${foundBooking!.listingId}`);
        if (cancelled || !raw) return;
        const listing = mapApiListing(raw);
        setListingExtra({ type: listing.type, imageUrl: listing.images?.[0] });
      } catch {
        // Booking itself is real; the listing enrichment (type/cover image)
        // is a nice-to-have — leave it unset rather than fabricate one.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundBooking?.listingId]);

  if (!foundBooking) return { data: null };

  const enrichedListing: EnrichedBooking['listing'] = {
    id: foundBooking.listingId,
    title: foundBooking.listingTitle,
    location: foundBooking.location,
    currency: foundBooking.currency,
    type: listingExtra?.type,
    imageUrl: listingExtra?.imageUrl,
  };

  const booking: EnrichedBooking = {
    ...foundBooking,
    listing: enrichedListing,
    renter: foundRenter,
  };

  return { data: booking };
}
