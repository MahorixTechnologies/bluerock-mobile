import { SymbolView } from 'expo-symbols';
import { Href, Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/inputs';
import { symbol } from '@/components/inputs/symbols';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';

function initialsFor(nameOrEmail: string): string {
  const clean = nameOrEmail.trim() || 'U';
  const parts = clean.split(/[\s@]/).filter(Boolean).slice(0, 2);
  return parts.map((p) => (p[0]?.toUpperCase() ?? '')).join('') || 'U';
}

function roleLabel(role: 'RENTER' | 'LANDLORD' | 'ADMIN' | string): string {
  if (role === 'LANDLORD') return 'Host';
  if (role === 'ADMIN') return 'Admin';
  return 'Guest';
}

function SectionEyebrow({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.cardHeader}>
      <SymbolView name={symbol(icon)} size={13} tintColor={color} weight="bold" />
      <Text style={[styles.cardEyebrow, { color }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { status, profile, logout, updateProfile, applyForLandlord } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile?.name, profile?.phone]);

  if (status === 'loading') {
    return (
      <View style={[styles.screenFlex, { backgroundColor: palette.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: palette.muted }]}>Loading account…</Text>
      </View>
    );
  }

  if (status !== 'signedIn' || !profile) {
    return (
      <ScrollView
        style={{ backgroundColor: palette.bg, flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: palette.bg, paddingBottom: 80 },
        ]}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={false}>
        <Text style={[styles.title, { color: palette.text }]}>Manage your BlueRock account</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Log in to view your profile, bookings, and host details.
        </Text>

        <Link href="/(auth)/login" asChild>
          <Button style={{ marginTop: 16 }}>Log In</Button>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Button variant="secondary" style={{ marginTop: 10 }}>Create account</Button>
        </Link>
      </ScrollView>
    );
  }

  const initials = initialsFor(profile.name?.trim() || profile.email);
  const rLabel = roleLabel(profile.role);

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg, flex: 1 }}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.bg, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={true}
      bounces={true}
      alwaysBounceVertical={false}>
      {/* 1. Page Header */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: palette.text }]}>Account</Text>
        <Text style={[styles.subtitle, { color: palette.muted, marginTop: 2 }]}>
          Manage your profile and booking settings.
        </Text>
      </View>

      {/* 2. Identity Summary + 3. Role & Verification State */}
      <View style={[styles.identityCard, { backgroundColor: palette.primary, shadowColor: palette.shadow }]}>
        <View style={styles.identityTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Link href="/settings" asChild>
            <Pressable
              hitSlop={10}
              style={({ pressed }) => [styles.heroSettingsButton, { opacity: pressed ? 0.7 : 1 }]}>
              <SymbolView
                name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' } as any}
                size={17}
                tintColor="#ffffff"
                weight="semibold"
              />
            </Pressable>
          </Link>
        </View>

        <Text style={styles.identityName} numberOfLines={1}>
          {profile.name?.trim() || 'Your name'}
        </Text>
        <Text style={styles.identityEmail} numberOfLines={1}>
          {profile.email}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{rLabel}</Text>
          </View>
          <View style={styles.heroBadge}>
            <SymbolView
              name={
                {
                  ios: profile.emailVerified ? 'checkmark.seal.fill' : 'exclamationmark.triangle.fill',
                  android: profile.emailVerified ? 'verified' : 'warning',
                  web: 'info',
                } as any
              }
              size={12}
              tintColor="#ffffff"
            />
            <Text style={styles.heroBadgeText}>
              {profile.emailVerified ? 'Email verified' : 'Verification pending'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3 continued. Verification helper copy */}
      {!profile.emailVerified ? (
        <View style={[styles.card, { backgroundColor: palette.warningSoft, borderColor: palette.warning }]}>
          <SectionEyebrow icon="exclamationmark.triangle.fill" label="EMAIL STATUS" color={palette.warning} />
          <Text style={[styles.cardLabel, { color: palette.text }]}>Verification pending</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            Verify your account to unlock trusted marketplace features.
          </Text>
          <Button variant="secondary" onPress={() => router.push('/verify-email')} style={{ marginTop: 4 }}>
            Request verification email
          </Button>
        </View>
      ) : null}

      {/* 4. Personal Details Form */}
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <SectionEyebrow icon="person.crop.circle.fill" label="PERSONAL DETAILS" color={palette.primary} />
        <Text style={[styles.cardLabel, { color: palette.text }]}>Your information</Text>
        <Text style={[styles.meta, { color: palette.muted }]}>
          This information appears on your bookings and host communications.
        </Text>

        <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" leftIcon="person" />

        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
          leftIcon="phone"
        />

        <View
          style={[
            styles.readOnlyField,
            { backgroundColor: palette.field, borderColor: palette.border },
          ]}>
          <View style={{ gap: 2 }}>
            <Text style={[styles.readOnlyLabel, { color: palette.muted }]}>Email address</Text>
            <Text style={[styles.readOnlyValue, { color: palette.text }]}>{profile.email}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: palette.successSoft }]}>
            <Text style={[styles.badgeText, { color: palette.success }]}>
              {profile.emailVerified ? 'Verified' : 'Read only'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.readOnlyField,
            { backgroundColor: palette.field, borderColor: palette.border },
          ]}>
          <View style={{ gap: 2 }}>
            <Text style={[styles.readOnlyLabel, { color: palette.muted }]}>Account role</Text>
            <Text style={[styles.readOnlyValue, { color: palette.text }]}>{rLabel}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
            <Text style={[styles.badgeText, { color: palette.primary }]}>{profile.role}</Text>
          </View>
        </View>

        {saved ? (
          <View style={[styles.inlineBanner, { backgroundColor: palette.successSoft }]}>
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as any}
              size={16}
              tintColor={palette.success}
            />
            <Text style={[styles.inlineBannerText, { color: palette.success }]}>
              Profile updated successfully.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.inlineBanner, { backgroundColor: palette.dangerSoft }]}>
            <SymbolView
              name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' } as any}
              size={16}
              tintColor={palette.danger}
            />
            <Text style={[styles.inlineBannerText, { color: palette.danger }]}>{error}</Text>
          </View>
        ) : null}

        <Button
          disabled={saving}
          loading={saving}
          onPress={async () => {
            setSaved(false);
            setError(null);
            setSaving(true);
            try {
              await updateProfile({ name: name.trim(), phone: phone.trim() });
              setSaved(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : "We couldn't save your changes. Please try again.");
            } finally {
              setSaving(false);
            }
          }}>
          Save changes
        </Button>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <SectionEyebrow icon="lock.fill" label="SECURITY" color={palette.primary} />
        <Text style={[styles.cardLabel, { color: palette.text }]}>Password</Text>
        <Text style={[styles.meta, { color: palette.muted }]}>
          In-app password changes aren't available yet. Use the email recovery flow to set a new
          password instead — it's the same secure process as signing in from a new device.
        </Text>
        <Link href="/(auth)/forgot-password" asChild>
          <Button variant="secondary">Reset password by email</Button>
        </Link>
      </View>

      {profile.role === 'RENTER' ? (
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <SectionEyebrow icon="house.fill" label="HOSTING" color={palette.primary} />
          <Text style={[styles.cardLabel, { color: palette.text }]}>Become a landlord</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            Apply to list your own properties. Once approved, log out and back in to unlock your
            landlord tools.
          </Text>

          {profile.ownerApplicationStatus === 'PENDING' ? (
            <View style={[styles.inlineBanner, { backgroundColor: palette.warningSoft }]}>
              <SymbolView
                name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' } as any}
                size={16}
                tintColor={palette.warning}
              />
              <Text style={[styles.inlineBannerText, { color: palette.warning }]}>
                Application submitted — pending admin review.
              </Text>
            </View>
          ) : profile.ownerApplicationStatus === 'APPROVED' ? (
            <View style={[styles.inlineBanner, { backgroundColor: palette.successSoft }]}>
              <SymbolView
                name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' } as any}
                size={16}
                tintColor={palette.success}
              />
              <Text style={[styles.inlineBannerText, { color: palette.success }]}>
                Approved! Log out and back in to access your new landlord tools.
              </Text>
            </View>
          ) : (
            <>
              {profile.ownerApplicationStatus === 'REJECTED' ? (
                <View style={[styles.inlineBanner, { backgroundColor: palette.dangerSoft }]}>
                  <Text style={[styles.inlineBannerText, { color: palette.danger }]}>
                    Your previous application was rejected. You can apply again below.
                  </Text>
                </View>
              ) : null}
              {applyError ? (
                <View style={[styles.inlineBanner, { backgroundColor: palette.dangerSoft }]}>
                  <Text style={[styles.inlineBannerText, { color: palette.danger }]}>{applyError}</Text>
                </View>
              ) : null}
              <Button
                variant="secondary"
                disabled={applying}
                loading={applying}
                onPress={async () => {
                  setApplyError(null);
                  setApplying(true);
                  try {
                    await applyForLandlord();
                  } catch (e) {
                    setApplyError(e instanceof Error ? e.message : 'Failed to submit application.');
                  } finally {
                    setApplying(false);
                  }
                }}>
                Apply to become a landlord
              </Button>
            </>
          )}
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <SectionEyebrow icon="square.grid.2x2.fill" label="SHORTCUTS" color={palette.primary} />
        <Text style={[styles.cardLabel, { color: palette.text }]}>Account actions</Text>

        {profile.role !== 'LANDLORD' ? (
          <Link href="/(tabs)/bookings" asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={[styles.rowLink, { borderTopWidth: 0, opacity: pressed ? 0.7 : 1 }]}>
                  <View style={[styles.rowGlyph, { backgroundColor: palette.primarySoft }]}>
                    <SymbolView
                      name={{ ios: 'calendar', android: 'date_range', web: 'date_range' } as any}
                      size={18}
                      tintColor={palette.primary}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={[styles.rowLinkTitle, { color: palette.text }]}>My bookings</Text>
                    <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                      View upcoming and past stays.
                    </Text>
                  </View>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                    size={18}
                    tintColor={palette.muted}
                  />
                </View>
              )}
            </Pressable>
          </Link>
        ) : null}

        {profile.role !== 'LANDLORD' ? (
          <Link href={'/saved-listings' as Href} asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={[styles.rowLink, { borderTopColor: palette.border, opacity: pressed ? 0.7 : 1 }]}>
                  <View style={[styles.rowGlyph, { backgroundColor: palette.dangerSoft }]}>
                    <SymbolView
                      name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' } as any}
                      size={18}
                      tintColor={palette.danger}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Saved listings</Text>
                    <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                      Listings you've favorited for later.
                    </Text>
                  </View>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                    size={18}
                    tintColor={palette.muted}
                  />
                </View>
              )}
            </Pressable>
          </Link>
        ) : null}

        {profile.role === 'LANDLORD' ? (
          <>
            <Link href="/(tabs)/host-listings" asChild>
              <Pressable>
                {({ pressed }) => (
                  <View style={[styles.rowLink, { borderTopWidth: 0, opacity: pressed ? 0.7 : 1 }]}>
                    <View style={[styles.rowGlyph, { backgroundColor: palette.primarySoft }]}>
                      <SymbolView
                        name={{ ios: 'house.lodge.fill', android: 'home', web: 'home' } as any}
                        size={18}
                        tintColor={palette.primary}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={[styles.rowLinkTitle, { color: palette.text }]}>My listings</Text>
                      <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                        Manage properties and nightly prices.
                      </Text>
                    </View>
                    <SymbolView
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                      size={18}
                      tintColor={palette.muted}
                    />
                  </View>
                )}
              </Pressable>
            </Link>

            <Link href="/(tabs)/host-bookings" asChild>
              <Pressable>
                {({ pressed }) => (
                  <View style={[styles.rowLink, { borderTopColor: palette.border, opacity: pressed ? 0.7 : 1 }]}>
                    <View style={[styles.rowGlyph, { backgroundColor: palette.successSoft }]}>
                      <SymbolView
                        name={{ ios: 'checklist', android: 'task', web: 'task' } as any}
                        size={18}
                        tintColor={palette.success}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Bookings</Text>
                      <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                        Approve, track, and review reservation requests.
                      </Text>
                    </View>
                    <SymbolView
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                      size={18}
                      tintColor={palette.muted}
                    />
                  </View>
                )}
              </Pressable>
            </Link>

            <Pressable style={({ pressed }) => [
              styles.rowLink,
              { borderTopColor: palette.border, opacity: pressed ? 0.7 : 1 },
            ]}>
              <View style={[styles.rowGlyph, { backgroundColor: palette.warningSoft }]}>
                <SymbolView
                  name={{ ios: 'creditcard.fill', android: 'payments', web: 'payments' } as any}
                  size={18}
                  tintColor={palette.warning}
                />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Payout setup</Text>
                <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                  Add a bank account for reservation payouts.
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
                <Text style={[styles.badgeText, { color: palette.primary }]}>Soon</Text>
              </View>
            </Pressable>
          </>
        ) : null}

        {!profile.emailVerified ? (
          <Pressable
            onPress={() => router.push('/verify-email')}
            style={({ pressed }) => [
              styles.rowLink,
              { borderTopColor: palette.border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <View style={[styles.rowGlyph, { backgroundColor: palette.warningSoft }]}>
              <SymbolView
                name={{ ios: 'envelope.badge', android: 'mark_email_unread', web: 'mark_email_unread' } as any}
                size={18}
                tintColor={palette.warning}
              />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Verify email</Text>
              <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                Send the verification link again.
              </Text>
            </View>
            <SymbolView
              name={{ ios: 'paperplane.fill', android: 'send', web: 'send' } as any}
              size={18}
              tintColor={palette.warning}
            />
          </Pressable>
        ) : null}

        <Link href="/settings" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.rowLink, { borderTopColor: palette.border, opacity: pressed ? 0.7 : 1 }]}>
                <View style={[styles.rowGlyph, { backgroundColor: palette.primarySoft }]}>
                  <SymbolView
                    name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' } as any}
                    size={18}
                    tintColor={palette.primary}
                  />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Settings</Text>
                  <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                    Notification preferences and app appearance.
                  </Text>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                  size={18}
                  tintColor={palette.muted}
                />
              </View>
            )}
          </Pressable>
        </Link>

        <Pressable style={({ pressed }) => [
              styles.rowLink,
              { borderTopColor: palette.border, opacity: pressed ? 0.7 : 1 },
            ]}>
          <View style={[styles.rowGlyph, { backgroundColor: palette.primarySoft }]}>
            <SymbolView
              name={{ ios: 'bell.badge', android: 'notifications_active', web: 'notifications_active' } as any}
              size={18}
              tintColor={palette.primary}
            />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Notifications</Text>
            <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
              Booking reminders and marketing.
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
            <Text style={[styles.badgeText, { color: palette.primary }]}>Soon</Text>
          </View>
        </Pressable>
      </View>

      {/* 5 continued. Danger zone */}
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.danger }]}>
        <SectionEyebrow icon="exclamationmark.triangle.fill" label="DANGER ZONE" color={palette.danger} />
        <Text style={[styles.cardLabel, { color: palette.text }]}>Session</Text>
        <Text style={[styles.meta, { color: palette.muted }]}>
          Ending your session will clear local credentials on this device.
        </Text>
        <Button variant="danger" onPress={logout}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenFlex: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingText: { fontSize: 14, fontWeight: '600' },
  titleRow: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 2, fontSize: 14 },
  identityCard: {
    borderRadius: 28,
    padding: 20,
    gap: 12,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  identityTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroSettingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#ffffff' },
  identityName: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  identityEmail: { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: -6 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroBadgeText: { fontSize: 11, fontWeight: '800', color: '#ffffff' },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  cardLabel: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 13, lineHeight: 19 },
  metaSmall: { fontSize: 12 },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  readOnlyLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  readOnlyValue: { fontSize: 14, fontWeight: '600' },
  inlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineBannerText: { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 18 },
  rowLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  rowGlyph: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLinkTitle: { fontSize: 15, fontWeight: '800' },
  rowLinkMeta: { fontSize: 12, lineHeight: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

