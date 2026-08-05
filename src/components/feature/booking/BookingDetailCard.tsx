import { SymbolView } from 'expo-symbols';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import type { Booking } from '@/lib/models';
import type { EnrichedBooking } from '@/hooks/useBooking';

type BookingDetailCardProps = {
  booking: Booking | EnrichedBooking;
  palette: AppPalette;
};

function listingInfo(booking: Booking | EnrichedBooking): {
  imageUrl?: string;
  title: string;
  location: string;
  type?: string;
} {
  const enriched = booking as EnrichedBooking;
  if (enriched.listing) {
    return {
      imageUrl: enriched.listing.imageUrl,
      title: enriched.listing.title,
      location: enriched.listing.location,
      type: enriched.listing.type,
    };
  }
  return {
    title: booking.listingTitle || 'Listing',
    location: booking.location || '',
  };
}

export function BookingDetailCard({ booking, palette }: BookingDetailCardProps) {
  const info = listingInfo(booking);
  const displayTitle = info.title;
  const displayLocation = info.location;
  const displayType = info.type;
  const coverImage = info.imageUrl;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={[styles.photoTile, { borderRadius: 18 }]} />
        ) : (
          <View
            style={[
              styles.photoTile,
              { borderRadius: 18, backgroundColor: palette.primarySoft },
            ]}>
            <SymbolView
              name={{ ios: 'building.2.fill', android: 'apartment', web: 'apartment' } as any}
              size={28}
              tintColor={palette.primary}
            />
          </View>
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.propertyTitle, { color: palette.text }]} numberOfLines={2}>
            {displayTitle}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'place', web: 'place' } as any}
              size={13}
              tintColor={palette.muted}
            />
            <Text style={[styles.locationText, { color: palette.muted }]} numberOfLines={1}>
              {displayLocation}
            </Text>
          </View>
          {displayType ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View style={[styles.typePill, { backgroundColor: palette.soft }]}>
                <Text style={[styles.typePillText, { color: palette.muted }]}>{displayType}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  photoTile: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(200,200,200,0.15)',
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  typePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.15,
    textTransform: 'uppercase',
  },
});
