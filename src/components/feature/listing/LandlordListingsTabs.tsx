import { SymbolView } from 'expo-symbols';
import { useMemo, useState, type ReactNode } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import type { Listing } from '@/lib/models';

import { LandlordListingCard } from './LandlordListingCard';
import {
  HOST_TAB_LABEL,
  HOST_TAB_ORDER,
  matchesHostTab,
  type HostTabKey,
} from './listing-status';

type Props = {
  listings: Listing[];
  canMutate: boolean;
  isLoading: boolean;
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
  onTogglePause: (listing: Listing) => void;
  palette: AppPalette;
  emptyState?: ReactNode;
};

export function LandlordListingsTabs({
  listings,
  canMutate,
  isLoading,
  onEdit,
  onDelete,
  onTogglePause,
  palette,
  emptyState,
}: Props) {
  const [selectedTab, setSelectedTab] = useState<HostTabKey>('active');

  const counts = useMemo(() => {
    const all = listings.length;
    const active = listings.filter((l) => l.status === 'APPROVED').length;
    const paused = listings.filter((l) => l.status === 'PAUSED').length;
    const pending = listings.filter(
      (l) => l.status === 'PENDING' || l.status === 'REJECTED',
    ).length;
    const archived = listings.filter((l) => l.status === 'ARCHIVED').length;
    return { all, active, paused, pending, archived };
  }, [listings]);

  const filtered = useMemo(
    () => listings.filter((l) => matchesHostTab(selectedTab, l.status)),
    [listings, selectedTab],
  );

  const renderEmpty = () => {
    if (emptyState) return emptyState;
    if (isLoading) return null;
    return (
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}>
        <SymbolView
          name={{
            ios: 'building.2',
            android: 'apartment',
            web: 'apartment',
          } as any}
          size={32}
          tintColor={palette.muted}
        />
        <Text style={[styles.emptyTitle, { color: palette.text }]}>
          No listings in this tab
        </Text>
        <Text style={[styles.emptySubtitle, { color: palette.muted }]}>
          {HOST_TAB_LABEL[selectedTab]} listings will appear here.
        </Text>
      </View>
    );
  };

  return (
    <View style={{ gap: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2, gap: 8 }}>
        {HOST_TAB_ORDER.map((tab) => {
          const isSelected = selectedTab === tab;
          const label = HOST_TAB_LABEL[tab];
          const count = counts[tab];
          return (
            <Pressable
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isSelected ? palette.primarySoft : palette.card,
                  borderColor: isSelected ? palette.primary : palette.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.chipLabel,
                  { color: isSelected ? palette.primary : palette.muted },
                ]}>
                {label}
              </Text>
              <View
                style={[
                  styles.countBubble,
                  {
                    backgroundColor: isSelected
                      ? palette.primary
                      : palette.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.countText,
                    {
                      color: isSelected ? palette.onPrimary : palette.muted,
                    },
                  ]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <LandlordListingCard
            listing={item}
            canMutate={canMutate}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePause={onTogglePause}
            palette={palette}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  countBubble: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
