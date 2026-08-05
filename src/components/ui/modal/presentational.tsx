import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type PaletteLike = {
  bg: string;
  text: string;
  muted: string;
  border: string;
  card: string;
  shadow: string;
  soft: string;
  success: string;
  warning: string;
  primary: string;
  primarySoft: string;
};

export function Eyebrow(props: {
  palette: PaletteLike;
  color: string;
  children: React.ReactNode;
}) {
  const { palette, color, children } = props;
  return (
    <Text
      style={{
        color,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.8,
        backgroundColor: palette.soft,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}>
      {children}
    </Text>
  );
}

export function Card(props: {
  palette: PaletteLike;
  children: React.ReactNode;
}) {
  const { palette, children } = props;
  return (
    <View
      style={[
        cardStyles.card,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}>
      {children}
    </View>
  );
}

export function Row2(props: {
  palette: PaletteLike;
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
}) {
  const { palette, label, value, strong, mono } = props;
  return (
    <View style={cardStyles.row2}>
      <Text style={[cardStyles.rowLabel, { color: palette.muted }]}>{label}</Text>
      <Text
        style={[
          cardStyles.rowValue,
          {
            color: palette.text,
            fontWeight: strong ? '900' : '600',
            fontFamily: mono ? 'SpaceMono' : undefined,
          },
        ]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  title: { fontSize: 17, fontWeight: '800', lineHeight: 22 },
  meta: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#00000010', marginVertical: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  row2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  rowValue: { fontSize: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  priceLabel: { fontSize: 12, fontWeight: '700' },
  priceValue: { fontSize: 22, fontWeight: '900' },
  timelineRow: { flexDirection: 'row', gap: 10 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, marginTop: 3 },
  timelineRail: { width: 2, marginTop: 4, flex: 1, minHeight: 14 },
  timelineLabel: { fontSize: 14, fontWeight: '800' },
  timelineMeta: { fontSize: 12, marginTop: 2 },
});

export const welcomeStyles = StyleSheet.create({
  iconWrap: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 300 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
