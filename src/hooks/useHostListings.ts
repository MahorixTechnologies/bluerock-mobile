import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import { mapApiListing } from '@/lib/listing-mapper';
import type { Listing } from '@/lib/models';

export function useHostListings(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled ?? true;
  return useQuery({
    queryKey: ['hostListings'],
    enabled,
    queryFn: async (): Promise<Listing[]> => {
      const raw = await apiFetch('/listings/mine');
      return Array.isArray(raw) ? raw.map((l) => mapApiListing(l, 'You')) : [];
    },
  });
}
