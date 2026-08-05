import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LandlordDashboard } from '@/components/landlord/LandlordDashboard';
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

  if (isLandlord) {
    return <LandlordDashboard />;
  }

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
          greeting={firstName}
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
                {
                  backgroundColor: palette.search,
                  borderColor: palette.border,
                  shadowColor: palette.shadow,
                  opacity: pressed ? 0.94 : 1,
                },
              ]}>
              <View style={[styles.searchIconWrap, { backgroundColor: palette.primarySoft }]}>
                <SymbolView
                  name={{ ios: 'magnifyingglass', android: 'search', web: 'search' } as any}
                  size={18}
                  tintColor={palette.primary}
                  weight="semibold"
                />
              </View>
              <View style={styles.searchTextBlock}>
                <Text style={[styles.searchPlaceholder, { color: palette.text }]}>Search stays</Text>
                <Text style={[styles.searchHint, { color: palette.muted }]}>
                  {listingFeed.length} places · Any dates
                </Text>
              </View>
              <View
                style={[
                  styles.searchTrailing,
                  { backgroundColor: palette.soft, borderColor: palette.border },
                ]}>
                <SymbolView
                  name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' } as any}
                  size={17}
                  tintColor={palette.text}
                  weight="semibold"
                />
              </View>
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
            <View style={styles.headerLeft}>
              <View style={[styles.eyebrowRow, { backgroundColor: palette.primarySoft }]}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto-awesome', web: 'auto-awesome' } as any}
                  size={10}
                  tintColor={palette.primary}
                  weight="bold"
                />
                <Text style={[styles.eyebrowText, { color: palette.primary }]}>
                  {isLandlord ? 'YOUR PROPERTIES' : 'HANDPICKED'}
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>{topSectionTitle}</Text>
            </View>
            <Link href={primaryHref} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.sectionLinkRow,
                  { backgroundColor: palette.soft, opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={[styles.sectionLink, { color: palette.muted }]}>See all</Text>
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
            <View
              style={[
                styles.emptyState,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}>
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
          eyebrow={isLandlord ? 'EXPAND' : 'DISCOVER'}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, gap: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  searchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchTextBlock: { flex: 1, gap: 2 },
  searchPlaceholder: { fontSize: 15, fontWeight: '800', letterSpacing: -0.1 },
  searchHint: { fontSize: 12, fontWeight: '500' },
  searchTrailing: {
    width: 40,
    height: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  section: { gap: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { gap: 6 },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  eyebrowText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3, lineHeight: 26 },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  sectionLink: { fontSize: 13, fontWeight: '700' },
  emptyState: {
    borderRadius: 24,
    padding: 22,
    gap: 8,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 17, fontWeight: '900' },
  emptyText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
