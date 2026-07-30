import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/components/ListingCard';
import type { HomePalette } from '@/components/home/types';
import type { Listing } from '@/lib/models';

type HomeListingSectionProps = {
  title: string;
  href: Href;
  textColor: string;
  mutedColor: string;
  listings: Listing[];
  isLoading?: boolean;
  palette: HomePalette;
  primaryFeatured?: boolean;
};

function SectionHeader({
  title,
  href,
  textColor,
  mutedColor,
}: {
  title: string;
  href: Href;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      <Link href={href} asChild>
        <Pressable style={({ pressed }) => [styles.sectionLinkRow, { opacity: pressed ? 0.75 : 1 }]}>
          <Text style={[styles.sectionLink, { color: mutedColor }]}>View all</Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' } as any}
            size={13}
            tintColor={mutedColor}
            weight="semibold"
          />
        </Pressable>
      </Link>
    </View>
  );
}

export function HomeListingSection({
  title,
  href,
  textColor,
  mutedColor,
  listings,
  isLoading = false,
  palette,
  primaryFeatured = false,
}: HomeListingSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} href={href} textColor={textColor} mutedColor={mutedColor} />

      {listings.length ? (
        primaryFeatured ? (
          <View style={styles.listingsStack}>
            <ListingCard item={listings[0]} href={`/listing/${listings[0].id}` as Href} />
            <View style={styles.compactList}>
              {listings.slice(1).map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  href={`/listing/${item.id}` as Href}
                  variant="list"
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.compactList}>
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                href={`/listing/${item.id}` as Href}
                variant="list"
              />
            ))}
          </View>
        )
      ) : (
        <View style={[styles.emptyState, { backgroundColor: palette.card }]}>
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            {isLoading ? 'Loading listings...' : 'No listings found'}
          </Text>
          <Text style={[styles.emptyText, { color: mutedColor }]}>
            Once listings are available, they will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sectionLink: { fontSize: 15, fontWeight: '500' },
  listingsStack: { gap: 14 },
  compactList: { gap: 14 },
  emptyState: {
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyText: { fontSize: 14, lineHeight: 20 },
});
