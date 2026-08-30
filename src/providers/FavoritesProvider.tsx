import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getItem, setItem } from '@/lib/storage';

const FAVORITES_KEY = 'bluerock.favorites.v1';

type FavoritesContextValue = {
  favoriteIds: string[];
  ready: boolean;
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await getItem(FAVORITES_KEY);
      if (cancelled) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setFavoriteIds(parsed.filter((id): id is string => typeof id === 'string'));
          }
        } catch {
          setFavoriteIds([]);
        }
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      ready,
      isFavorite: (listingId) => favoriteIds.includes(listingId),
      toggleFavorite: (listingId) => {
        setFavoriteIds((prev) => {
          const next = prev.includes(listingId)
            ? prev.filter((id) => id !== listingId)
            : [...prev, listingId];
          void setItem(FAVORITES_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [favoriteIds, ready],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
