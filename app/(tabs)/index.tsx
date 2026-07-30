import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HomeFeaturedCarousel } from '@/components/home/HomeFeaturedCarousel';
import { HomeFilterChips } from '@/components/home/HomeFilterChips';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeListingSection } from '@/components/home/HomeListingSection';
import { HomeSummaryStrip } from '@/components/home/HomeSummaryStrip';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useListings } from '@/hooks/useListings';
import { mockListings } from '@/lib/mock-data';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

export default function ListingsScreen() {
  const { palette, isDark } = useAppTheme();
  const { profile } = useAuth();
  const isLandlord = profile?.role === 'LANDLORD';
  const { data: listings = [], isLoading, refetch, isRefetching } = useListings();
  const { bookings } = useBookings();
  const listingFeed = listings.length ? listings : mockListings;

  const nextBooking = (() => {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const upcoming = bookings
      .map((b) => {
        const start = parseDate(b.startDate);
        const end = parseDate(b.endDate);
        return { b, start, end };
      })
      .filter((x) => x.start && x.end && x.end.getTime() >= todayUtc.getTime())
      .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));

    return upcoming[0]?.b ?? null;
  })();

  const greeting =
    profile?.name?.trim().length ? profile.name.trim() : profile?.email?.trim().length ? profile.email.trim() : 'Guest';
  const firstName = greeting.split(' ')[0] || greeting;
  const hour = new Date().getHours();
  const greetingLabel = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const featuredPool = listingFeed.filter((item) => item.featured);
  const featuredListings = isLandlord
    ? listingFeed.slice(0, 4)
    : (featuredPool.length ? featuredPool : listingFeed).slice(0, 5);
  const featuredIds = new Set(featuredListings.map((item) => item.id));
  const secondaryListings = listingFeed.filter((item) => !featuredIds.has(item.id)).slice(0, 4);
  const topSectionTitle = isLandlord ? 'Latest Listings' : 'Featured Homes';
  const lowerSectionTitle = isLandlord ? 'More Properties' : 'More to Explore';
  const avatarInitials = greeting
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const profileSummary = isLandlord
    ? `${listingFeed.length} live spaces`
    : nextBooking
      ? `${nextBooking.nights} nights booked`
      : `${bookings.length} bookings`;
  const categoryChips = [
    isLandlord ? 'All listings' : 'Popular now',
    ...Array.from(new Set(listingFeed.map((item) => item.location.split(',')[0]?.trim()).filter(Boolean))),
  ].slice(0, 5);

  const primaryHref = (isLandlord ? '/(tabs)/host-listings' : '/(tabs)/search') as Href;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.muted}
            colors={[palette.primary]}
          />
        }>
        <HomeHeader
          greetingLabel={greetingLabel}
          greeting={greeting}
          profileSummary={profileSummary}
          avatarInitials={avatarInitials || firstName[0]?.toUpperCase() || 'G'}
          palette={palette}
          isDark={isDark}
        />

        <View style={styles.searchRow}>
          <Link href={'/(tabs)/search' as Href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.searchBar,
                { backgroundColor: palette.search, opacity: pressed ? 0.94 : 1 },
              ]}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
                size={20}
                tintColor={palette.muted}
                weight="regular"
              />
              <Text style={[styles.searchText, { color: palette.muted }]}>Find something now</Text>
            </Pressable>
          </Link>
          <Link href={'/(tabs)/search' as Href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.filterButton,
                { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
              ]}>
              <SymbolView
                name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' } as any}
                size={20}
                tintColor={palette.onPrimary}
                weight="semibold"
              />
            </Pressable>
          </Link>
        </View>

        <HomeSummaryStrip
          palette={palette}
          listingCount={listingFeed.length}
          bookingCount={bookings.length}
          emailVerified={Boolean(profile?.emailVerified)}
          isLandlord={isLandlord}
        />

        <HomeFilterChips chips={categoryChips} palette={palette} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{topSectionTitle}</Text>
            <Link href={primaryHref} asChild>
              <Pressable style={({ pressed }) => [styles.sectionLinkRow, { opacity: pressed ? 0.75 : 1 }]}>
                <Text style={[styles.sectionLink, { color: palette.muted }]}>View all</Text>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' } as any}
                  size={13}
                  tintColor={palette.muted}
                  weight="semibold"
                />
              </Pressable>
            </Link>
          </View>
          {featuredListings.length ? (
            <HomeFeaturedCarousel listings={featuredListings} palette={palette} />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: palette.card }]}>
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                {isLoading ? 'Loading listings…' : 'No listings found'}
              </Text>
              <Text style={[styles.emptyText, { color: palette.muted }]}>
                Once listings are available, they will appear here.
              </Text>
            </View>
          )}
        </View>

        <HomeListingSection
          title={lowerSectionTitle}
          href={primaryHref}
          textColor={palette.text}
          mutedColor={palette.muted}
          listings={secondaryListings}
          palette={palette}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 120, gap: 22 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: {
    flex: 1,
    height: 54,
    borderRadius: 28,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchText: { fontSize: 15, fontWeight: '500' },
  filterButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sectionLink: { fontSize: 15, fontWeight: '500' },
  emptyState: { borderRadius: 22, padding: 18, gap: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptyText: { fontSize: 14, lineHeight: 20 },
});
