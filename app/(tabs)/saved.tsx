import { SymbolView } from 'expo-symbols';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/components/ListingCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useListings } from '@/hooks/useListings';
import { useFavorites } from '@/providers/FavoritesProvider';

export default function SavedScreen() {
  const { palette } = useAppTheme();
  const { favoriteIds, ready } = useFavorites();
  const { data: listings = [], isLoading } = useListings();

  const saved = listings.filter((item) => favoriteIds.includes(item.id));
  const loading = isLoading || !ready;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        data={saved}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: palette.text }]}>Saved</Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>
              Listings you've favorited for later.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <SymbolView
              name={{ ios: 'heart', android: 'favorite_border', web: 'favorite_border' } as any}
              size={28}
              tintColor={palette.muted}
            />
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              {loading ? 'Loading…' : 'No saved listings yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: palette.muted }]}>
              Tap the heart on any listing to save it here.
            </Text>
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
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  titleRow: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 2, fontSize: 14 },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },
});
