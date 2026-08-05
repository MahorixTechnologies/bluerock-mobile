import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import { asRecord, mapApiListing } from '@/lib/listing-mapper';
import type { Listing } from '@/lib/models';
import { mockListings } from '@/lib/mock-data';

export function useListings(params: {
  q?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  rooms?: number;
} = {}) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async (): Promise<Listing[]> => {
      if (process.env.EXPO_PUBLIC_API_URL) {
        try {
          const query = new URLSearchParams();
          if (params.q) query.set('q', params.q);
          if (params.location) query.set('location', params.location);
          if (params.minPrice != null) query.set('minPrice', String(params.minPrice));
          if (params.maxPrice != null) query.set('maxPrice', String(params.maxPrice));
          if (params.type) query.set('type', params.type);
          if (params.rooms != null) query.set('rooms', String(params.rooms));

          const raw = await apiFetch(`/listings${query.toString() ? `?${query.toString()}` : ''}`);
          const data = asRecord(raw);
          const items = Array.isArray(data.items) ? data.items : Array.isArray(raw) ? raw : [];
          const mapped = items.map((item) => mapApiListing(item));
          return mapped.length ? mapped : mockListings;
        } catch {
          return mockListings;
        }
      }
      return mockListings;
    },
    select: (listings) => {
      const q = params.q?.trim().toLowerCase();
      const location = params.location?.trim().toLowerCase();
      const minPrice = params.minPrice;
      const maxPrice = params.maxPrice;
      const type = params.type?.trim();
      const rooms = params.rooms;

      return listings.filter((l) => {
        const matchesQ =
          !q ||
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q);
        const matchesLocation = !location || l.location.toLowerCase().includes(location);
        const matchesType = !type || l.type === type;
        const matchesRooms = !rooms || l.rooms >= rooms;
        const matchesMin = minPrice == null || l.pricePerNight >= minPrice;
        const matchesMax = maxPrice == null || l.pricePerNight <= maxPrice;
        return (
          matchesQ &&
          matchesLocation &&
          matchesType &&
          matchesRooms &&
          matchesMin &&
          matchesMax
        );
      });
    },
  });
}
