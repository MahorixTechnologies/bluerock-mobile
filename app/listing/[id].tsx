import { SymbolView } from 'expo-symbols';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useListing } from '@/hooks/useListing';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_WIDTH - 32;

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

function diffNights(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = id ?? '';
  const { data: listing } = useListing(listingId);
  const { status } = useAuth();
  const { createBooking } = useBookings();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<'idle' | 'saving'>('idle');

  const summary = useMemo(() => {
    if (!listing) return null;
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return null;
    const nights = diffNights(start, end);
    if (nights <= 0) return null;
    const subtotal = nights * listing.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.1);
    const total = subtotal + serviceFee;
    return { nights, subtotal, serviceFee, total };
  }, [endDate, listing, startDate]);

  if (!listing) {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg, paddingTop: 24 }]}>
        <Text style={[styles.title, { color: palette.text }]}>Listing</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Loading…</Text>
      </View>
    );
  }

  const currency = listing.currency;

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={HERO_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 12 }}
        data={listing.images}
        keyExtractor={(uri) => uri}
        renderItem={({ item }) => (
          <View style={styles.heroWrap}>
            <Image source={{ uri: item }} style={styles.heroImage} />
            <View style={styles.heroShade} />
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.heroWrap, styles.heroEmpty, { backgroundColor: palette.card }]}>
            <SymbolView
              name={{ ios: 'photo', android: 'image', web: 'image' } as any}
              size={34}
              tintColor={palette.muted}
            />
          </View>
        }
      />

      <View style={styles.titleBlock}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.title, { color: palette.text }]}>{listing.title}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {listing.location} · {listing.type}
          </Text>
        </View>
        <View style={[styles.pricePill, { backgroundColor: palette.primary }]}>
          <Text style={[styles.pricePillText, { color: palette.onPrimary }]}>
            {formatMoney(listing.pricePerNight, currency)}
          </Text>
          <Text style={[styles.pricePillMeta, { color: palette.onPrimary }]}>/ night</Text>
        </View>
      </View>

      <View style={styles.factRow}>
        <Fact palette={palette} icon="bed.double.fill" androidIcon="king-bed" label={`${listing.rooms} rooms`} />
        <Fact palette={palette} icon="shower.fill" androidIcon="bathtub" label={`${listing.bathrooms} baths`} />
        <Fact palette={palette} icon="house.fill" androidIcon="home" label={listing.type} />
      </View>

      {listing.description ? (
        <Card palette={palette}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>About this place</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>{listing.description}</Text>
        </Card>
      ) : null}

      <Card palette={palette}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Amenities</Text>
        <View style={styles.amenityGrid}>
          {listing.amenities.length ? (
            listing.amenities.map((a) => (
              <View key={a} style={[styles.amenityChip, { backgroundColor: palette.soft }]}>
                <SymbolView
                  name={{ ios: 'checkmark.circle.fill', android: 'check-circle', web: 'check-circle' } as any}
                  size={14}
                  tintColor={palette.primary}
                />
                <Text style={[styles.amenityText, { color: palette.text }]}>{a}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.meta, { color: palette.muted }]}>No amenities listed.</Text>
          )}
        </View>
      </Card>

      {listing.rules?.length ? (
        <Card palette={palette}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>House rules</Text>
          <View style={{ gap: 6, marginTop: 4 }}>
            {listing.rules.map((r) => (
              <Text key={r} style={[styles.meta, { color: palette.muted }]}>
                • {r}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}

      <Card palette={palette}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Hosted by</Text>
        <View style={styles.hostRow}>
          <View style={[styles.hostAvatar, { backgroundColor: palette.primarySoft }]}>
            <Text style={[styles.hostAvatarText, { color: palette.primary }]}>
              {listing.host.name?.[0]?.toUpperCase() ?? 'H'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.hostName, { color: palette.text }]}>{listing.host.name}</Text>
            {listing.host.phone ? (
              <Text style={[styles.meta, { color: palette.muted }]}>{listing.host.phone}</Text>
            ) : null}
          </View>
        </View>
        <Text style={[styles.meta, { color: palette.muted, marginTop: 6 }]}>{listing.availabilityNote}</Text>
      </Card>

      <Card palette={palette}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Book a room</Text>

        {status !== 'signedIn' ? (
          <View style={{ gap: 10, marginTop: 8 }}>
            <Text style={[styles.meta, { color: palette.muted }]}>
              Log in to book and view your booking history.
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Button>Log In</Button>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View style={{ gap: 12, marginTop: 10 }}>
            <Input
              value={startDate}
              onChangeText={setStartDate}
              placeholder="Start date (YYYY-MM-DD)"
              autoCapitalize="none"
              leftIcon="calendar"
            />
            <Input
              value={endDate}
              onChangeText={setEndDate}
              placeholder="End date (YYYY-MM-DD)"
              autoCapitalize="none"
              leftIcon="calendar"
            />

            {summary ? (
              <View style={[styles.summaryBox, { borderColor: palette.border, backgroundColor: palette.soft }]}>
                <SummaryRow palette={palette} label="Nights" value={String(summary.nights)} />
                <SummaryRow palette={palette} label="Subtotal" value={formatMoney(summary.subtotal, currency)} />
                <SummaryRow palette={palette} label="Service fee" value={formatMoney(summary.serviceFee, currency)} />
                <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
                <SummaryRow palette={palette} label="Total" value={formatMoney(summary.total, currency)} emphasize />
              </View>
            ) : (
              <Text style={[styles.meta, { color: palette.muted }]}>
                Enter valid dates to see a price breakdown.
              </Text>
            )}

            {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}

            <Button
              disabled={!summary || booking === 'saving'}
              loading={booking === 'saving'}
              onPress={async () => {
                setError(null);
                if (!summary) {
                  setError('Please enter valid dates (YYYY-MM-DD) with at least 1 night.');
                  return;
                }
                setBooking('saving');
                try {
                  await createBooking({
                    listing,
                    startDate: startDate.trim(),
                    endDate: endDate.trim(),
                    nights: summary.nights,
                    subtotal: summary.subtotal,
                    serviceFee: summary.serviceFee,
                    total: summary.total,
                  });
                  router.replace('/(tabs)/bookings');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Booking failed');
                } finally {
                  setBooking('idle');
                }
              }}>
              {summary ? `Confirm booking · ${formatMoney(summary.total, currency)}` : 'Confirm booking'}
            </Button>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

function Card({
  palette,
  children,
}: {
  palette: ReturnType<typeof useAppTheme>['palette'];
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}>
      {children}
    </View>
  );
}

function Fact({
  palette,
  icon,
  androidIcon,
  label,
}: {
  palette: ReturnType<typeof useAppTheme>['palette'];
  icon: string;
  androidIcon: string;
  label: string;
}) {
  return (
    <View style={[styles.fact, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <SymbolView
        name={{ ios: icon, android: androidIcon, web: androidIcon } as any}
        size={18}
        tintColor={palette.primary}
      />
      <Text style={[styles.factText, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function SummaryRow({
  palette,
  label,
  value,
  emphasize = false,
}: {
  palette: ReturnType<typeof useAppTheme>['palette'];
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: emphasize ? palette.text : palette.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: palette.text, fontWeight: emphasize ? '900' : '700' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 14 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  heroWrap: {
    width: HERO_WIDTH,
    height: 230,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(150,150,150,0.12)',
  },
  heroImage: { width: '100%', height: '100%' },
  heroShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.06)' },
  heroEmpty: { alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  pricePill: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  pricePillText: { fontSize: 16, fontWeight: '900' },
  pricePillMeta: { fontSize: 11, fontWeight: '600', opacity: 0.9 },
  factRow: { flexDirection: 'row', gap: 10 },
  fact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
  },
  factText: { fontSize: 13, fontWeight: '700' },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  meta: { fontSize: 14, lineHeight: 21 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amenityText: { fontSize: 13, fontWeight: '600' },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  hostAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  hostAvatarText: { fontSize: 18, fontWeight: '800' },
  hostName: { fontSize: 15, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, fontWeight: '600' },
  summaryValue: { fontSize: 14 },
  summaryDivider: { height: 1, marginVertical: 2 },
});
