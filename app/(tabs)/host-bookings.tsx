import { Href, Link, Redirect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/Button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppPalette } from '@/constants/theme';
import { apiFetch } from '@/lib/api-client';
import { formatMoney } from '@/lib/format';
import { makeMockOwnerBookings, type OwnerBooking } from '@/lib/mock-bookings';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';

type BookingStatus = OwnerBooking['status'];
type FilterKey = 'ALL' | Exclude<BookingStatus, 'PENDING'> | 'PENDING';
const FILTERS: FilterKey[] = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

function statusLabel(status: BookingStatus) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETED':
      return 'Completed';
    case 'PENDING':
      return 'Pending';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
  }
}

function prettyDate(value: string) {
  const dt = new Date(value + 'T00:00:00Z');
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function HostBookingsScreen() {
  const queryClient = useQueryClient();
  const { palette } = useAppTheme();
  const { status, profile } = useAuth();
  const { decideBooking, decideBusy, createFakeBooking, ownerBookings: providerOwnerBookings } = useBookings();
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: async (): Promise<OwnerBooking[]> => {
      if (!process.env.EXPO_PUBLIC_API_URL) return makeMockOwnerBookings();
      try {
        const raw = await apiFetch('/bookings/owner');
        return Array.isArray(raw) ? (raw as OwnerBooking[]) : [];
      } catch {
        return makeMockOwnerBookings();
      }
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
          <Button style={{ marginTop: 14 }}>Log In</Button>
        </Link>
      </View>
    );
  }

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);

  const mergedBookings = useMemo<OwnerBooking[]>(() => {
    const byId = new Map<string, OwnerBooking>();
    for (const b of bookings) byId.set(b.id, b);
    for (const b of providerOwnerBookings) byId.set(b.id, b);
    return Array.from(byId.values()).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [bookings, providerOwnerBookings]);

  const { filtered, counts, upcoming, pendingCount, completedCount, payoutTotal } = useMemo(() => {
    const filterMatch = (item: OwnerBooking) => filter === 'ALL' ? true : item.status === filter;
    const upc = mergedBookings.filter((b) => b.status === 'CONFIRMED' && b.endDate >= todayUtc).length;
    const pending = mergedBookings.filter((b) => b.status === 'PENDING').length;
    const completed = mergedBookings.filter((b) => b.status === 'COMPLETED').length;
    const payout = mergedBookings
      .filter((b) => (b.status === 'CONFIRMED' || b.status === 'COMPLETED') && b.paymentStatus === 'PAID')
      .reduce((s, b) => s + b.total, 0);
    return {
      filtered: mergedBookings.filter(filterMatch),
      counts: {
        ALL: mergedBookings.length,
        CONFIRMED: mergedBookings.filter((b) => b.status === 'CONFIRMED').length,
        PENDING: pending,
        COMPLETED: completed,
        CANCELLED: mergedBookings.filter((b) => b.status === 'CANCELLED').length,
        REJECTED: mergedBookings.filter((b) => b.status === 'REJECTED').length,
      },
      upcoming: upc,
      pendingCount: pending,
      completedCount: completed,
      payoutTotal: payout,
    };
  }, [mergedBookings, todayUtc, filter]);

  async function decide(id: string, decision: 'APPROVE' | 'REJECT') {
    try {
      await decideBooking(id, decision);
      queryClient.setQueryData<OwnerBooking[]>(['hostBookings'], (prev) =>
        (prev ?? []).map((b) =>
          b.id === id ? { ...b, status: decision === 'APPROVE' ? 'CONFIRMED' : 'REJECTED' } : b,
        ),
      );
    } catch {}
  }

  function handleCreateDemoBooking() {
    createFakeBooking();
    queryClient.invalidateQueries({ queryKey: ['hostBookings'] });
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.title, { color: palette.text }]}>Booking requests</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        Accept or reject booking requests for your listings.
      </Text>

      {error ? <Text style={{ color: palette.danger, marginTop: 8 }}>{String(error)}</Text> : null}

      <FlatList
        contentContainerStyle={{ paddingVertical: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.kpiRow}>
              <Kpi palette={palette} label="Total" value={String(mergedBookings.length)} tint={palette.primarySoft} tintFg={palette.primary} />
              <Kpi palette={palette} label="Upcoming" value={String(upcoming)} tint={palette.successSoft} tintFg={palette.success} />
              <Kpi palette={palette} label="Pending" value={String(pendingCount)} tint={palette.warningSoft} tintFg={palette.warning} />
              <Kpi palette={palette} label="Completed" value={String(completedCount)} tint={palette.soft} tintFg={palette.muted} />
            </View>
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow, marginTop: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={[styles.rowLabel, { color: palette.muted }]}>Payout earnings</Text>
                  <Text style={[styles.payoutTotal, { color: palette.text }]}>
                    {formatMoney(payoutTotal, mergedBookings[0]?.listing?.currency ?? 'NGN')}
                  </Text>
                </View>
                <View style={[styles.payoutBadge, { backgroundColor: palette.primarySoft }]}>
                  <Text style={[styles.payoutBadgeText, { color: palette.primary }]}>PAID</Text>
                </View>
              </View>
              <Text style={[styles.cardSubtitle, { color: palette.muted, marginTop: 4 }]}>
                Confirmed and completed bookings where the renter has paid.
              </Text>
            </View>

            <Pressable
              onPress={handleCreateDemoBooking}
              style={({ pressed }) => [
                styles.demoButton,
                {
                  backgroundColor: palette.primarySoft,
                  borderColor: palette.primary,
                  opacity: pressed ? 0.9 : 1,
                  marginTop: 14,
                },
              ]}>
              <View style={styles.demoButtonIcon}>
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
                  Generate a new random reservation to test the approval flow
                </Text>
              </View>
              <SymbolView
                name={{ ios: 'sparkles', android: 'auto-awesome', web: 'auto-awesome' } as any}
                size={18}
                tintColor={palette.primary}
                weight="semibold"
              />
            </Pressable>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <Pressable key={f} onPress={() => setFilter(f)}>
                    <View
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: active ? palette.primary : palette.card,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}>
                      <Text style={[styles.filterText, { color: active ? palette.onPrimary : palette.text }]}>
                        {f === 'ALL' ? 'All' : statusLabel(f)}
                      </Text>
                      <View style={[styles.filterCount, { backgroundColor: active ? palette.onPrimary : palette.soft }]}>
                        <Text style={[styles.filterCountText, { color: active ? palette.primary : palette.muted }]}>
                          {counts[f] ?? 0}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              {isLoading ? 'Loading…' : 'No requests here'}
            </Text>
            <Text style={[styles.cardSubtitle, { color: palette.muted }]}>
              Change filters or wait for new booking requests.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const rowBusy = Boolean(decideBusy[item.id]);
          return (
            <Link href={`/booking/${item.id}` as Href} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                    shadowColor: palette.shadow,
                    opacity: pressed ? 0.96 : 1,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
                      {item.listing?.title ?? 'Listing'}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: palette.muted }]} numberOfLines={1}>
                      {item.listing?.location ?? ''}
                    </Text>
                  </View>
                  <View style={styles.badgeStack}>
                    <BookingStatusBadge status={item.status} palette={palette} size="small" />
                    <PaymentStatusBadge paymentStatus={item.paymentStatus} palette={palette} size="small" />
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: palette.border }]} />

                <View style={styles.gridTwo}>
                  <Mini tile={{ label: 'Check-in', value: prettyDate(item.startDate) }} palette={palette} />
                  <Mini tile={{ label: 'Check-out', value: prettyDate(item.endDate) }} palette={palette} />
                </View>
                <View style={styles.gridTwo}>
                  <Mini tile={{ label: 'Guest', value: item.renter?.name?.trim() || item.renter?.email || '—' }} palette={palette} />
                  <Mini tile={{ label: 'Nights', value: `${item.nights} N` }} palette={palette} />
                </View>

                <View style={styles.gridTwo}>
                  <Mini tile={{ label: 'Payment', value: item.paymentStatus }} palette={palette} />
                  <Mini tile={{ label: 'Contact', value: item.renter?.phone || item.renter?.email || '—' }} palette={palette} />
                </View>

                <View style={styles.totalRow}>
                  <Text style={[styles.rowLabel, { color: palette.muted }]}>Payout</Text>
                  <Text style={[styles.total, { color: palette.text }]}>
                    {formatMoney(item.total, item.listing?.currency ?? 'NGN')}
                  </Text>
                </View>

                <Text style={[styles.bookingId, { color: palette.muted }]}>
                  ID: {item.id}
                </Text>

                {item.status === 'PENDING' ? (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        decide(item.id, 'APPROVE');
                      }}
                      disabled={rowBusy}
                      style={({ pressed }) => [
                        styles.rowAction,
                        {
                          backgroundColor: palette.success,
                          opacity: pressed || rowBusy ? 0.85 : 1,
                        },
                      ]}>
                      <Text style={[styles.rowActionText, { color: palette.onPrimary ?? '#ffffff' }]}>
                        {rowBusy ? '…' : 'Accept'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        decide(item.id, 'REJECT');
                      }}
                      disabled={rowBusy}
                      style={({ pressed }) => [
                        styles.rowActionBordered,
                        {
                          borderColor: palette.danger,
                          opacity: pressed || rowBusy ? 0.85 : 1,
                        },
                      ]}>
                      <Text style={[styles.rowActionDangerText, { color: palette.danger }]}>
                        {rowBusy ? '…' : 'Reject'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            </Link>
          );
        }}
      />
    </View>
  );
}

function Mini({ tile, palette }: { tile: { label: string; value: string }; palette: AppPalette }) {
  return (
    <View style={[styles.miniTile, { backgroundColor: palette.soft }]}>
      <Text style={[styles.miniLabel, { color: palette.muted }]}>{tile.label}</Text>
      <Text style={[styles.miniValue, { color: palette.text }]} numberOfLines={1}>{tile.value}</Text>
    </View>
  );
}

function Kpi({ palette, label, value, tint, tintFg }: {
  palette: AppPalette;
  label: string;
  value: string;
  tint: string;
  tintFg: string;
}) {
  return (
    <View style={[styles.kpiCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={[styles.kpiDot, { backgroundColor: tint }]}>
        <Text style={[styles.kpiDotText, { color: tintFg }]}>{value}</Text>
      </View>
      <Text style={[styles.kpiLabel, { color: palette.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 14 },
  kpiRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  kpiCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  kpiDot: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  kpiDotText: { fontSize: 13, fontWeight: '900' },
  kpiLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  payoutBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  payoutBadgeText: { fontSize: 11, fontWeight: '800' },
  payoutTotal: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  bookingId: { fontSize: 11, fontWeight: '700', marginTop: 2 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13 },
  divider: { height: 1, marginVertical: 2 },
  badgeStack: { alignItems: 'flex-end', gap: 6 },
  gridTwo: { flexDirection: 'row', gap: 8, marginTop: 4 },
  miniTile: { flex: 1, borderRadius: 14, padding: 10, gap: 4 },
  miniLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  miniValue: { fontSize: 13, fontWeight: '700' },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  total: { fontSize: 16, fontWeight: '900' },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterText: { fontSize: 13, fontWeight: '800' },
  filterCount: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  filterCountText: { fontSize: 11, fontWeight: '800' },
  rowAction: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowActionText: { fontWeight: '800', fontSize: 15 },
  rowActionBordered: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  rowActionDangerText: { fontWeight: '800', fontSize: 15 },
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonTitle: { fontSize: 14, fontWeight: '900', letterSpacing: -0.1 },
  demoButtonSubtitle: { fontSize: 12, fontWeight: '600', opacity: 0.78, marginTop: 1 },
});
