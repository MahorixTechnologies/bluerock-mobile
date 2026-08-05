import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/lib/api-client';
import {
  createFakeBooking as makeFakeBooking,
  makeMockBookings,
  makeMockOwnerBookings,
  type OwnerBooking,
} from '@/lib/mock-bookings';
import type { Booking, Listing } from '@/lib/models';
import {
  confirmPayment,
  createPaymentIntent,
  getReceiptForBooking,
  issueRefund,
  updateBookingPaymentStatus,
} from '@/lib/payments';
import { useAuth } from '@/providers/AuthProvider';

type BookingDecision = 'APPROVE' | 'REJECT';

type CreateFakeBookingOptions = {
  listingId?: string;
  startOffsetDays?: number;
  nights?: number;
  status?: Booking['status'];
  paymentStatus?: Booking['paymentStatus'];
};

type BookingContextValue = {
  bookings: Booking[];
  ownerBookings: OwnerBooking[];
  createBooking: (params: {
    listing: Listing;
    startDate: string;
    endDate: string;
    nights: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  }) => Promise<Booking>;
  createFakeBooking: (opts?: CreateFakeBookingOptions) => Booking | null;
  payBooking: (bookingId: string) => Promise<void>;
  refundBooking: (bookingId: string, reason: string) => Promise<void>;
  decideBooking: (bookingId: string, decision: BookingDecision) => Promise<void>;
  decideBusy: Record<string, boolean>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<OwnerBooking[]>([]);
  const [decideBusy, setDecideBusy] = useState<Record<string, boolean>>({});
  const { status, profile } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (status !== 'signedIn' || !profile) {
        setBookings([]);
        return;
      }
      if (!process.env.EXPO_PUBLIC_API_URL) {
        if (profile.role === 'LANDLORD' || profile.role === 'RENTER' || profile.role === 'ADMIN') {
          setBookings(makeMockBookings());
        } else {
          setBookings([]);
        }
        return;
      }
      try {
        const raw = await apiFetch('/bookings/me');
        if (cancelled) return;
        const items = Array.isArray(raw) ? (raw as any[]) : [];
        const now = new Date();
        const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const mapped: Booking[] = items.map((b) => {
          const listing = (b as any)?.listing ?? {};
          const startDate = String((b as any)?.startDate ?? '');
          const startDt = startDate
            ? new Date(Date.UTC(
                Number(startDate.slice(0, 4)),
                Number(startDate.slice(5, 7)) - 1,
                Number(startDate.slice(8, 10)),
              ))
            : null;
          const isFuture = startDt ? startDt.getTime() >= todayUtc : true;
          const rawStatus = (b as any)?.status as Booking['status'] | undefined;
          const rawPaymentStatus = (b as any)?.paymentStatus as Booking['paymentStatus'] | undefined;
          return {
            id: String((b as any)?.id ?? ''),
            listingId: String((b as any)?.listingId ?? (listing as any)?.id ?? ''),
            listingTitle: String((listing as any)?.title ?? ''),
            location: String((listing as any)?.location ?? ''),
            currency: (listing as any)?.currency === 'USD' ? 'USD' : 'NGN',
            startDate,
            endDate: String((b as any)?.endDate ?? ''),
            nights: Number((b as any)?.nights ?? 0),
            pricePerNight: Number((listing as any)?.pricePerNight ?? 0),
            subtotal: Number((b as any)?.subtotal ?? 0),
            serviceFee: Number((b as any)?.serviceFee ?? 0),
            total: Number((b as any)?.total ?? 0),
            createdAt: String((b as any)?.createdAt ?? ''),
            status: rawStatus ?? (isFuture ? 'PENDING' : 'COMPLETED'),
            paymentStatus: rawPaymentStatus ?? 'PAID',
            receiptId: (b as any)?.receiptId as string | undefined,
            refundId: (b as any)?.refundId as string | undefined,
          };
        });
        setBookings(mapped.length ? mapped : makeMockBookings());
      } catch {
        setBookings(makeMockBookings());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (status !== 'signedIn' || !profile || profile.role !== 'LANDLORD') {
        setOwnerBookings([]);
        return;
      }
      if (!process.env.EXPO_PUBLIC_API_URL) {
        setOwnerBookings(makeMockOwnerBookings());
        return;
      }
      try {
        const raw = await apiFetch('/bookings/owner');
        if (cancelled) return;
        setOwnerBookings(Array.isArray(raw) ? (raw as OwnerBooking[]) : []);
      } catch {
        setOwnerBookings(makeMockOwnerBookings());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, status]);

  const value = useMemo<BookingContextValue>(() => {
    return {
      bookings,
      ownerBookings,
      decideBusy,
      createFakeBooking: (opts) => {
        const result = makeFakeBooking({
          ...opts,
          role: profile?.role === 'LANDLORD' ? 'LANDLORD' : 'RENTER',
        });
        if (!result) return null;
        setBookings((prev) => [result.booking, ...prev]);
        const ob = result.ownerBooking;
        if (ob) {
          setOwnerBookings((prev) => [ob, ...prev]);
        }
        return result.booking;
      },
      createBooking: async ({ listing, startDate, endDate, nights, subtotal, serviceFee, total }) => {
        if (!process.env.EXPO_PUBLIC_API_URL) {
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
            status: 'PENDING',
            paymentStatus: 'UNPAID',
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
          status: ((raw as any)?.status as Booking['status']) ?? 'PENDING',
          paymentStatus: ((raw as any)?.paymentStatus as Booking['paymentStatus']) ?? 'UNPAID',
          receiptId: (raw as any)?.receiptId,
          refundId: (raw as any)?.refundId,
        };
        setBookings((prev) => [booking, ...prev]);
        return booking;
      },
      payBooking: async (bookingId: string) => {
        const booking = bookings.find((b) => b.id === bookingId);
        if (!booking) return;
        const intent = createPaymentIntent(booking);
        const { receipt } = confirmPayment(intent.id, 'Card');
        const newOwnerStatus: Booking['status'] = 'CONFIRMED';
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id !== bookingId) return b;
            const updated = updateBookingPaymentStatus(b, 'PAID', newOwnerStatus);
            updated.receiptId = receipt.id;
            return updated;
          }),
        );
        setOwnerBookings((prev) =>
          prev.map((ob) => {
            if (ob.id !== bookingId) return ob;
            return { ...ob, paymentStatus: 'PAID', status: 'CONFIRMED' as const };
          }),
        );
      },
      refundBooking: async (bookingId: string, reason: string) => {
        const booking = bookings.find((b) => b.id === bookingId);
        if (!booking) return;
        const existingReceipt = getReceiptForBooking(bookingId);
        if (!existingReceipt) {
          const intent = createPaymentIntent(booking);
          confirmPayment(intent.id, 'Card');
        }
        const refund = issueRefund(bookingId, reason);
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id !== bookingId) return b;
            const updated = updateBookingPaymentStatus(b, 'REFUNDED', b.status);
            updated.refundId = refund.id;
            return updated;
          }),
        );
        setOwnerBookings((prev) =>
          prev.map((ob) => {
            if (ob.id !== bookingId) return ob;
            return { ...ob, paymentStatus: 'REFUNDED' };
          }),
        );
      },
      decideBooking: async (bookingId: string, decision: BookingDecision) => {
        setDecideBusy((prev) => ({ ...prev, [bookingId]: true }));
        try {
          const nextStatus: Booking['status'] = decision === 'APPROVE' ? 'CONFIRMED' : 'REJECTED';
          if (process.env.EXPO_PUBLIC_API_URL) {
            try {
              await apiFetch(`/bookings/${bookingId}/decision`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision: decision === 'APPROVE' ? 'ACCEPT' : 'REJECT' }),
              });
            } catch {}
          }
          setBookings((prev) =>
            prev.map((b) => {
              if (b.id !== bookingId) return b;
              return { ...b, status: nextStatus };
            }),
          );
          setOwnerBookings((prev) =>
            prev.map((ob) => {
              if (ob.id !== bookingId) return ob;
              return { ...ob, status: nextStatus };
            }),
          );
        } finally {
          setDecideBusy((prev) => {
            const next = { ...prev };
            delete next[bookingId];
            return next;
          });
        }
      },
    };
  }, [bookings, ownerBookings, decideBusy]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used inside BookingProvider');
  return ctx;
}
