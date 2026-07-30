import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/Button';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppPalette } from '@/constants/theme';
import { apiFetch } from '@/lib/api-client';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

type OwnerBooking = {
  id: string;
  startDate: string;
  endDate: string;
  nights: number;
  total: number;
  status: BookingStatus;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  listing: { id: string; title: string; location: string; currency?: 'USD' | 'NGN' };
  renter: { id: string; email: string; name?: string | null; phone?: string | null };
};

function statusColors(palette: AppPalette, status: BookingStatus) {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return { bg: palette.successSoft, fg: palette.success };
    case 'REJECTED':
    case 'CANCELLED':
      return { bg: palette.dangerSoft, fg: palette.danger };
    default:
      return { bg: palette.warningSoft, fg: palette.warning };
  }
}

export default function HostBookingsScreen() {
  const queryClient = useQueryClient();
  const { palette } = useAppTheme();
  const { status, profile } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: async (): Promise<OwnerBooking[]> => {
      if (!process.env.EXPO_PUBLIC_API_URL) return [];
      const raw = await apiFetch('/bookings/owner');
      return Array.isArray(raw) ? (raw as OwnerBooking[]) : [];
    },
    enabled: status === 'signedIn' && profile?.role !== 'RENTER',
  });

  if (profile?.role === 'RENTER') {
    return <Redirect href="/(tabs)/bookings" />;
  }

  if (status !== 'signedIn' || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <Text style={[styles.title, { color: palette.text }]}>Booking requests</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Log in as a landlord to review booking requests.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Button style={{ marginTop: 14 }}>Log In</Button>
          </Pressable>
        </Link>
      </View>
    );
  }

  async function decide(id: string, decision: 'ACCEPT' | 'REJECT') {
    setBusyId(id);
    try {
      await apiFetch(`/bookings/${id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      await queryClient.invalidateQueries({ queryKey: ['hostBookings'] });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.title, { color: palette.text }]}>Booking requests</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        Accept or reject booking requests for your listings.
      </Text>

      {error ? <Text style={{ color: palette.danger, marginTop: 8 }}>{String(error)}</Text> : null}

      {!process.env.EXPO_PUBLIC_API_URL ? (
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, marginTop: 12 }]}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Backend required</Text>
          <Text style={[styles.cardSubtitle, { color: palette.muted }]}>
            Set EXPO_PUBLIC_API_URL to view real booking requests.
          </Text>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={{ paddingVertical: 14, gap: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        data={bookings}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !process.env.EXPO_PUBLIC_API_URL ? null : (
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                {isLoading ? 'Loading…' : 'No requests yet'}
              </Text>
              <Text style={[styles.cardSubtitle, { color: palette.muted }]}>
                New bookings will appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const sc = statusColors(palette, item.status);
          return (
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: palette.text, flex: 1 }]} numberOfLines={1}>
                  {item.listing?.title ?? 'Listing'}
                </Text>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.fg }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={[styles.cardSubtitle, { color: palette.muted }]} numberOfLines={1}>
                {item.listing?.location ?? ''}
              </Text>

              <View style={[styles.divider, { backgroundColor: palette.border }]} />

              <Row palette={palette} label="Dates">
                {new Date(item.startDate).toLocaleDateString()} → {new Date(item.endDate).toLocaleDateString()} ·{' '}
                {item.nights} nights
              </Row>
              <Row palette={palette} label="Guest">
                {item.renter?.name?.trim() || item.renter?.email || '—'}
              </Row>
              <Row palette={palette} label="Payment">
                {item.paymentStatus}
              </Row>
              <View style={styles.totalRow}>
                <Text style={[styles.rowLabel, { color: palette.muted }]}>Total</Text>
                <Text style={[styles.total, { color: palette.text }]}>
                  {formatMoney(item.total, item.listing?.currency ?? 'NGN')}
                </Text>
              </View>

              {item.status === 'PENDING' ? (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <Button
                    loading={busyId === item.id}
                    disabled={busyId === item.id}
                    onPress={() => decide(item.id, 'ACCEPT')}
                    style={{ flex: 1, marginTop: 0 }}>
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    loading={busyId === item.id}
                    disabled={busyId === item.id}
                    onPress={() => decide(item.id, 'REJECT')}
                    style={{ flex: 1, marginTop: 0 }}>
                    Reject
                  </Button>
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

function Row({
  palette,
  label,
  children,
}: {
  palette: AppPalette;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: palette.text }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 14 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13 },
  divider: { height: 1, marginVertical: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  total: { fontSize: 16, fontWeight: '900' },
});
