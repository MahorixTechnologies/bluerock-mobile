import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import { mapApiListing } from '@/lib/listing-mapper';
import type { Listing } from '@/lib/models';
import { mockListings } from '@/lib/mock-data';

export function useHostListings(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  return useQuery({
    queryKey: ['hostListings'],
    enabled,
    queryFn: async (): Promise<Listing[]> => {
      const distribute = (l: Listing, i: number): Listing => ({
        ...l,
        status:
          i === 0 ? 'APPROVED' :
          i === 1 ? 'APPROVED' :
          i === 2 ? 'APPROVED' :
          i === 3 ? 'PAUSED'   :
          i === 4 ? 'PAUSED'   :
          i === 5 ? 'PENDING'  :
          i === 6 ? 'PENDING'  :
          i === 7 ? 'ARCHIVED' :
          i === 8 ? 'REJECTED' :
                     'APPROVED',
      });
      if (process.env.EXPO_PUBLIC_API_URL) {
        try {
          const raw = await apiFetch('/listings/mine');
          return Array.isArray(raw) ? raw.map((l) => mapApiListing(l, 'You')) : [];
        } catch {
          return mockListings.map(distribute);
        }
      }
      return mockListings.map(distribute);
    },
  });
}
