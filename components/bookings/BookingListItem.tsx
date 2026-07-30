import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib/format';

import type { BookingItem, BookingPalette } from './types';
import { bookingStatus, prettyDate } from './utils';

type BookingListItemProps = {
  item: BookingItem;
  palette: BookingPalette;
  todayUtc: number;
};

export function BookingListItem({ item, palette, todayUtc }: BookingListItemProps) {
  const upcoming = bookingStatus(item.endDate, todayUtc) === 'Upcoming';
  const badgeBg = upcoming ? palette.successSoft : palette.soft;
  const badgeColor = upcoming ? palette.success : palette.muted;

  return (
    <Link href={`/listing/${item.listingId}` as Href} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            shadowColor: palette.shadow,
            opacity: pressed ? 0.96 : 1,
          },
        ]}>
        <View style={styles.bookingCardTop}>
          <View style={[styles.bookingIconBubble, { backgroundColor: palette.primarySoft }]}>
            <SymbolView
              name={{ ios: 'bed.double.fill', android: 'hotel', web: 'hotel' } as any}
              size={18}
              tintColor={palette.primary}
            />
          </View>
          <View style={styles.bookingTitleWrap}>
            <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
              {item.listingTitle || 'Listing'}
            </Text>
            <Text style={[styles.cardSubtitle, { color: palette.muted }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{upcoming ? 'Upcoming' : 'Completed'}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={[styles.infoTile, { backgroundColor: palette.soft }]}>
            <Text style={[styles.infoLabel, { color: palette.muted }]}>Stay</Text>
            <Text style={[styles.infoValue, { color: palette.text }]}>
              {prettyDate(item.startDate)} - {prettyDate(item.endDate)}
            </Text>
          </View>
          <View style={[styles.infoTile, { backgroundColor: palette.soft }]}>
            <Text style={[styles.infoLabel, { color: palette.muted }]}>Cost</Text>
            <Text style={[styles.infoValue, { color: palette.text }]}>{formatMoney(item.total, item.currency)}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <SymbolView
              name={{ ios: 'moon.stars.fill', android: 'hotel', web: 'hotel' } as any}
              size={13}
              tintColor={palette.muted}
            />
            <Text style={[styles.meta, { color: palette.muted }]}>{item.nights} nights</Text>
          </View>
          <View style={styles.metaChip}>
            <SymbolView
              name={{ ios: 'creditcard.fill', android: 'payments', web: 'payments' } as any}
              size={13}
              tintColor={palette.muted}
            />
            <Text style={[styles.meta, { color: palette.muted }]}>Fee {formatMoney(item.serviceFee, item.currency)}</Text>
          </View>
        </View>

        <View style={[styles.footerRow, { borderTopColor: palette.border }]}>
          <View>
            <Text style={[styles.totalLabel, { color: palette.muted }]}>Tap to view property</Text>
            <Text style={[styles.total, { color: palette.text }]}>Open listing</Text>
          </View>
          <SymbolView
            name={{ ios: 'arrow.right.circle.fill', android: 'arrow_forward', web: 'arrow_forward' } as any}
            size={22}
            tintColor={palette.primary}
          />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    margin: 12,
    gap: 16,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  bookingCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookingIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingTitleWrap: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoTile: { flex: 1, borderRadius: 18, padding: 12, gap: 6 },
  infoLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '800', lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 12, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 13, fontWeight: '600' },
  total: { fontSize: 16, fontWeight: '900' },
});
