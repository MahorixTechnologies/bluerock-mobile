import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/lib/api-client';
import { makeMockBookings } from '@/lib/mock-bookings';
import type { Booking, Listing } from '@/lib/models';
import { useAuth } from '@/providers/AuthProvider';

type BookingContextValue = {
  bookings: Booking[];
  createBooking: (params: {
    listing: Listing;
    startDate: string;
    endDate: string;
    nights: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  }) => Promise<Booking>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { status, profile } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (status !== 'signedIn' || !profile || profile.role !== 'RENTER') {
        setBookings([]);
        return;
      }
      if (!process.env.EXPO_PUBLIC_API_URL) {
        // No backend configured: show demo bookings so the flow is explorable.
        setBookings(makeMockBookings());
        return;
      }
      try {
        const raw = await apiFetch('/bookings/me');
        if (cancelled) return;
        const items = Array.isArray(raw) ? (raw as any[]) : [];
        const mapped: Booking[] = items.map((b) => {
          const listing = (b as any)?.listing ?? {};
          return {
            id: String((b as any)?.id ?? ''),
            listingId: String((b as any)?.listingId ?? (listing as any)?.id ?? ''),
            listingTitle: String((listing as any)?.title ?? ''),
            location: String((listing as any)?.location ?? ''),
            currency: (listing as any)?.currency === 'USD' ? 'USD' : 'NGN',
            startDate: String((b as any)?.startDate ?? ''),
            endDate: String((b as any)?.endDate ?? ''),
            nights: Number((b as any)?.nights ?? 0),
            pricePerNight: Number((listing as any)?.pricePerNight ?? 0),
            subtotal: Number((b as any)?.subtotal ?? 0),
            serviceFee: Number((b as any)?.serviceFee ?? 0),
            total: Number((b as any)?.total ?? 0),
            createdAt: String((b as any)?.createdAt ?? ''),
          };
        });
        setBookings(mapped);
      } catch {
        setBookings([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, status]);

  const value = useMemo<BookingContextValue>(() => {
    return {
      bookings,
      createBooking: async ({ listing, startDate, endDate, nights, subtotal, serviceFee, total }) => {
        if (!process.env.EXPO_PUBLIC_API_URL) {
          // No backend: persist the booking locally so it shows up in history.
          const booking: Booking = {
            id: `local-${Date.now()}`,
            listingId: listing.id,
            listingTitle: listing.title,
            location: listing.location,
            currency: listing.currency,
            startDate,
            endDate,
            nights,
            pricePerNight: listing.pricePerNight,
            subtotal,
            serviceFee,
            total,
            createdAt: new Date().toISOString(),
          };
          setBookings((prev) => [booking, ...prev]);
          return booking;
        }
        const raw = await apiFetch('/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: listing.id, startDate, endDate }),
        });
        const listingInfo = (raw as any)?.listing ?? {};
        const booking: Booking = {
          id: String((raw as any)?.id ?? ''),
          listingId: String((raw as any)?.listingId ?? listing.id),
          listingTitle: String((listingInfo as any)?.title ?? listing.title),
          location: String((listingInfo as any)?.location ?? listing.location),
          currency: ((listingInfo as any)?.currency ?? listing.currency) === 'USD' ? 'USD' : 'NGN',
          startDate: String((raw as any)?.startDate ?? startDate),
          endDate: String((raw as any)?.endDate ?? endDate),
          nights: Number((raw as any)?.nights ?? nights),
          pricePerNight: Number((listingInfo as any)?.pricePerNight ?? listing.pricePerNight),
          subtotal: Number((raw as any)?.subtotal ?? subtotal),
          serviceFee: Number((raw as any)?.serviceFee ?? serviceFee),
          total: Number((raw as any)?.total ?? total),
          createdAt: String((raw as any)?.createdAt ?? new Date().toISOString()),
        };
        setBookings((prev) => [booking, ...prev]);
        return booking;
      },
    };
  }, [bookings]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
  return ctx;
}
