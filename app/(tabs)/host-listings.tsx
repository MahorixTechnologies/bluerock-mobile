import { SymbolView } from 'expo-symbols';
import { Link, Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Input, Textarea } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppPalette } from '@/constants/theme';
import { apiFetch } from '@/lib/api-client';
import { formatPricePerNight } from '@/lib/format';
import { mapApiListing } from '@/lib/listing-mapper';
import type { Listing, PropertyType } from '@/lib/models';
import { mockListings } from '@/lib/mock-data';
import { useAuth } from '@/providers/AuthProvider';

function parseCsv(input: string) {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function statusColors(palette: AppPalette, status: Listing['status']) {
  switch (status) {
    case 'APPROVED':
      return { bg: palette.successSoft, fg: palette.success };
    case 'REJECTED':
      return { bg: palette.dangerSoft, fg: palette.danger };
    default:
      return { bg: palette.warningSoft, fg: palette.warning };
  }
}

export default function HostListingsScreen() {
  const queryClient = useQueryClient();
  const { palette } = useAppTheme();
  const { status, profile } = useAuth();

  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['hostListings'],
    queryFn: async (): Promise<Listing[]> => {
      if (process.env.EXPO_PUBLIC_API_URL) {
        const raw = await apiFetch('/listings/mine');
        return Array.isArray(raw) ? raw.map((l) => mapApiListing(l, 'You')) : [];
      }
      return mockListings.map((l) => ({ ...l, status: 'PENDING' as const }));
    },
    enabled: status === 'signedIn' && profile?.role !== 'RENTER',
  });

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [type, setType] = useState<PropertyType>('Apartment');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [amenities, setAmenities] = useState('');
  const [rules, setRules] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const parsedPrice = useMemo(() => {
    const n = Number(price);
    return Number.isFinite(n) ? n : 0;
  }, [price]);

  if (profile?.role === 'RENTER') {
    return <Redirect href="/" />;
  }

  if (status !== 'signedIn' || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <Text style={[styles.title, { color: palette.text }]}>My listings</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Log in as a landlord to manage your properties.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>Log In</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={[styles.secondaryButtonText, { color: palette.text }]}>
              Create landlord account
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const canCreate =
    title.trim().length > 0 && location.trim().length > 0 && parsedPrice > 0 && !saving;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={listings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <Text style={[styles.title, { color: palette.text }]}>My listings</Text>
            <Text style={[styles.subtitle, { color: palette.muted, marginTop: -6 }]}>
              Create and manage properties you rent out.
            </Text>

            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Create listing</Text>

              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                leftIcon="textformat"
              />
              <Input
                value={location}
                onChangeText={setLocation}
                placeholder="Location"
                leftIcon="mappin"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Input
                  containerStyle={{ flex: 1 }}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Price"
                  keyboardType="numeric"
                />
                <Input
                  containerStyle={{ flex: 1 }}
                  value={rooms}
                  onChangeText={setRooms}
                  placeholder="Rooms"
                  keyboardType="numeric"
                />
                <Input
                  containerStyle={{ flex: 1 }}
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  placeholder="Baths"
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['Apartment', 'House'] as const).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setType(option)}
                    style={({ pressed }) => [
                      styles.typeChip,
                      { borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
                      type === option ? { backgroundColor: palette.primarySoft, borderColor: palette.primary } : null,
                    ]}>
                    <Text style={[styles.typeChipText, { color: type === option ? palette.primary : palette.text }]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Textarea
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                rows={3}
              />
              <Input
                value={images}
                onChangeText={setImages}
                placeholder="Image URLs (comma separated)"
                autoCapitalize="none"
                leftIcon="photo"
              />
              <Input
                value={amenities}
                onChangeText={setAmenities}
                placeholder="Amenities (comma separated)"
                leftIcon="sparkles"
              />
              <Input
                value={rules}
                onChangeText={setRules}
                placeholder="Rules (comma separated)"
                leftIcon="checklist"
              />

              {actionError ? <Text style={{ color: palette.danger }}>{actionError}</Text> : null}

              <Pressable
                disabled={!canCreate}
                onPress={async () => {
                  setActionError(null);
                  if (!process.env.EXPO_PUBLIC_API_URL) {
                    setActionError('Set EXPO_PUBLIC_API_URL to create listings against the backend.');
                    return;
                  }
                  setSaving(true);
                  try {
                    await apiFetch('/listings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: title.trim(),
                        description: description.trim(),
                        location: location.trim(),
                        pricePerNight: parsedPrice,
                        currency: 'NGN',
                        rooms: Number(rooms) || 0,
                        bathrooms: Number(bathrooms) || 0,
                        type,
                        images: parseCsv(images),
                        amenities: parseCsv(amenities),
                        rules: parseCsv(rules),
                      }),
                    });

                    setTitle('');
                    setLocation('');
                    setPrice('');
                    setRooms('1');
                    setBathrooms('1');
                    setType('Apartment');
                    setDescription('');
                    setImages('');
                    setAmenities('');
                    setRules('');

                    await queryClient.invalidateQueries({ queryKey: ['hostListings'] });
                  } catch (e) {
                    setActionError(e instanceof Error ? e.message : 'Failed to create listing');
                  } finally {
                    setSaving(false);
                  }
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: palette.primary },
                  !canCreate ? { backgroundColor: palette.primarySoft } : null,
                  { opacity: pressed ? 0.9 : 1 },
                ]}>
                <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
                  {saving ? 'Creating…' : 'Create listing'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Your listings</Text>
              <Text style={[styles.countPill, { color: palette.muted }]}>{listings.length}</Text>
            </View>
            {error ? <Text style={{ color: palette.danger }}>{String(error)}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              {isLoading ? 'Loading…' : 'No listings yet'}
            </Text>
            <Text style={[styles.cardSubtitle, { color: palette.muted }]}>
              Create your first property listing above.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const sc = statusColors(palette, item.status);
          return (
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardSubtitle, { color: palette.muted }]}>{item.location}</Text>
                  <Text style={[styles.meta, { color: palette.muted }]}>
                    {item.type} · {item.rooms} rooms · {item.bathrooms} baths
                  </Text>
                  <Text style={[styles.priceText, { color: palette.text }]}>
                    {formatPricePerNight(item.pricePerNight, item.currency)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.fg }]}>{item.status ?? 'PENDING'}</Text>
                  </View>
                  <Link href={`/listing/${item.id}`} asChild>
                    <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                      <Text style={{ fontWeight: '800', color: palette.primary }}>View</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>

              {process.env.EXPO_PUBLIC_API_URL ? (
                <Pressable
                  onPress={async () => {
                    setActionError(null);
                    try {
                      await apiFetch(`/listings/${item.id}`, { method: 'DELETE' });
                      await queryClient.invalidateQueries({ queryKey: ['hostListings'] });
                    } catch (e) {
                      setActionError(e instanceof Error ? e.message : 'Failed to delete listing');
                    }
                  }}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    { borderColor: palette.dangerSoft, opacity: pressed ? 0.8 : 1 },
                  ]}>
                  <SymbolView
                    name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
                    size={14}
                    tintColor={palette.danger}
                  />
                  <Text style={[styles.deleteButtonText, { color: palette.danger }]}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
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
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  listHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  countPill: { fontSize: 14, fontWeight: '800' },
  typeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  typeChipText: { fontWeight: '800' },
  primaryButton: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { fontWeight: '800', fontSize: 16 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
  },
  deleteButtonText: { fontWeight: '800', fontSize: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13 },
  meta: { fontSize: 13 },
  priceText: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});
