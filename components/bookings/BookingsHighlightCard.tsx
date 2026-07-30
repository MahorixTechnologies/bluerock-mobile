import { StyleSheet, Text, View } from 'react-native';

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
          <Text style={[styles.sectionEyebrow, { color: palette.muted }]}>Latest reservation</Text>
          <Text style={[styles.highlightTitle, { color: palette.text }]} numberOfLines={1}>
            {booking.listingTitle}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.pillText, { color: palette.primary }]}>
            {bookingStatus(booking.endDate, todayUtc)}
          </Text>
        </View>
      </View>

      <Text style={[styles.highlightMeta, { color: palette.muted }]} numberOfLines={1}>
        {booking.location}
      </Text>
      <Text style={[styles.highlightMeta, { color: palette.muted }]}>
        {prettyDate(booking.startDate)} - {prettyDate(booking.endDate)} · {booking.nights} nights
      </Text>

      {range ? (
        <View style={[styles.rangeStrip, { backgroundColor: palette.soft }]}>
          <Text style={[styles.rangeText, { color: palette.muted }]}>
            Travel window: {prettyDate(range.earliest.toISOString())} to {prettyDate(range.latest.toISOString())}
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
    padding: 16,
    gap: 8,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  highlightTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  sectionEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  highlightTitle: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  highlightMeta: { fontSize: 13, lineHeight: 18 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '800' },
  rangeStrip: { marginTop: 4, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  rangeText: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
});
