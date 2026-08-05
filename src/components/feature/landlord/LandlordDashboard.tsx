import { Href, Link, useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useListings } from '@/hooks/useListings';
import { mockListings } from '@/lib/mock-data';
import { useAuth } from '@/providers/AuthProvider';

import { HomeFeaturedCarousel } from '../home/HomeFeaturedCarousel';
import { LandlordDashboardHeader } from './LandlordDashboardHeader';
import { LandlordPropertiesSection } from './LandlordPropertiesSection';
import { LandlordQuickAccess } from './LandlordQuickAccess';
import { LandlordStatsGrid } from './LandlordStatsGrid';
import type { QuickActionKey } from './types';
import { deriveLandlordProperties, deriveLandlordStats } from './utils';

export function LandlordDashboard() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const { data: listings = [], refetch, isRefetching } = useListings();

  const listingFeed = listings.length ? listings : mockListings;
  const stats = deriveLandlordStats(listingFeed);
  const allProperties = deriveLandlordProperties(listingFeed);
  const previewProperties = allProperties.slice(0, 2);
  const featuredPool = listingFeed.filter((item) => item.featured);
  const featuredListings = (featuredPool.length ? featuredPool : listingFeed).slice(0, 5);

  const greetingName =
    profile?.name?.trim().split(' ')[0] ||
    profile?.email?.trim().split('@')[0] ||
    'Landlord';

  const avatarInitials = (() => {
    const raw = profile?.name?.trim() || profile?.email?.trim() || 'L';
    return raw
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2);
  })();

  const handleNotifications = () => {
    router.push('/(tabs)/profile' as Href);
  };

  const handleAddProperty = () => {
    router.push('/(tabs)/host-listings' as Href);
  };

  const handleQuickAction = (_key: QuickActionKey) => {
    router.push('/(tabs)/profile' as Href);
  };

  const handleViewAll = () => {
    router.push('/(tabs)/host-listings' as Href);
  };

  const handlePropertyPress = (id: string) => {
    router.push(`/listing/${id}` as Href);
  };

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
        }
      >
        <LandlordDashboardHeader
          greetingName={greetingName}
          avatarInitials={avatarInitials || 'L'}
          palette={palette}
          hasNotifications
          onAddProperty={handleAddProperty}
          onNotifications={handleNotifications}
        />

        <LandlordStatsGrid stats={stats} palette={palette} />

        <LandlordQuickAccess palette={palette} onAction={handleQuickAction} />

        <LandlordPropertiesSection
          palette={palette}
          properties={previewProperties}
          onViewAll={handleViewAll}
          onPropertyPress={handlePropertyPress}
        />

        <View style={landlordStyles.featuredSection}>
          <View style={landlordStyles.sectionHeader}>
            <View style={landlordStyles.headerLeft}>
              <View style={[landlordStyles.eyebrowRow, { backgroundColor: palette.primarySoft }]}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' } as any}
                  size={10}
                  tintColor={palette.primary}
                  weight="bold"
                />
                <Text style={[landlordStyles.eyebrowText, { color: palette.primary }]}>
                  TRENDING HOMES
                </Text>
              </View>
              <Text style={[landlordStyles.sectionTitle, { color: palette.text }]}>
                Featured Homes
              </Text>
              <Text style={[landlordStyles.sectionSubtitle, { color: palette.muted }]}>
                Browse stays your guests are loving right now — use them as inspiration.
              </Text>
            </View>
            <Link href="/(tabs)/search" asChild>
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  landlordStyles.sectionLinkRow,
                  { backgroundColor: palette.soft, opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={[landlordStyles.sectionLink, { color: palette.muted }]}>
                  Explore
                </Text>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
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
                landlordStyles.emptyState,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}>
              <Text style={[landlordStyles.emptyTitle, { color: palette.text }]}>
                Loading featured homes…
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 16,
  },
});

const landlordStyles = StyleSheet.create({
  featuredSection: { gap: 14, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { gap: 5, flex: 1, paddingRight: 12 },
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
  sectionSubtitle: { fontSize: 13, lineHeight: 18 },
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
  emptyState: { borderRadius: 24, padding: 22, borderWidth: 1 },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
});
