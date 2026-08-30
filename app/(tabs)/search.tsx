import { SymbolView } from 'expo-symbols';
import { Href, Link, Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Input, SearchInput } from '@/components/inputs';
import { ListingCard } from '@/components/ListingCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useListings } from '@/hooks/useListings';
import type { PropertyType } from '@/lib/models';
import { useAuth } from '@/providers/AuthProvider';

export default function SearchScreen() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();

  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [type, setType] = useState<PropertyType | ''>('');
  const [query, setQuery] = useState('');

  const parsed = useMemo(() => {
    const min = minPrice.trim().length ? Number(minPrice) : undefined;
    const max = maxPrice.trim().length ? Number(maxPrice) : undefined;
    const r = rooms.trim().length ? Number(rooms) : undefined;
    return {
      minPrice: Number.isFinite(min) ? min : undefined,
      maxPrice: Number.isFinite(max) ? max : undefined,
      rooms: Number.isFinite(r) ? r : undefined,
    };
  }, [maxPrice, minPrice, rooms]);

  const { data: listings = [], isLoading } = useListings({
    q: query,
    location,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    rooms: parsed.rooms,
    type: type || undefined,
  });

  const activeFilters =
    (location.trim() ? 1 : 0) +
    (parsed.minPrice != null ? 1 : 0) +
    (parsed.maxPrice != null ? 1 : 0) +
    (parsed.rooms != null ? 1 : 0) +
    (type ? 1 : 0);

  const clearFilters = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setRooms('');
    setType('');
  };

  if (profile?.role === 'LANDLORD') {
    return <Redirect href="/(tabs)/host-listings" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: palette.text }]}>Search & filter</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Find listings by location, price, and rooms.
          </Text>
        </View>
        <Link href={'/saved-listings' as Href} asChild>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.savedButton,
              { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <SymbolView
              name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' } as any}
              size={18}
              tintColor={palette.danger}
            />
          </Pressable>
        </Link>
      </View>

      <View style={styles.filters}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search by title or location"
        />

        <Input
          value={location}
          onChangeText={setLocation}
          placeholder="Location (e.g. Lekki)"
          leftIcon="mappin.and.ellipse"
        />

        <View style={styles.row}>
          <Input
            containerStyle={styles.inputHalf}
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Min price"
            keyboardType="numeric"
          />
          <Input
            containerStyle={styles.inputHalf}
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Max price"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <Input
            containerStyle={styles.inputHalf}
            value={rooms}
            onChangeText={setRooms}
            placeholder="Min rooms"
            keyboardType="numeric"
          />
          <Pressable
            onPress={() => setType(type === 'House' ? '' : 'House')}
            style={[
              styles.pill,
              { borderColor: palette.border },
              type === 'House' ? { backgroundColor: palette.primarySoft, borderColor: palette.primary } : null,
            ]}>
            <Text style={[styles.pillText, { color: type === 'House' ? palette.primary : palette.text }]}>House</Text>
          </Pressable>
          <Pressable
            onPress={() => setType(type === 'Apartment' ? '' : 'Apartment')}
            style={[
              styles.pill,
              { borderColor: palette.border },
              type === 'Apartment' ? { backgroundColor: palette.primarySoft, borderColor: palette.primary } : null,
            ]}>
            <Text style={[styles.pillText, { color: type === 'Apartment' ? palette.primary : palette.text }]}>
              Apartment
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: palette.muted }]}>
          {isLoading ? 'Searching…' : `${listings.length} ${listings.length === 1 ? 'result' : 'results'}`}
        </Text>
        {activeFilters > 0 ? (
          <Pressable onPress={clearFilters} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.clearText, { color: palette.primary }]}>Clear filters ({activeFilters})</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}
        data={listings}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              {isLoading ? 'Loading…' : 'No results'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: palette.muted }]}>Try adjusting your filters.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard item={item} href={`/listing/${item.id}`} variant="list" />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  savedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 14 },
  filters: { marginTop: 14, gap: 10 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  inputHalf: { flex: 1 },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  pillText: { fontWeight: '800', fontSize: 13 },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resultsCount: { fontSize: 13, fontWeight: '700' },
  clearText: { fontSize: 13, fontWeight: '700' },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 6,
    marginTop: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySubtitle: { fontSize: 13 },
});
