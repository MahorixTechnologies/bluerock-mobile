import { useGlobalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Alert, Platform, View } from 'react-native';

import { AppBottomSheet } from '@/components/ui/bottom-sheet/AppBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { mockListings } from '@/lib/mock-data';
import type { Listing } from '@/lib/models';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';

import { BookingTabBody } from './BookingTabBody';
import { ListingTabBody } from './ListingTabBody';
import { ModalHeader, headerStyles, resolveTabs } from './ModalHeader';
import { WelcomeTabBody } from './WelcomeTabBody';
import type { ModalMode, NormalizedBooking, TabKey } from './types';
import { normalizeBooking } from './types';

export default function ModalScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const { bookings, decideBooking, payBooking, refundBooking, ownerBookings } = useBookings();
  const sheetRef = useRef<BottomSheetModal>(null);

  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const mode: ModalMode =
    rawMode === 'booking' || rawMode === 'listing' || rawMode === 'welcome' ? rawMode : 'welcome';
  const id = String(rawId ?? '');

  const rawBooking =
    mode === 'booking' && id
      ? bookings.find((b) => b.id === id) ??
        ownerBookings.find((b: { id: string }) => b.id === id) ??
        null
      : null;

  const booking: NormalizedBooking | null = rawBooking ? normalizeBooking(rawBooking) : null;

  const listing =
    mode === 'listing' && id
      ? (mockListings.find((l) => l.id === id) as Listing | undefined) ?? null
      : null;

  const welcomeListing = mockListings.find((l) => l.featured) ?? mockListings[0] ?? null;
  const ownerRole = profile?.role === 'LANDLORD' || profile?.role === 'ADMIN';

  const tabs = resolveTabs(mode);
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  useEffect(() => {
    const id = setTimeout(() => sheetRef.current?.present(), 10);
    return () => clearTimeout(id);
  }, []);

  const onCloseRoute = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const header = (() => {
    switch (mode) {
      case 'booking':
        return {
          title: booking ? booking.listingTitle : 'Reservation details',
          subtitle: booking
            ? `${booking.nights} nights · ${
                booking.startDate && booking.endDate
                  ? require('@/components/bookings/utils').formatBookingDatesCompact(
                      booking.startDate,
                      booking.endDate,
                    )
                  : ''
              }`
            : id
              ? 'Reservation not found locally'
              : 'Demo booking preview',
        };
      case 'listing':
        return {
          title: listing ? listing.title : 'Property details',
          subtitle: listing
            ? listing.location
            : id
              ? 'Property not cached locally'
              : 'Handpicked stay preview',
        };
      case 'welcome':
      default:
        return {
          title: 'Welcome to BlueRock',
          subtitle: 'Find, book, and host — all in one app.',
        };
    }
  })();

  const snapPoints = mode === 'welcome' ? ['55%', '85%'] : mode === 'listing' ? ['65%', '92%'] : ['60%', '92%'];

  return (
    <View style={[styles.root, { backgroundColor: 'transparent' }]}>
      <AppBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        onDismiss={onCloseRoute}
        containerStyle={styles.sheetContainer}
        topInset={Platform.OS === 'ios' ? 60 : 48}
        bottomInset={0}
        android_keyboardInputMode="adjustResize"
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}>
        <>
          <ModalHeader
            mode={mode}
            title={header.title}
            subtitle={header.subtitle}
            onClose={() => sheetRef.current?.dismiss()}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80, gap: 12 }}>
            {mode === 'booking' ? (
              <BookingTabBody
                tab={activeTab}
                booking={booking}
                fallbackId={id}
                palette={palette}
                profileRole={profile?.role ?? 'RENTER'}
                ownerRole={ownerRole}
                onPay={() => {
                  if (!booking) return;
                  Alert.alert('Pay for this booking', 'Choose how to pay.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Paystack',
                      onPress: async () => {
                        await payBooking(booking.id, 'PAYSTACK');
                        Alert.alert('Paid', 'Booking has been marked as paid.');
                      },
                    },
                    {
                      text: 'Flutterwave',
                      onPress: async () => {
                        await payBooking(booking.id, 'FLUTTERWAVE');
                        Alert.alert('Paid', 'Booking has been marked as paid.');
                      },
                    },
                  ]);
                }}
                onDecide={async (decision: 'APPROVE' | 'REJECT') => {
                  if (!booking) return;
                  await decideBooking(booking.id, decision);
                  Alert.alert(
                    decision === 'APPROVE' ? 'Approved' : 'Rejected',
                    `Reservation ${decision === 'APPROVE' ? 'approved' : 'rejected'}.`,
                  );
                }}
                onRefund={async () => {
                  if (!booking) return;
                  Alert.alert(
                    'Request refund',
                    `Refund ${formatMoney(booking.total, booking.currency)}?`,
                    [
                      { style: 'cancel', text: 'Cancel' },
                      {
                        style: 'destructive',
                        text: 'Refund',
                        onPress: () => refundBooking(booking.id, 'Guest requested via modal'),
                      },
                    ],
                  );
                }}
                onClose={() => sheetRef.current?.dismiss()}
              />
            ) : mode === 'listing' ? (
              <ListingTabBody
                tab={activeTab}
                listing={listing}
                fallbackListing={welcomeListing}
                palette={palette}
                onClose={() => sheetRef.current?.dismiss()}
                onOpenFull={(lid) => {
                  sheetRef.current?.dismiss();
                  setTimeout(() => router.replace(`/listing/${lid}` as any), 50);
                }}
                onBook={(lid) => {
                  sheetRef.current?.dismiss();
                  setTimeout(() => router.replace(`/listing/${lid}` as any), 50);
                }}
              />
            ) : (
              <WelcomeTabBody
                tab={activeTab}
                palette={palette}
                featuredListing={welcomeListing}
                onBrowse={() => {
                  sheetRef.current?.dismiss();
                  setTimeout(() => router.replace('/(tabs)'), 50);
                }}
                onLogin={() => {
                  sheetRef.current?.dismiss();
                  setTimeout(() => router.replace('/(auth)/login'), 50);
                }}
              />
            )}
          </View>
        </>
      </AppBottomSheet>

      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
    </View>
  );
}

export { headerStyles };

import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    flex: 1,
  },
});
