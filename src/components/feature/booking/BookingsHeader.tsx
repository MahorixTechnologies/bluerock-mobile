import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib/format';

import type { BookingPalette } from './types';

type BookingsHeaderProps = {
  palette: BookingPalette;
  upcomingCount: number;
  totalNights: number;
  totalSpent: number;
  currency: 'USD' | 'NGN';
};

export function BookingsHeader({
  palette,
  upcomingCount,
  totalNights,
  totalSpent,
  currency,
}: BookingsHeaderProps) {
  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
      ]}>
      <View style={styles.heroTopRow}>
        <View style={[styles.heroBadge, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.heroBadgeText, { color: palette.primary }]}>Booking Dashboard</Text>
        </View>
        <View style={[styles.heroIconBubble, { backgroundColor: palette.primarySoft }]}>
          <SymbolView
            name={{ ios: 'calendar.badge.clock', android: 'event', web: 'event' } as any}
            size={18}
            tintColor={palette.primary}
          />
        </View>
      </View>

      <Text style={[styles.title, { color: palette.text }]}>Your stays, all in one place</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        Review upcoming trips, completed reservations, and your spending summary at a glance.
      </Text>

      <View style={styles.statsRow}>
        {[
          { label: 'Upcoming', value: String(upcomingCount) },
          { label: 'Nights', value: String(totalNights) },
          {
            label: 'Spent',
            value: formatMoney(totalSpent, currency),
          },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.statTile,
              {
                backgroundColor: palette.soft,
                borderColor: palette.border,
              },
            ]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>{item.label}</Text>
            <Text style={[styles.statValue, { color: palette.text }]} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    gap: 18,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  heroBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  heroBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  heroIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '900', lineHeight: 32 },
  subtitle: { marginTop: -4, fontSize: 14, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statTile: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  statLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  statValue: { fontSize: 18, fontWeight: '900', lineHeight: 22 },
});
