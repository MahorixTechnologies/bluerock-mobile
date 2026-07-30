import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatMoney } from '@/lib/format';
import type { Listing } from '@/lib/models';

type ListingCardProps = {
  item: Listing;
  href: Href;
  variant?: 'featured' | 'list';
};

function HeartButton({ dark = false }: { dark?: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <Pressable
      hitSlop={8}
      onPress={(e) => {
        // Prevent the parent Link from firing when tapping the heart.
        e.stopPropagation?.();
        setSaved((v) => !v);
      }}
      style={({ pressed }) => [
        styles.heart,
        { backgroundColor: dark ? 'rgba(17,24,39,0.42)' : 'rgba(255,255,255,0.92)', opacity: pressed ? 0.85 : 1 },
      ]}>
      <SymbolView
        name={{ ios: saved ? 'heart.fill' : 'heart', android: 'favorite', web: 'favorite' } as any}
        size={16}
        tintColor={saved ? '#ef4444' : dark ? '#ffffff' : '#6b7280'}
        weight="medium"
      />
    </Pressable>
  );
}

function MetaChip({ ios, android, label, color }: { ios: string; android: string; label: string; color: string }) {
  return (
    <View style={styles.metaChip}>
      <SymbolView name={{ ios, android, web: android } as any} size={13} tintColor={color} weight="medium" />
      <Text style={[styles.metaChipText, { color }]}>{label}</Text>
    </View>
  );
}

export function ListingCard({ item, href, variant = 'featured' }: ListingCardProps) {
  const { palette } = useAppTheme();
  const imageUri = item.images[0];
  const isFeatured = variant === 'featured';

  if (isFeatured) {
    return (
      <Link href={href} asChild>
        <Pressable style={({ pressed }) => [styles.featuredCard, { opacity: pressed ? 0.94 : 1 }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.featuredImage} />
          ) : (
            <View style={[styles.featuredImage, styles.imagePlaceholder]}>
              <SymbolView name={{ ios: 'photo', android: 'image', web: 'image' } as any} size={32} tintColor="#ffffff" />
            </View>
          )}
          <View style={styles.scrim} />

          <View style={styles.featuredTopRow}>
            <View style={styles.featuredPillGroup}>
              <View style={styles.typePill}>
                <SymbolView
                  name={{ ios: item.type === 'House' ? 'house.fill' : 'building.2.fill', android: 'home', web: 'home' } as any}
                  size={12}
                  tintColor="#ffffff"
                  weight="semibold"
                />
                <Text style={styles.typePillText}>{item.type}</Text>
              </View>
              {item.featured ? (
                <View style={styles.featuredBadge}>
                  <SymbolView
                    name={{ ios: 'star.fill', android: 'star', web: 'star' } as any}
                    size={11}
                    tintColor="#111827"
                    weight="semibold"
                  />
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
              ) : null}
            </View>
            <HeartButton dark />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.featuredTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.locationRow}>
              <SymbolView
                name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' } as any}
                size={13}
                tintColor="rgba(255,255,255,0.9)"
              />
              <Text style={styles.featuredSubMeta} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            <View style={styles.featuredFooter}>
              <View style={styles.featuredMetaRow}>
                <MetaChip ios="bed.double.fill" android="king-bed" label={`${item.rooms}`} color="#ffffff" />
                <MetaChip ios="shower.fill" android="bathtub" label={`${item.bathrooms}`} color="#ffffff" />
              </View>
              <View style={styles.pricePill}>
                <Text style={styles.pricePillText}>{formatMoney(item.pricePerNight, item.currency)}</Text>
                <Text style={styles.pricePillMeta}> /night</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.listCard,
          {
            opacity: pressed ? 0.96 : 1,
            borderColor: palette.border,
            backgroundColor: palette.card,
            shadowColor: palette.shadow,
          },
        ]}>
        <View style={styles.listImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.listImage} />
          ) : (
            <View style={[styles.listImage, styles.imagePlaceholder]}>
              <SymbolView name={{ ios: 'photo', android: 'image', web: 'image' } as any} size={28} tintColor="#ffffff" />
            </View>
          )}
          <View style={styles.listImageTop}>
            <HeartButton />
          </View>
          <View style={styles.listPricePill}>
            <Text style={styles.listPricePillText}>{formatMoney(item.pricePerNight, item.currency)}</Text>
            <Text style={styles.listPricePillMeta}> /night</Text>
          </View>
        </View>

        <View style={styles.listBody}>
          <Text style={[styles.listTitle, { color: palette.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' } as any}
              size={13}
              tintColor={palette.muted}
            />
            <Text style={[styles.listSubtitle, { color: palette.muted }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={[styles.listMetaRow, { borderTopColor: palette.border }]}>
            <MetaChip ios="bed.double.fill" android="king-bed" label={`${item.rooms} rooms`} color={palette.muted} />
            <MetaChip ios="shower.fill" android="bathtub" label={`${item.bathrooms} baths`} color={palette.muted} />
            <MetaChip
              ios={item.type === 'House' ? 'house.fill' : 'building.2.fill'}
              android="home"
              label={item.type}
              color={palette.muted}
            />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: { backgroundColor: '#b9bdc7', alignItems: 'center', justifyContent: 'center' },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, fontWeight: '700' },
  heart: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Featured
  featuredCard: {
    width: '100%',
    height: 230,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#d7d7d7',
    position: 'relative',
  },
  featuredImage: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 },
  featuredTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17,24,39,0.42)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typePillText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  featuredPillGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featuredBadgeText: { color: '#111827', fontSize: 11, fontWeight: '800' },
  cardContent: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 6 },
  featuredTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  featuredSubMeta: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.92)', flexShrink: 1 },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  featuredMetaRow: { flexDirection: 'row', gap: 14 },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pricePillText: { color: '#111827', fontSize: 14, fontWeight: '900' },
  pricePillMeta: { color: '#6b7280', fontSize: 11, fontWeight: '700' },

  // List
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    gap: 12,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  listImageWrap: { position: 'relative' },
  listImage: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    backgroundColor: 'rgba(150,150,150,0.12)',
  },
  listImageTop: { position: 'absolute', top: 10, right: 10 },
  listPricePill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(17,24,39,0.62)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  listPricePillText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  listPricePillMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
  listBody: { gap: 7, paddingHorizontal: 4, paddingBottom: 4 },
  listTitle: { fontSize: 16, fontWeight: '800' },
  listSubtitle: { fontSize: 13, flexShrink: 1 },
  listMetaRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
});
