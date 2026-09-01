import { Href, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useHostListings } from '@/hooks/useHostListings';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';

import { HomeFeaturedCarousel } from '../home/HomeFeaturedCarousel';
import { SectionHeader } from '../home/SectionHeader';
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
  const { data: myListings = [], refetch, isRefetching } = useHostListings();
  const { ownerBookings } = useBookings();
  const { data: browseListings = [] } = useListings();

  const stats = deriveLandlordStats(myListings, ownerBookings);
  const allProperties = deriveLandlordProperties(myListings, ownerBookings);
  const previewProperties = allProperties.slice(0, 2);
  const featuredPool = browseListings.filter((item) => item.featured);
  const featuredListings = (featuredPool.length ? featuredPool : browseListings).slice(0, 5);

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

        {previewProperties.length ? (
          <LandlordPropertiesSection
            palette={palette}
            properties={previewProperties}
            onViewAll={handleViewAll}
            onPropertyPress={handlePropertyPress}
          />
        ) : (
          <View
            style={[
              landlordStyles.emptyState,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}>
            <Text style={[landlordStyles.emptyTitle, { color: palette.text }]}>
              No properties yet
            </Text>
            <Text style={[landlordStyles.emptyText, { color: palette.muted }]}>
              Add your first listing to start tracking bookings and revenue.
            </Text>
          </View>
        )}

        <View style={landlordStyles.featuredSection}>
          <SectionHeader
            title="Featured Homes"
            href={'/(tabs)/search' as Href}
            textColor={palette.text}
            mutedColor={palette.muted}
            palette={palette}
            eyebrow="TRENDING HOMES"
            subtitle="Browse stays your guests are loving right now — use them as inspiration."
            linkLabel="Explore"
          />

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
  emptyState: { borderRadius: 24, padding: 22, borderWidth: 1, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptyText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
