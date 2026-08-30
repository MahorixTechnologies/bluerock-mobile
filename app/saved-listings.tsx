import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingCard } from '@/components/common/ListingCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useListings } from '@/hooks/useListings';
import { useFavorites } from '@/providers/FavoritesProvider';

export default function SavedListingsScreen() {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteIds, ready } = useFavorites();
  const { data: listings = [], isLoading } = useListings({});

  const saved = listings.filter((item) => favoriteIds.includes(item.id));
  const loading = isLoading || !ready;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/search'))}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' } as any}
            size={18}
            tintColor={palette.text}
            weight="semibold"
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Saved listings</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        data={saved}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
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
