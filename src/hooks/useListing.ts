import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import { mapApiListing } from '@/lib/listing-mapper';
import type { Listing } from '@/lib/models';
import { mockListings } from '@/lib/mock-data';

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async (): Promise<Listing | null> => {
      if (process.env.EXPO_PUBLIC_API_URL) {
        try {
          const raw = await apiFetch(`/listings/${id}`);
          if (!raw) return mockListings.find((l) => l.id === id) ?? null;
          return mapApiListing(raw);
        } catch {
          return mockListings.find((l) => l.id === id) ?? null;
        }
      }
      return mockListings.find((l) => l.id === id) ?? null;
    },
  });
}
