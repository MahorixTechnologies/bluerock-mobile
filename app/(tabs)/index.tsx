import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LandlordDashboard } from '@/components/landlord/LandlordDashboard';
import { ListingCard } from '@/components/ListingCard';
import { HomeFilterChips } from '@/components/home/HomeFilterChips';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useListings } from '@/hooks/useListings';
import type { Listing } from '@/lib/models';
import { mockListings } from '@/lib/mock-data';
import { useAuth } from '@/providers/AuthProvider';

type Category = 'All listings' | 'Featured' | 'New this week';

const CATEGORIES: Category[] = ['All listings', 'Featured', 'New this week'];
const ALL_LOCATIONS = 'All locations';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(listing: Listing): boolean {
  if (!listing.createdAt) return false;
  const created = new Date(listing.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= ONE_WEEK_MS;
}

function cityOf(location: string): string {
  const segments = location.split(',');
  return segments[segments.length - 1]?.trim() || location.trim();
}

export default function ListingsScreen() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const isLandlord = profile?.role === 'LANDLORD';

  const { data: listings = [], isLoading, refetch, isRefetching } = useListings();
  const [category, setCategory] = useState<Category>('All listings');
  const [location, setLocation] = useState<string>(ALL_LOCATIONS);

  const listingFeed = listings.length ? listings : mockListings;

  const locationChips = useMemo(() => {
    const cities = new Set(listingFeed.map((item) => cityOf(item.location)).filter(Boolean));
    return [ALL_LOCATIONS, ...Array.from(cities).sort()];
  }, [listingFeed]);

  const filtered = useMemo(() => {
    let result = listingFeed;
    if (category === 'Featured') result = result.filter((item) => item.featured);
    if (category === 'New this week') result = result.filter(isNew);
    if (location !== ALL_LOCATIONS) {
      result = result.filter((item) => cityOf(item.location) === location);
    }
    return result;
  }, [listingFeed, category, location]);

  if (isLandlord) {
    return <LandlordDashboard />;
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.muted}
            colors={[palette.primary]}
          />
        }>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.text }]}>Home</Text>
          <Link href={'/(tabs)/search' as Href} asChild>
            <Pressable
              hitSlop={10}
              style={({ pressed }) => [
                styles.searchButton,
                { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.7 : 1 },
              ]}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
                size={18}
                tintColor={palette.text}
                weight="semibold"
              />
            </Pressable>
          </Link>
        </View>

        <HomeFilterChips
          chips={CATEGORIES}
          selected={category}
          onSelect={(chip) => setCategory(chip as Category)}
          palette={palette}
        />

        <HomeFilterChips
          chips={locationChips}
          selected={location}
          onSelect={(chip) => setLocation(chip)}
          palette={palette}
        />

        {filtered.length ? (
          <View style={styles.list}>
            {filtered.map((item) => (
              <View key={item.id} style={styles.cardWrap}>
                <ListingCard
                  item={item}
                  href={`/modal?mode=listing&id=${item.id}` as Href}
                  variant="list"
                />
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[styles.emptyState, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              {isLoading ? 'Loading listings…' : 'No listings match these filters'}
            </Text>
            <Text style={[styles.emptyText, { color: palette.muted }]}>
              Try a different category or location.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, gap: 20 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 26, fontWeight: '800' },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    columnGap: 12,
  },
  cardWrap: { width: '48%' },
  emptyState: {
    borderRadius: 24,
    padding: 22,
    gap: 8,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 17, fontWeight: '900' },
  emptyText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
