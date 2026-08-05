import { useAppTheme } from '@/hooks/useAppTheme';
import { formatMoney } from '@/lib/format';
import type { Listing } from '@/lib/models';
import {
  ListingStatusTag,
  resolveListingStatus,
  type ListingStatus,
} from '@/components/ListingStatusTag';
import { Href, Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const CARD_RADIUS = 28;
const IMAGE_CURVE_OVERLAP = 22;

type ListingCardProps = {
  item: Listing;
  href: Href;
  variant?: 'featured' | 'list';
  /** Footer actions: save (heart) for renters, manage (edit + tenants) for landlords. */
  actions?: 'save' | 'manage';
  onEdit?: () => void;
  onManage?: () => void;
};

function HeartButton({
  tintColor,
  overlay = false,
}: {
  tintColor: string;
  overlay?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <Pressable
      hitSlop={8}
      onPress={(e) => {
        e.stopPropagation?.();
        setSaved((v) => !v);
      }}
      style={({ pressed }) => [
        overlay ? styles.heartOverlay : null,
        overlay
          ? {
              backgroundColor: 'rgba(17,24,39,0.50)',
              opacity: pressed ? 0.85 : 1,
            }
          : { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <SymbolView
        name={
          {
            ios: saved ? 'heart.fill' : 'heart',
            android: 'favorite',
            web: 'favorite',
          } as any
        }
        size={overlay ? 16 : 22}
        tintColor={saved ? '#ef4444' : tintColor}
        weight={overlay ? 'semibold' : 'regular'}
      />
    </Pressable>
  );
}

function ManageActions({
  tintColor,
  onEdit,
  onManage,
}: {
  tintColor: string;
  onEdit?: () => void;
  onManage?: () => void;
}) {
  return (
    <View style={styles.actionRow}>
      <Pressable
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation?.();
          onEdit?.();
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <SymbolView
          name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' } as any}
          size={22}
          tintColor={tintColor}
          weight="regular"
        />
      </Pressable>
      <Pressable
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation?.();
          onManage?.();
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <SymbolView
          name={{ ios: 'person.2', android: 'group', web: 'group' } as any}
          size={22}
          tintColor={tintColor}
          weight="regular"
        />
      </Pressable>
    </View>
  );
}

function RatingBadge({
  rating,
  dark = false,
}: {
  rating: number;
  dark?: boolean;
}) {
  return (
    <View
      style={[
        styles.ratingBadge,
        {
          backgroundColor: dark
            ? 'rgba(17,24,39,0.55)'
            : 'rgba(255,255,255,0.96)',
          borderWidth: dark ? 0 : 1,
          borderColor: dark ? 'transparent' : 'rgba(15,23,42,0.06)',
        },
      ]}
    >
      <SymbolView
        name={{ ios: 'star.fill', android: 'star', web: 'star' } as any}
        size={12}
        tintColor={dark ? '#fbbf24' : '#d97706'}
        weight="semibold"
      />
      <Text
        style={[styles.ratingText, { color: dark ? '#ffffff' : '#111827' }]}
      >
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export function ListingCard({
  item,
  href,
  variant = 'featured',
  actions = 'save',
  onEdit,
  onManage,
}: ListingCardProps) {
  const { palette, isDark } = useAppTheme();
  const imageUri = item.images[0];
  const isFeatured = variant === 'featured';

  const rating = useMemo(() => {
    const seed =
      Number(item.id.replace(/\D/g, '').slice(0, 4)) || item.id.length * 17;
    return 4.2 + (seed % 80) / 100;
  }, [item.id]);

  const listingStatus: ListingStatus = resolveListingStatus(item);

  const promoBadge = item.featured
    ? {
        bg: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(16,185,129,0.12)',
        text: isDark ? '#fcd34d' : '#047857',
        label: 'Featured' as const,
      }
    : {
        bg: isDark ? 'rgba(59,130,246,0.20)' : 'rgba(37,99,235,0.10)',
        text: isDark ? '#93c5fd' : '#1d4ed8',
        label: item.type,
      };

  if (isFeatured) {
    return (
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.featuredCard,
            { opacity: pressed ? 0.96 : 1 },
          ]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.featuredImage} />
          ) : (
            <View style={[styles.featuredImage, styles.imagePlaceholder]}>
              <SymbolView
                name={{ ios: 'photo', android: 'image', web: 'image' } as any}
                size={36}
                tintColor="#ffffff"
              />
            </View>
          )}
          <View style={styles.scrimTop} />
          <View style={styles.scrimBottom} />

          <View style={styles.featuredTopRow}>
            {item.featured ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: promoBadge.bg },
                ]}
              >
                <Text
                  style={[styles.statusBadgeText, { color: promoBadge.text }]}
                >
                  {promoBadge.label}
                </Text>
              </View>
            ) : (
              <ListingStatusTag
                status={listingStatus}
                palette={palette}
                size="large"
              />
            )}
            <HeartButton tintColor="#ffffff" overlay />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.featuredTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.featuredMetaLine}>
              <Text style={styles.featuredMetaText} numberOfLines={1}>
                {item.location}
                <Text style={styles.metaDot}> • </Text>
                {item.rooms} Bed
                <Text style={styles.metaDot}> • </Text>
                {item.type}
              </Text>
            </View>
            <View style={styles.featuredFooter}>
              <Text style={styles.featuredPrice}>
                {formatMoney(item.pricePerNight, item.currency)}
                <Text style={styles.featuredPriceSuffix}>/night</Text>
              </Text>
              <RatingBadge rating={rating} dark />
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
        ]}
      >
        <View style={styles.listImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.listImage} />
          ) : (
            <View style={[styles.listImage, styles.imagePlaceholder]}>
              <SymbolView
                name={{ ios: 'photo', android: 'image', web: 'image' } as any}
                size={34}
                tintColor="#ffffff"
              />
            </View>
          )}
          <View style={styles.listBadgeWrap}>
            <ListingStatusTag
              status={listingStatus}
              palette={palette}
              size="small"
            />
          </View>
        </View>

        <View
          style={[
            styles.listBody,
            { backgroundColor: palette.card },
          ]}
        >
          <Text
            style={[styles.listTitle, { color: palette.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.listMeta, { color: palette.muted }]}
            numberOfLines={1}
          >
            {item.location}
            <Text style={styles.metaDot}> • </Text>
            {item.rooms} Bed
            <Text style={styles.metaDot}> • </Text>
            {item.type}
          </Text>
          <View style={styles.listFooter}>
            <Text style={[styles.listPrice, { color: palette.text }]}>
              {formatMoney(item.pricePerNight, item.currency)}
              <Text style={[styles.listPriceSuffix, { color: palette.muted }]}>
                /night
              </Text>
            </Text>
            {actions === 'manage' ? (
              <ManageActions
                tintColor={palette.text}
                onEdit={onEdit}
                onManage={onManage}
              />
            ) : (
              <HeartButton tintColor={palette.text} />
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: {
    backgroundColor: '#b9bdc7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrimTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  metaDot: { opacity: 0.55 },
  heartOverlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ratingText: { fontSize: 12, fontWeight: '900', letterSpacing: -0.1 },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.1 },

  featuredCard: {
    width: '100%',
    height: 300,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#d7d7d7',
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 13 },
    elevation: 6,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  featuredTopRow: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    gap: 8,
  },
  featuredTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  featuredMetaLine: {},
  featuredMetaText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    flexShrink: 1,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  featuredPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  featuredPriceSuffix: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
  },

  listCard: {
    flexDirection: 'column',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  listImageWrap: {
    position: 'relative',
    width: '100%',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  listImage: {
    width: '100%',
    height: 196,
    backgroundColor: 'rgba(150,150,150,0.12)',
  },
  listBadgeWrap: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  listStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  listStatusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  listBody: {
    gap: 6,
    marginTop: -IMAGE_CURVE_OVERLAP,
    paddingHorizontal: 18,
    paddingTop: IMAGE_CURVE_OVERLAP + 10,
    paddingBottom: 18,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    zIndex: 1,
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : null),
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  listMeta: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  listPrice: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  listPriceSuffix: { fontSize: 14, fontWeight: '600', letterSpacing: -0.1 },
});
