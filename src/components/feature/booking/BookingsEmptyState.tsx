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
    padding: 26,
    gap: 12,
    alignItems: 'center',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  emptyIconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 19, fontWeight: '900', lineHeight: 24 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 2 },
  primaryButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
});
