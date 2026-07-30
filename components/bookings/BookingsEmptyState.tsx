import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { BookingPalette } from './types';

export function BookingsEmptyState({ palette }: { palette: BookingPalette }) {
  return (
    <View
      style={[
        styles.emptyCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
      ]}>
      <View style={[styles.emptyIconBubble, { backgroundColor: palette.primarySoft }]}>
        <SymbolView
          name={{ ios: 'calendar.badge.plus', android: 'event', web: 'event' } as any}
          size={28}
          tintColor={palette.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: palette.text }]}>No bookings yet</Text>
      <Text style={[styles.emptySubtitle, { color: palette.muted }]}>
        Browse listings and book a room to see it here.
      </Text>
      <Link href="/(tabs)/search" asChild>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1, alignSelf: 'stretch' },
          ]}>
          <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>Explore stays</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    gap: 8,
    alignItems: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  emptyIconBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
});
