import { Link, Redirect } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BookingListItem } from '@/components/bookings/BookingListItem';
import { BookingsEmptyState } from '@/components/bookings/BookingsEmptyState';
import { BookingsHeader } from '@/components/bookings/BookingsHeader';
import { BookingsHighlightCard } from '@/components/bookings/BookingsHighlightCard';
import { summaryRange } from '@/components/bookings/utils';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';

export default function BookingsScreen() {
  const { palette } = useAppTheme();
  const { status, profile } = useAuth();
  const { bookings } = useBookings();

  if (profile?.role === 'LANDLORD') {
    return <Redirect href="/(tabs)/host-bookings" />;
  }

  if (status !== 'signedIn') {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <Text style={[styles.title, { color: palette.text }]}>Bookings</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Log in to view your booking history.
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
    );
  }

  const todayUtc = (() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
  })();
  const upcomingCount = bookings.filter((item) => {
    const endDt = new Date(`${item.endDate}T00:00:00.000Z`);
    return !Number.isNaN(endDt.getTime()) && endDt.getTime() >= todayUtc;
  }).length;
  const totalSpent = bookings.reduce((sum, item) => sum + item.total, 0);
  const totalNights = bookings.reduce((sum, item) => sum + item.nights, 0);
  const latestBooking = bookings[0] ?? null;
  const range = summaryRange(bookings);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        data={bookings}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <BookingsHeader
              palette={palette}
              upcomingCount={upcomingCount}
              totalNights={totalNights}
              totalSpent={totalSpent}
              currency={latestBooking?.currency ?? 'NGN'}
            />

            {latestBooking ? (
              <BookingsHighlightCard palette={palette} booking={latestBooking} todayUtc={todayUtc} range={range} />
            ) : null}
          </View>
        }
        ListEmptyComponent={<BookingsEmptyState palette={palette} />}
        renderItem={({ item }) => <BookingListItem item={item} palette={palette} todayUtc={todayUtc} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  listContent: { paddingBottom: 120 },
  listSeparator: { height: 14 },
  headerWrap: { gap: 14, paddingBottom: 14 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 14 },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
});
