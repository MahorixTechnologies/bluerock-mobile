import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppPalette } from '@/constants/theme';
import { formatPricePerNight } from '@/lib/format';
import type { Listing, PropertyType } from '@/lib/models';

type Props = {
  listing: Listing;
  canMutate: boolean;
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
};

function displayPropertyType(t: PropertyType): string {
  const map: Record<PropertyType, string> = {
    EntireProperty: 'Entire Property',
    Apartment: 'Apartment',
    House: 'House',
    Duplex: 'Duplex',
    Studio: 'Studio',
    SingleRoom: 'Single Room',
    SharedRoom: 'Shared Room',
    Hostel: 'Hostel',
    StudentHousing: 'Student Housing',
    HotelRoom: 'Hotel Room',
    Other: 'Other',
  };
  return map[t];
}

function statusColors(palette: AppPalette, status: Listing['status']) {
  switch (status) {
    case 'APPROVED':
      return { bg: palette.successSoft, fg: palette.success };
    case 'PAUSED':
      return { bg: palette.primarySoft, fg: palette.primary };
    case 'REJECTED':
      return { bg: palette.dangerSoft, fg: palette.danger };
    case 'ARCHIVED':
      return { bg: palette.soft, fg: palette.muted };
    default:
      return { bg: palette.warningSoft, fg: palette.warning };
  }
}

export function HostListingsListItem({ listing, canMutate, onEdit, onDelete }: Props) {
  const { palette } = useAppTheme();
  const sc = statusColors(palette, listing.status);
  const detailHref = `/listing/${listing.id}` as any;

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: palette.muted }]}>{listing.location}</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            {displayPropertyType(listing.type)} · {listing.rooms} rooms · {listing.bathrooms} baths
          </Text>
          <Text style={[styles.priceText, { color: palette.text }]}>
            {formatPricePerNight(listing.pricePerNight, listing.currency)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.fg }]}>{listing.status ?? 'PENDING'}</Text>
          </View>
          <Link href={detailHref} asChild>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <Text style={{ fontWeight: '800', color: palette.primary }}>View</Text>
            </Pressable>
          </Link>
          {canMutate ? (
            <Pressable
              onPress={() => onEdit(listing)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <Text style={{ fontWeight: '800', color: palette.text }}>Edit</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {canMutate ? (
        <Pressable
          onPress={() => onDelete(listing)}
          style={({ pressed }) => [
            styles.deleteButton,
            { borderColor: palette.dangerSoft, opacity: pressed ? 0.8 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
            size={14}
            tintColor={palette.danger}
          />
          <Text style={[styles.deleteButtonText, { color: palette.danger }]}>Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13 },
  meta: { fontSize: 13 },
  priceText: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
  },
  deleteButtonText: { fontWeight: '800', fontSize: 14 },
});
