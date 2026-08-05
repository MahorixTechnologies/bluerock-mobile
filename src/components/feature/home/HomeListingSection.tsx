import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/components/ListingCard';
import type { AppPalette } from '@/constants/theme';
import type { Listing } from '@/lib/models';

type HomeListingSectionProps = {
  title: string;
  href: Href;
  textColor: string;
  mutedColor: string;
  listings: Listing[];
  isLoading?: boolean;
  palette: AppPalette;
  primaryFeatured?: boolean;
  eyebrow?: string;
};

function SectionHeader({
  title,
  href,
  textColor,
  mutedColor,
  eyebrow,
  palette,
}: {
  title: string;
  href: Href;
  textColor: string;
  mutedColor: string;
  eyebrow?: string;
  palette: AppPalette;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.headerLeft}>
        {eyebrow ? (
          <View style={[styles.eyebrowRow, { backgroundColor: palette.primarySoft }]}>
            <View style={[styles.eyebrowDot, { backgroundColor: palette.primary }]} />
            <Text style={[styles.eyebrowText, { color: palette.primary }]}>{eyebrow}</Text>
          </View>
        ) : null}
        <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      </View>
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.sectionLinkRow,
            { backgroundColor: palette.soft, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={[styles.sectionLink, { color: mutedColor }]}>See all</Text>
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
  eyebrow,
}: HomeListingSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader
        title={title}
        href={href}
        textColor={textColor}
        mutedColor={mutedColor}
        eyebrow={eyebrow}
        palette={palette}
      />

      {listings.length ? (
        primaryFeatured ? (
          <View style={styles.listingsStack}>
            <ListingCard
              item={listings[0]}
              href={`/modal?mode=listing&id=${listings[0].id}` as Href}
            />
            <View style={styles.compactList}>
              {listings.slice(1).map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  href={`/modal?mode=listing&id=${item.id}` as Href}
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
                href={`/modal?mode=listing&id=${item.id}` as Href}
                variant="list"
              />
            ))}
          </View>
        )
      ) : (
        <View style={[styles.emptyState, { backgroundColor: palette.card, borderColor: palette.border }]}>
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
  section: { gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { gap: 6 },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  eyebrowDot: { width: 5, height: 5, borderRadius: 3 },
  eyebrowText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3, lineHeight: 26 },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sectionLink: { fontSize: 13, fontWeight: '700' },
  listingsStack: { gap: 14 },
  compactList: { gap: 12 },
  emptyState: {
    borderRadius: 22,
    padding: 20,
    gap: 8,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 14, lineHeight: 20 },
});
