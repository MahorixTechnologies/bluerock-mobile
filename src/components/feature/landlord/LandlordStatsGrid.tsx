import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { LandlordStats } from './types';

type LandlordStatsGridProps = {
  stats: LandlordStats;
  palette: AppPalette;
};

type StatTileProps = {
  palette: AppPalette;
  iconIos: string;
  iconAndroid: string;
  value: string;
  label: string;
};

function StatTile({ palette, iconIos, iconAndroid, value, label }: StatTileProps) {
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View
        style={[
          styles.iconBubble,
          { backgroundColor: palette.primarySoft },
        ]}
      >
        <SymbolView
          name={{ ios: iconIos, android: iconAndroid, web: iconAndroid } as any}
          size={18}
          tintColor={palette.primary}
          weight="semibold"
        />
      </View>
      <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
    </View>
  );
}

export function LandlordStatsGrid({ stats, palette }: LandlordStatsGridProps) {
  const monthlyFormatted = formatMoney(stats.monthlyRevenue, stats.currency);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatTile
          palette={palette}
          iconIos="building.2"
          iconAndroid="apartment"
          value={String(stats.totalProperties)}
          label="Properties"
        />
        <View style={styles.columnGap} />
        <StatTile
          palette={palette}
          iconIos="key.fill"
          iconAndroid="key"
          value={String(stats.occupied)}
          label="Occupied"
        />
      </View>
      <View style={styles.rowGap} />
      <View style={styles.row}>
        <StatTile
          palette={palette}
          iconIos="door.left.hand.open"
          iconAndroid="meeting-room"
          value={String(stats.vacant)}
          label="Vacant"
        />
        <View style={styles.columnGap} />
        <StatTile
          palette={palette}
          iconIos="wallet.pass.fill"
          iconAndroid="payments"
          value={monthlyFormatted}
          label="This Month"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  rowGap: {
    height: 10,
  },
  columnGap: {
    width: 10,
  },
  tile: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
