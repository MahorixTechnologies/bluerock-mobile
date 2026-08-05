import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { LandlordPropertyItem } from './types';

type LandlordPropertyItemProps = {
  property: LandlordPropertyItem;
  palette: AppPalette;
  onPress: () => void;
};

export function LandlordPropertyItemCard({
  property,
  palette,
  onPress,
}: LandlordPropertyItemProps) {
  const isOccupied = property.status === 'Occupied';
  const isVacant = property.status === 'Vacant';
  const statusBg = isOccupied
    ? palette.successSoft
    : isVacant
      ? palette.dangerSoft
      : palette.warningSoft;
  const statusColor = isOccupied
    ? palette.success
    : isVacant
      ? palette.danger
      : palette.warning;

  const priceFormatted = `${formatMoney(property.pricePerYear, property.currency)}/yr`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: property.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.contentBlock}>
        <Text
          style={[styles.title, { color: palette.text }]}
          numberOfLines={1}
        >
          {property.title}
        </Text>
        <Text style={[styles.location, { color: palette.muted }]}>
          {property.location}
        </Text>
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusBg },
            ]}
          >
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {property.status}
            </Text>
          </View>
          <Text style={[styles.price, { color: palette.text }]}>
            {priceFormatted}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 16,
    flexShrink: 0,
    backgroundColor: '#e5e7eb',
  },
  contentBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
    flexShrink: 0,
  },
});
