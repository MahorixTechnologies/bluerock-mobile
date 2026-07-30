import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';

type HomeSummaryStripProps = {
  palette: AppPalette;
  listingCount: number;
  bookingCount: number;
  emailVerified: boolean;
  isLandlord: boolean;
};

type Stat = {
  value: string;
  label: string;
  ios: string;
  android: string;
  tint: string;
  bubble: string;
};

export function HomeSummaryStrip({
  palette,
  listingCount,
  bookingCount,
  emailVerified,
  isLandlord,
}: HomeSummaryStripProps) {
  const stats: Stat[] = [
    {
      value: String(listingCount),
      label: isLandlord ? 'Live listings' : 'Available stays',
      ios: 'house.fill',
      android: 'home',
      tint: palette.primary,
      bubble: palette.primarySoft,
    },
    {
      value: String(bookingCount),
      label: isLandlord ? 'Requests' : 'Bookings',
      ios: 'calendar',
      android: 'event',
      tint: palette.warning,
      bubble: palette.warningSoft,
    },
    {
      value: emailVerified ? 'Yes' : 'No',
      label: 'Verified',
      ios: emailVerified ? 'checkmark.seal.fill' : 'exclamationmark.circle.fill',
      android: emailVerified ? 'verified' : 'error',
      tint: emailVerified ? palette.success : palette.muted,
      bubble: emailVerified ? palette.successSoft : palette.soft,
    },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
          ]}>
          <View style={[styles.bubble, { backgroundColor: stat.bubble }]}>
            <SymbolView
              name={{ ios: stat.ios, android: stat.android, web: stat.android } as any}
              size={15}
              tintColor={stat.tint}
              weight="medium"
            />
          </View>
          <Text style={[styles.value, { color: palette.text }]}>{stat.value}</Text>
          <Text style={[styles.label, { color: palette.muted }]} numberOfLines={1}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 6,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  bubble: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 19, fontWeight: '800', marginTop: 2 },
  label: { fontSize: 12, fontWeight: '600' },
});
