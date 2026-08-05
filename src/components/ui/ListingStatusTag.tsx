import { StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';

export type ListingStatus = 'Occupied' | 'Vacant' | 'Draft';

export type ListingStatusTagProps = {
  status: ListingStatus;
  palette: AppPalette;
  /** Larger chip for featured overlay, smaller for list thumbnail. */
  size?: 'large' | 'small';
};

export function ListingStatusTag({
  status,
  palette,
  size = 'small',
}: ListingStatusTagProps) {
  const { bg, textColor } = resolveTone(status, palette);
  const pad =
    size === 'large' ? styles.largePill : styles.smallPill;
  const font =
    size === 'large' ? styles.largeText : styles.smallText;

  return (
    <View style={[styles.pill, pad, { backgroundColor: bg }]}>
      <Text style={[font, { color: textColor }]}>{status}</Text>
    </View>
  );
}

function resolveTone(
  status: ListingStatus,
  palette: AppPalette,
): { bg: string; textColor: string } {
  'worklet';
  switch (status) {
    case 'Occupied':
      return {
        bg: palette.successSoft,
        textColor: palette.success,
      };
    case 'Vacant':
      return {
        bg: palette.dangerSoft,
        textColor: palette.danger,
      };
    case 'Draft':
      return {
        bg: palette.soft,
        textColor: palette.muted,
      };
  }
}

export function resolveListingStatus(item: {
  id: string;
  availabilityNote?: string;
  status?: string;
  occupancyStatus?: ListingStatus;
}): ListingStatus {
  if (item.occupancyStatus) return item.occupancyStatus;
  if (item.status === 'PENDING' || item.status === 'REJECTED') return 'Draft';
  const seed =
    Number(item.id.replace(/\D/g, '').slice(0, 4)) || item.id.length * 17;
  if (seed % 4 === 0) return 'Occupied';
  if (seed % 4 === 1) return 'Draft';
  return 'Vacant';
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largePill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  smallPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  largeText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  smallText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
