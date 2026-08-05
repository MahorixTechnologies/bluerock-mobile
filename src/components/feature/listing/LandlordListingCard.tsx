import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { formatPricePerNight } from '@/lib/format';
import type { Listing, PropertyType } from '@/lib/models';
import { resolveListingStatus } from '@/components/ui/ListingStatusTag';

import {
  hostStatusDisplay,
  hostStatusTone,
  type StatusTone,
} from './listing-status';

type Props = {
  listing: Listing;
  canMutate: boolean;
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
  onTogglePause: (listing: Listing) => void;
  palette: AppPalette;
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

function toneColors(palette: AppPalette, tone: StatusTone) {
  switch (tone) {
    case 'success':
      return { bg: palette.successSoft, fg: palette.success };
    case 'primary':
      return { bg: palette.primarySoft, fg: palette.primary };
    case 'warning':
      return { bg: palette.warningSoft, fg: palette.warning };
    case 'danger':
      return { bg: palette.dangerSoft, fg: palette.danger };
    case 'muted':
      return { bg: palette.soft, fg: palette.muted };
  }
}

function occupancyColors(palette: AppPalette, status: 'Occupied' | 'Vacant' | 'Draft') {
  switch (status) {
    case 'Occupied':
      return { bg: palette.successSoft, fg: palette.success };
    case 'Vacant':
      return { bg: palette.dangerSoft, fg: palette.danger };
    case 'Draft':
      return { bg: palette.soft, fg: palette.muted };
  }
}

export function LandlordListingCard({
  listing,
  canMutate,
  onEdit,
  onDelete,
  onTogglePause,
  palette,
}: Props) {
  const statusTone = hostStatusTone(listing.status);
  const sc = toneColors(palette, statusTone);
  const occupancy = resolveListingStatus(listing);
  const oc = occupancyColors(palette, occupancy);
  const detailHref = `/listing/${listing.id}` as any;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {listing.images[0] ? (
          <Image
            source={{ uri: listing.images[0] }}
            style={styles.thumbnail}
          />
        ) : (
          <View
            style={[
              styles.thumbnail,
              styles.thumbnailFallback,
              { backgroundColor: palette.primarySoft },
            ]}>
            <SymbolView
              name={{
                ios: 'building.2.fill',
                android: 'apartment',
                web: 'apartment',
              } as any}
              size={36}
              tintColor={palette.primary}
            />
          </View>
        )}

        <View style={{ flex: 1, gap: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 8,
            }}>
            <Text
              style={[styles.title, { color: palette.text }]}
              numberOfLines={1}>
              {listing.title}
            </Text>
            <View
              style={[styles.statusPill, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.fg }]}>
                {hostStatusDisplay(listing.status)}
              </Text>
            </View>
          </View>

          <Text style={[styles.location, { color: palette.muted }]} numberOfLines={1}>
            {listing.location}
          </Text>

          <Text style={[styles.meta, { color: palette.muted }]}>
            {displayPropertyType(listing.type)} · {listing.rooms} rooms ·{' '}
            {listing.bathrooms} baths
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 2,
            }}>
            <Text style={[styles.price, { color: palette.primary }]}>
              {formatPricePerNight(listing.pricePerNight, listing.currency)}
            </Text>
            <View
              style={[styles.occupancyPill, { backgroundColor: oc.bg }]}>
              <Text style={[styles.occupancyText, { color: oc.fg }]}>
                {occupancy}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 2,
        }}>
        <Link href={detailHref} asChild>
          <Pressable
            style={({ pressed }) => [
              styles.pillButton,
              styles.pillButtonSoft,
              {
                borderColor: palette.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.pillButtonText, { color: palette.muted }]}>
              Preview
            </Text>
          </Pressable>
        </Link>

        {canMutate ? (
          <Pressable
            onPress={() => onEdit(listing)}
            style={({ pressed }) => [
              styles.pillButton,
              styles.pillButtonSoft,
              {
                borderColor: palette.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.pillButtonText, { color: palette.text }]}>
              Edit
            </Text>
          </Pressable>
        ) : null}

        {canMutate && listing.status === 'APPROVED' ? (
          <Pressable
            onPress={() => onTogglePause(listing)}
            style={({ pressed }) => [
              styles.pillButton,
              styles.pillButtonSoft,
              {
                borderColor: palette.primarySoft,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.pillButtonText, { color: palette.primary }]}>
              Pause
            </Text>
          </Pressable>
        ) : null}

        {canMutate && listing.status === 'PAUSED' ? (
          <Pressable
            onPress={() => onTogglePause(listing)}
            style={({ pressed }) => [
              styles.pillButton,
              {
                backgroundColor: palette.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Text style={[styles.pillButtonText, { color: palette.onPrimary }]}>
              Activate
            </Text>
          </Pressable>
        ) : null}

        {canMutate && listing.status === 'REJECTED' ? (
          <Text
            style={[
              styles.rejectedHint,
              { color: palette.muted },
            ]}
            numberOfLines={1}>
            Fix issues & re-submit
          </Text>
        ) : null}

        {canMutate ? (
          <Pressable
            onPress={() => onDelete(listing)}
            style={({ pressed }) => [
              styles.pillButton,
              styles.pillButtonSoft,
              {
                borderColor: palette.dangerSoft,
                marginLeft: 'auto',
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <SymbolView
              name={{
                ios: 'trash',
                android: 'delete',
                web: 'delete',
              } as any}
              size={14}
              tintColor={palette.danger}
            />
            <Text style={[styles.pillButtonText, { color: palette.danger }]}>
              Delete
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: 16,
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  location: {
    fontSize: 13,
  },
  meta: {
    fontSize: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  occupancyPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  occupancyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  pillButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillButtonSoft: {
    borderWidth: 1,
  },
  pillButtonText: {
    fontWeight: '800',
    fontSize: 13,
  },
  rejectedHint: {
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'center',
    paddingVertical: 8,
  },
});
