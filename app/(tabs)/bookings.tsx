import { Link, Redirect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { BookingListItem } from '@/components/bookings/BookingListItem';
import { BookingsEmptyState } from '@/components/bookings/BookingsEmptyState';
import { BookingsHeader } from '@/components/bookings/BookingsHeader';
import { BookingsHighlightCard } from '@/components/bookings/BookingsHighlightCard';
import { BookingsSectionHeader } from '@/components/bookings/BookingsSectionHeader';
import { summaryRange } from '@/components/bookings/utils';
import type { Booking } from '@/lib/models';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';
import { useListings } from '@/hooks/useListings';

type BookingSection = {
  key: string;
  title: string;
  subtitle: string;
  data: Booking[];
};

export default function BookingsScreen() {
  const { palette } = useAppTheme();
  const { status, profile } = useAuth();
  const { bookings, createFakeBooking } = useBookings();
  const { data: listings = [] } = useListings();
  const listingImages = Object.fromEntries(
    listings.map((listing) => [listing.id, listing.images[0]]),
  ) as Record<string, string | undefined>;

  if (profile?.role === 'LANDLORD') {
    return <Redirect href="/(tabs)/host-bookings" />;
  }

  if (status !== 'signedIn') {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={[styles.signedOutCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
          <View style={[styles.signedOutBadge, { backgroundColor: palette.primarySoft }]}>
            <Text style={[styles.signedOutBadgeText, { color: palette.primary }]}>Bookings</Text>
          </View>
          <Text style={[styles.title, { color: palette.text }]}>Your reservations live here</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Log in to view upcoming stays, completed reservations, and your travel spending at a glance.
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
              ]}>
              <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>Log In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  const today = (() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  })();
  const todayUtc = today.getTime();
  const todayIso = today.toISOString().slice(0, 10);
  const upcomingBookings = bookings
    .filter(
      (item) =>
        item.endDate >= todayIso &&
        (item.status === 'CONFIRMED' || item.status === 'PENDING'),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const pastBookings = bookings
    .filter(
      (item) =>
        item.endDate < todayIso ||
        item.status === 'COMPLETED' ||
        item.status === 'REJECTED' ||
        item.status === 'CANCELLED',
    )
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
  const sections: BookingSection[] = [
    {
      key: 'upcoming',
      title: 'Upcoming & Pending',
      subtitle: 'Confirmed stays and requests awaiting host decision or payment.',
      data: upcomingBookings,
    },
    {
      key: 'past',
      title: 'Past stays',
      subtitle: 'Completed, cancelled or rejected reservations.',
      data: pastBookings,
    },
  ].filter((section) => section.data.length > 0);
  const upcomingCount = upcomingBookings.length;
  const totalSpent = bookings.reduce(
    (sum, item) => sum + (item.paymentStatus === 'PAID' ? item.total : 0),
    0,
  );
  const totalNights = bookings.reduce((sum, item) => sum + item.nights, 0);
  const featuredBooking = upcomingBookings[0] ?? bookings[0] ?? null;
  const range = summaryRange(bookings);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <SectionList
        sections={sections}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <BookingsHeader
              palette={palette}
              upcomingCount={upcomingCount}
              totalNights={totalNights}
              totalSpent={totalSpent}
              currency={featuredBooking?.currency ?? 'NGN'}
            />

            {featuredBooking ? (
              <BookingsHighlightCard
                palette={palette}
                booking={featuredBooking}
                todayUtc={todayUtc}
                range={range}
                imageUri={listingImages[featuredBooking.listingId]}
              />
            ) : null}

            <Pressable
              onPress={() => createFakeBooking()}
              style={({ pressed }) => [
                styles.demoButton,
                {
                  backgroundColor: palette.primarySoft,
                  borderColor: palette.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <View style={[styles.demoButtonIcon, { backgroundColor: palette.card }]}>
                <SymbolView
                  name={{ ios: 'plus', android: 'add', web: 'add' } as any}
                  size={16}
                  tintColor={palette.primary}
                  weight="bold"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoButtonTitle, { color: palette.primary }]}>
                  Create Demo Booking
                </Text>
                <Text style={[styles.demoButtonSubtitle, { color: palette.primary }]}>
                  Generates a random upcoming reservation for demo purposes
                </Text>
              </View>
              <SymbolView
                name={{ ios: 'sparkles', android: 'auto-awesome', web: 'auto-awesome' } as any}
                size={18}
                tintColor={palette.primary}
                weight="semibold"
              />
            </Pressable>
          </View>
        }
        ListEmptyComponent={<BookingsEmptyState palette={palette} />}
        renderSectionHeader={({ section }) => (
          <BookingsSectionHeader
            palette={palette}
            title={section.title}
            subtitle={section.subtitle}
            count={section.data.length}
          />
        )}
        renderItem={({ item, index, section }) => (
          <View style={index === section.data.length - 1 ? styles.sectionCardWrap : styles.sectionCardGap}>
            <BookingListItem
              item={item}
              palette={palette}
              imageUri={listingImages[item.listingId]}
            />
          </View>
        )}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  listContent: { paddingTop: 6, paddingBottom: 140 },
  headerWrap: { gap: 18, paddingBottom: 22 },
  sectionCardGap: { marginBottom: 14 },
  sectionCardWrap: { marginBottom: 2 },
  sectionSeparator: { height: 28 },
  signedOutCard: {
    marginTop: 12,
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    gap: 14,
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  signedOutBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 2,
  },
  signedOutBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  title: { fontSize: 26, fontWeight: '900', lineHeight: 32 },
  subtitle: { marginTop: 2, fontSize: 14, lineHeight: 20 },
  primaryButton: {
    marginTop: 4,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  demoButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonTitle: { fontSize: 14, fontWeight: '900', letterSpacing: -0.1 },
  demoButtonSubtitle: { fontSize: 12, fontWeight: '600', opacity: 0.78, marginTop: 1 },
});
