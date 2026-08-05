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
  web: string;
  tint: string;
  bubble: string;
  hero?: boolean;
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
      web: 'home',
      tint: palette.primary,
      bubble: palette.primarySoft,
      hero: true,
    },
    {
      value: String(bookingCount),
      label: isLandlord ? 'Requests' : 'Bookings',
      ios: 'calendar',
      android: 'event',
      web: 'event',
      tint: palette.warning,
      bubble: palette.warningSoft,
    },
    {
      value: emailVerified ? 'Verified' : 'Pending',
      label: 'Account',
      ios: emailVerified ? 'checkmark.seal.fill' : 'exclamationmark.circle.fill',
      android: emailVerified ? 'verified' : 'error',
      web: emailVerified ? 'verified' : 'error',
      tint: emailVerified ? palette.success : palette.muted,
      bubble: emailVerified ? palette.successSoft : palette.soft,
    },
  ];

  const hero = stats.find((s) => s.hero)!;
  const side = stats.filter((s) => !s.hero);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            shadowColor: palette.shadow,
          },
        ]}>
        <View style={styles.heroTop}>
          <View style={[styles.heroBubble, { backgroundColor: hero.bubble }]}>
            <SymbolView
              name={{ ios: hero.ios, android: hero.android, web: hero.web } as any}
              size={20}
              tintColor={hero.tint}
              weight="semibold"
            />
          </View>
          <View style={styles.heroTrend}>
            <SymbolView
              name={{ ios: 'arrow.up.forward', android: 'trending-up', web: 'trending-up' } as any}
              size={12}
              tintColor={palette.success}
              weight="semibold"
            />
            <Text style={[styles.heroTrendText, { color: palette.success }]}>+12%</Text>
          </View>
        </View>
        <Text style={[styles.heroValue, { color: palette.text }]}>{hero.value}</Text>
        <Text style={[styles.heroLabel, { color: palette.muted }]}>{hero.label}</Text>
      </View>

      <View style={styles.sideColumn}>
        {side.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.sideCard,
              { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
            ]}>
            <View style={styles.sideInner}>
              <View style={[styles.sideBubble, { backgroundColor: stat.bubble }]}>
                <SymbolView
                  name={{ ios: stat.ios, android: stat.android, web: stat.web } as any}
                  size={16}
                  tintColor={stat.tint}
                  weight="semibold"
                />
              </View>
              <View style={styles.sideText}>
                <Text style={[styles.sideValue, { color: palette.text }]}>{stat.value}</Text>
                <Text style={[styles.sideLabel, { color: palette.muted }]} numberOfLines={1}>
                  {stat.label}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 12 },
  heroCard: {
    flex: 1.25,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 10,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroBubble: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(22,163,74,0.10)',
  },
  heroTrendText: { fontSize: 11, fontWeight: '800' },
  heroValue: { fontSize: 30, fontWeight: '900', letterSpacing: -0.8, lineHeight: 34 },
  heroLabel: { fontSize: 13, fontWeight: '700' },
  sideColumn: { flex: 1, gap: 12 },
  sideCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  sideInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  sideBubble: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sideText: { flex: 1, gap: 2 },
  sideValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  sideLabel: { fontSize: 12, fontWeight: '600' },
});
