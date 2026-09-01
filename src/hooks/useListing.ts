import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import { mapApiListing } from '@/lib/listing-mapper';
import type { Listing } from '@/lib/models';

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Listing | null> => {
      const raw = await apiFetch(`/listings/${id}`);
      return raw ? mapApiListing(raw) : null;
    },
  });
}
