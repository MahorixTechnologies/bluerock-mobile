import { Image, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib/format';

import { bookingStatus, prettyDate } from './utils';
import type { BookingItem, BookingPalette } from './types';

type BookingsHighlightCardProps = {
  palette: BookingPalette;
  booking: BookingItem;
  todayUtc: number;
  range: { earliest: Date; latest: Date } | null;
  imageUri?: string;
};

export function BookingsHighlightCard({
  palette,
  booking,
  todayUtc,
  range,
  imageUri,
}: BookingsHighlightCardProps) {
  const status = bookingStatus(booking.endDate, todayUtc);
  const isUpcoming = status === 'Upcoming';

  return (
    <View
      style={[
        styles.highlightCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
      ]}>
      <View style={styles.bannerWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.banner} />
        ) : (
          <View style={[styles.banner, { backgroundColor: palette.primarySoft }]} />
        )}
        <View style={styles.bannerScrim} />
        <View style={styles.bannerTopRow}>
          <Text style={styles.bannerEyebrow}>{isUpcoming ? 'Next stay in line' : 'Latest reservation'}</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{status}</Text>
          </View>
        </View>
        <View style={styles.bannerBottom}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {booking.listingTitle}
          </Text>
          <Text style={styles.bannerMeta} numberOfLines={1}>
            {booking.location} · {prettyDate(booking.startDate)} - {prettyDate(booking.endDate)} · {booking.nights}{' '}
            nights
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metricsRow}>
          <View style={[styles.metricTile, { backgroundColor: palette.soft }]}>
            <Text style={[styles.metricLabel, { color: palette.muted }]}>Reservation total</Text>
            <Text style={[styles.metricValue, { color: palette.text }]}>
              {formatMoney(booking.total, booking.currency)}
            </Text>
          </View>
          <View style={[styles.metricTile, { backgroundColor: palette.soft }]}>
            <Text style={[styles.metricLabel, { color: palette.muted }]}>Nightly rate</Text>
            <Text style={[styles.metricValue, { color: palette.text }]}>
              {formatMoney(booking.pricePerNight, booking.currency)}
            </Text>
          </View>
        </View>

        {range ? (
          <View style={[styles.rangeStrip, { backgroundColor: palette.soft }]}>
            <Text style={[styles.rangeText, { color: palette.muted }]}>
              Travel window: {prettyDate(range.earliest.toISOString().slice(0, 10))} to{' '}
              {prettyDate(range.latest.toISOString().slice(0, 10))}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  highlightCard: {
    borderRadius: 24,
    borderWidth: 1,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  bannerWrap: {
    width: '100%',
    height: 172,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  banner: { width: '100%', height: '100%' },
  bannerScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  bannerTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.88)',
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  pillText: { fontSize: 11, fontWeight: '800', color: '#111827' },
  bannerBottom: { position: 'absolute', left: 18, right: 18, bottom: 16, gap: 4 },
  bannerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3, lineHeight: 26, color: '#ffffff' },
  bannerMeta: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.88)' },
  body: { padding: 20, gap: 12 },
  metricsRow: { flexDirection: 'row', gap: 12 },
  metricTile: { flex: 1, borderRadius: 18, padding: 14, gap: 8 },
  metricLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  metricValue: { fontSize: 15, fontWeight: '900', lineHeight: 20 },
  rangeStrip: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  rangeText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
});
