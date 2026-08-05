import { StyleSheet, Text, View } from 'react-native';

import type { BookingPalette } from './types';

type BookingsSectionHeaderProps = {
  palette: BookingPalette;
  title: string;
  subtitle: string;
  count: number;
};

export function BookingsSectionHeader({
  palette,
  title,
  subtitle,
  count,
}: BookingsSectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copyWrap}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
      </View>
      <View style={[styles.countBubble, { backgroundColor: palette.primarySoft }]}>
        <Text style={[styles.countText, { color: palette.primary }]}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  copyWrap: { flex: 1, gap: 6 },
  title: { fontSize: 18, fontWeight: '900', lineHeight: 24 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  countBubble: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  countText: { fontSize: 13, fontWeight: '900' },
});
