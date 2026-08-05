import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib/format';

import { bookingStatus, prettyDate } from './utils';
import type { BookingItem, BookingPalette } from './types';

type BookingsHighlightCardProps = {
  palette: BookingPalette;
  booking: BookingItem;
  todayUtc: number;
  range: { earliest: Date; latest: Date } | null;
};

export function BookingsHighlightCard({
  palette,
  booking,
  todayUtc,
  range,
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
      <View style={styles.highlightTopRow}>
        <View>
          <Text style={[styles.sectionEyebrow, { color: palette.muted }]}>
            {isUpcoming ? 'Next stay in line' : 'Latest reservation'}
          </Text>
          <Text style={[styles.highlightTitle, { color: palette.text }]} numberOfLines={1}>
            {booking.listingTitle}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.pillText, { color: palette.primary }]}>{status}</Text>
        </View>
      </View>

      <Text style={[styles.highlightMeta, { color: palette.muted }]} numberOfLines={1}>
        {booking.location}
      </Text>
      <Text style={[styles.highlightMeta, { color: palette.muted }]}>
        {prettyDate(booking.startDate)} - {prettyDate(booking.endDate)} · {booking.nights} nights
      </Text>

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
  );
}

const styles = StyleSheet.create({
  highlightCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  highlightTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  sectionEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  highlightTitle: { fontSize: 18, fontWeight: '900', marginTop: 6, lineHeight: 24 },
  highlightMeta: { fontSize: 13, lineHeight: 19 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontSize: 11, fontWeight: '800' },
  metricsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metricTile: { flex: 1, borderRadius: 18, padding: 14, gap: 8 },
  metricLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  metricValue: { fontSize: 15, fontWeight: '900', lineHeight: 20 },
  rangeStrip: { marginTop: 6, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  rangeText: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
});
