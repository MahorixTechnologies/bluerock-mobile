import { Link, Redirect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { DeleteConfirmDialog } from '@/components/listings/DeleteConfirmDialog';
import { HostListingsEmptyState } from '@/components/listings/HostListingsEmptyState';
import { HostListingsForm, type ListingDraft } from '@/components/listings/HostListingsForm';
import { LandlordListingsTabs } from '@/components/listings/LandlordListingsTabs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHostListings } from '@/hooks/useHostListings';
import { apiFetch } from '@/lib/api-client';
import type { Listing } from '@/lib/models';
import { useAuth } from '@/providers/AuthProvider';

function parseCsv(input: string) {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function HostListingsScreen() {
  const queryClient = useQueryClient();
  const { palette } = useAppTheme();
  const { status, profile } = useAuth();

  const { data: listings = [], isLoading } = useHostListings({
    enabled: status === 'signedIn' && profile?.role !== 'RENTER',
  });

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const payloadFromDraft = (draft: ListingDraft) => {
    const parsedPrice = Number(draft.price);
    return {
      title: draft.title.trim(),
      description: draft.description.trim(),
      location: draft.location.trim(),
      pricePerNight: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      currency: draft.currency,
      rooms: Number(draft.rooms) || 0,
      bathrooms: Number(draft.bathrooms) || 0,
      type: draft.type,
      images: parseCsv(draft.images),
      amenities: parseCsv(draft.amenities),
      rules: parseCsv(draft.rules),
    };
  };

  const handleSubmit = async (draft: ListingDraft) => {
    setActionError(null);
    const payload = payloadFromDraft(draft);
    if (!payload.title || !payload.location || payload.pricePerNight <= 0) {
      setActionError('Please fill all required fields: title, location and a valid positive price.');
      return;
    }
    try {
      setSaving(true);
      if (!canMutate) {
        throw new Error('Backend required: set EXPO_PUBLIC_API_URL to create and edit listings.');
      }
      if (editing) {
        await apiFetch(`/listings/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['hostListings'] });
      setEditing(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      if (!canMutate) {
        throw new Error('Backend required: set EXPO_PUBLIC_API_URL to delete listings.');
      }
      await apiFetch(`/listings/${confirmDeleteId}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['hostListings'] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete listing');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleTogglePause = async (listing: Listing) => {
    setActionError(null);
    try {
      if (!canMutate) {
        throw new Error('Backend required: set EXPO_PUBLIC_API_URL to pause or activate listings.');
      }
      const nextStatus = listing.status === 'APPROVED' ? 'PAUSED' : 'APPROVED';
      await apiFetch(`/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      await queryClient.invalidateQueries({ queryKey: ['hostListings'] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to update listing status');
    }
  };

  const headerKpis = useMemo(() => {
    const total = listings.length;
    const approved = listings.filter((l) => l.status === 'APPROVED').length;
    const pending = listings.filter((l) => l.status === 'PENDING').length;
    return { total, approved, pending };
  }, [listings]);

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

  const canMutate = Boolean(process.env.EXPO_PUBLIC_API_URL);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <Text style={[styles.title, { color: palette.text }]}>My listings</Text>
        <Text style={[styles.subtitle, { color: palette.muted, marginTop: -6 }]}>
          Create and manage properties you rent out.
        </Text>

        {!canMutate ? (
          <View style={[styles.noticeBanner, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}>
            <SymbolView
              name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' } as any}
              size={16}
              tintColor={palette.primary}
            />
            <Text style={[styles.noticeBannerText, { color: palette.primary }]}>
              Demo mode — read only. Set EXPO_PUBLIC_API_URL to create or edit listings.
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[styles.kpiCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.kpiValue, { color: palette.text }]}>{headerKpis.total}</Text>
            <Text style={[styles.kpiLabel, { color: palette.muted }]}>Total</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.kpiValue, { color: palette.success }]}>{headerKpis.approved}</Text>
            <Text style={[styles.kpiLabel, { color: palette.muted }]}>Live</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[styles.kpiValue, { color: palette.warning }]}>{headerKpis.pending}</Text>
            <Text style={[styles.kpiLabel, { color: palette.muted }]}>Pending</Text>
          </View>
        </View>

        {actionError ? (
          <Text style={{ color: palette.danger, fontWeight: '700' }}>{actionError}</Text>
        ) : null}

        {canMutate ? (
          <HostListingsForm
            editing={editing}
            actionError={actionError}
            saving={saving}
            onCancel={() => setEditing(null)}
            onSubmit={handleSubmit}
          />
        ) : (
          <HostListingsEmptyState
            message="Connect EXPO_PUBLIC_API_URL to create and edit listings."
          />
        )}

        {isLoading && listings.length === 0 ? (
          <HostListingsEmptyState loading />
        ) : null}

        <LandlordListingsTabs
          listings={listings}
          canMutate={canMutate}
          isLoading={isLoading}
          onEdit={setEditing}
          onDelete={(l) => setConfirmDeleteId(l.id)}
          onTogglePause={handleTogglePause}
          palette={palette}
        />
      </ScrollView>

      <DeleteConfirmDialog
        visible={confirmDeleteId !== null}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { fontSize: 14 },
  primaryButton: { marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
  secondaryButton: { marginTop: 10, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { fontWeight: '800', fontSize: 16 },
  kpiCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, gap: 2, alignItems: 'center' },
  kpiValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  kpiLabel: { fontSize: 12, fontWeight: '700' },
  noticeBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  noticeBannerText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.02, flexShrink: 1 },
});
