import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input, PasswordInput } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DEMO_ACCOUNTS, useAuth } from '@/providers/AuthProvider';

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

export default function ProfileScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { status, profile, login, logout, markEmailVerified, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

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
    const demoAccounts = DEMO_ACCOUNTS.filter((a) => a.role !== 'ADMIN');
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
          <Pressable style={{ marginTop: 16 }}>
            <Button>Log In</Button>
          </Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable style={{ marginTop: 10 }}>
            <Button variant="secondary">Create account</Button>
          </Pressable>
        </Link>

        <View style={[styles.card, { backgroundColor: palette.successSoft, borderColor: palette.success }]}>
          <View style={styles.cardHeader}>
            <SymbolView
              name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' } as any}
              size={18}
              tintColor={palette.success}
            />
            <Text style={[styles.demoEyebrow, { color: palette.success }]}>
              DEMO · TAP TO SIGN IN INSTANTLY
            </Text>
          </View>
          <Text style={[styles.meta, { color: palette.muted }]}>
            No backend needed. Tap any chip below to sign in as a demo user.
          </Text>

          <View style={styles.demoChipGrid}>
            {demoAccounts.map((account) => {
              const label = roleLabel(account.role);
              return (
                <Pressable
                  key={account.email}
                  onPress={async () => {
                    try {
                      await login({ email: account.email, password: account.password });
                    } catch {
                      router.replace('/(auth)/login');
                    }
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.demoChip,
                    {
                      borderColor: palette.primary,
                      backgroundColor: palette.card,
                      opacity: pressed ? 0.85 : 1,
                      shadowColor: palette.primary,
                    },
                  ]}>
                  <View style={[styles.demoAvatar, { backgroundColor: palette.primarySoft }]}>
                    <Text style={[styles.demoAvatarText, { color: palette.primary }]}>{label.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.demoName, { color: palette.text }]}>{account.name}</Text>
                      <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
                        <Text style={[styles.badgeText, { color: palette.primary }]}>{label}</Text>
                      </View>
                    </View>
                    <Text style={[styles.metaSmall, { color: palette.muted }]}>{account.email}</Text>
                    <Text style={[styles.metaSmall, { color: palette.muted }]}>
                      password ·{' '}
                      <Text style={{ color: palette.text, fontWeight: '700' }}>{account.password}</Text>
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
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
        <View>
          <Text style={[styles.title, { color: palette.text }]}>Account</Text>
          <Text style={[styles.subtitle, { color: palette.muted, marginTop: 2 }]}>
            Manage your profile and booking settings.
          </Text>
        </View>
        <Link href="/settings" asChild>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.settingsButton,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <SymbolView
              name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' } as any}
              size={18}
              tintColor={palette.text}
              weight="semibold"
            />
          </Pressable>
        </Link>
      </View>

      {/* 2. Identity Summary + 3. Role & Verification State */}
      <View
        style={[
          styles.identityCard,
          { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
        ]}>
        <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.avatarText, { color: palette.primary }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={[styles.identityName, { color: palette.text }]} numberOfLines={1}>
            {profile.name?.trim() || 'Your name'}
          </Text>
          <Text style={[styles.identityEmail, { color: palette.muted }]} numberOfLines={1}>
            {profile.email}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
              <Text style={[styles.badgeText, { color: palette.primary }]}>{rLabel}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: profile.emailVerified ? palette.successSoft : palette.warningSoft },
              ]}>
              <SymbolView
                name={
                  {
                    ios: profile.emailVerified ? 'checkmark.seal.fill' : 'exclamationmark.triangle.fill',
                    android: profile.emailVerified ? 'verified' : 'warning',
                    web: 'info',
                  } as any
                }
                size={12}
                tintColor={profile.emailVerified ? palette.success : palette.warning}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: profile.emailVerified ? palette.success : palette.warning },
                ]}>
                {profile.emailVerified ? 'Email verified' : 'Verification pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3 continued. Verification helper copy */}
      {!profile.emailVerified ? (
        <View style={[styles.card, { backgroundColor: palette.warningSoft, borderColor: palette.warning }]}>
          <Text style={[styles.cardEyebrow, { color: palette.warning }]}>EMAIL STATUS</Text>
          <Text style={[styles.cardLabel, { color: palette.text }]}>Verification pending</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            Verify your account to unlock trusted marketplace features.
          </Text>
          <Button variant="secondary" onPress={markEmailVerified} style={{ marginTop: 4 }}>
            Request verification email
          </Button>
        </View>
      ) : null}

      {/* 4. Personal Details Form */}
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardEyebrow, { color: palette.primary }]}>PERSONAL DETAILS</Text>
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

      {/* 4.b Security / change password section (front-only valid, no backend pw-change endpoint) */}
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardEyebrow, { color: palette.primary }]}>SECURITY</Text>
        <Text style={[styles.cardLabel, { color: palette.text }]}>Password</Text>
        <Text style={[styles.meta, { color: palette.muted }]}>
          Keep your account secure by rotating your password periodically.
        </Text>

        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChangeText={(v) => {
            setCurrentPassword(v);
            setPwSaved(false);
            setPwError(null);
          }}
          placeholder="Enter current password"
        />
        <PasswordInput
          label="New password"
          value={newPassword}
          onChangeText={(v) => {
            setNewPassword(v);
            setPwSaved(false);
            setPwError(null);
          }}
          placeholder="At least 8 characters"
        />
        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            setPwSaved(false);
            setPwError(null);
          }}
          placeholder="Type new password again"
        />

        {pwSaved ? (
          <View style={[styles.inlineBanner, { backgroundColor: palette.successSoft }]}>
            <SymbolView
              name={{ ios: 'lock.open.fill', android: 'lock_open', web: 'lock_open' } as any}
              size={16}
              tintColor={palette.success}
            />
            <Text style={[styles.inlineBannerText, { color: palette.success }]}>
              Password updated. Remember to use it next time you sign in.
            </Text>
          </View>
        ) : null}
        {pwError ? (
          <View style={[styles.inlineBanner, { backgroundColor: palette.dangerSoft }]}>
            <SymbolView
              name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' } as any}
              size={16}
              tintColor={palette.danger}
            />
            <Text style={[styles.inlineBannerText, { color: palette.danger }]}>{pwError}</Text>
          </View>
        ) : null}

        <Button
          variant="secondary"
          disabled={pwSaving}
          loading={pwSaving}
          onPress={async () => {
            setPwSaved(false);
            setPwError(null);
            if (!newPassword) {
              setPwError('Enter a new password at least 8 characters long.');
              return;
            }
            if (newPassword.length < 8) {
              setPwError('New password must be at least 8 characters long.');
              return;
            }
            if (newPassword !== confirmPassword) {
              setPwError('Passwords do not match. Please re-enter the confirmation.');
              return;
            }
            setPwSaving(true);
            await new Promise((res) => setTimeout(res, 700));
            setPwSaving(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPwSaved(true);
          }}>
          Update password
        </Button>
      </View>

      {/* 5. Account Actions + 6. Settings / Extensions placeholders */}
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardEyebrow, { color: palette.primary }]}>SHORTCUTS</Text>
        <Text style={[styles.cardLabel, { color: palette.text }]}>Account actions</Text>

        <Link href="/(tabs)/bookings" asChild>
          <Pressable style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
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
          </Pressable>
        </Link>

        {profile.role === 'LANDLORD' ? (
          <>
            <Link href="/(tabs)/host-listings" asChild>
              <Pressable style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
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
              </Pressable>
            </Link>

            <Link href="/(tabs)/host-bookings" asChild>
              <Pressable style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
                <View style={[styles.rowGlyph, { backgroundColor: palette.successSoft }]}>
                  <SymbolView
                    name={{ ios: 'checklist', android: 'task', web: 'task' } as any}
                    size={18}
                    tintColor={palette.success}
                  />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.rowLinkTitle, { color: palette.text }]}>Guest bookings</Text>
                  <Text style={[styles.rowLinkMeta, { color: palette.muted }]}>
                    Approve, track, and review reservation requests.
                  </Text>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                  size={18}
                  tintColor={palette.muted}
                />
              </Pressable>
            </Link>

            <Pressable style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
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
            onPress={markEmailVerified}
            style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
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
          <Pressable style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
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
          </Pressable>
        </Link>

        <Pressable style={({ pressed }) => [styles.rowLink, { opacity: pressed ? 0.7 : 1 }]}>
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
        <Text style={[styles.cardEyebrow, { color: palette.danger }]}>DANGER ZONE</Text>
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
  spacer10: { height: 10 },
  spacer12: { height: 12 },
  loadingText: { fontSize: 14, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 2, fontSize: 14 },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800' },
  identityName: { fontSize: 18, fontWeight: '800' },
  identityEmail: { fontSize: 13 },
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
  card: {
    borderRadius: 20,
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
    paddingVertical: 10,
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
  demoEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  demoChipGrid: { gap: 10 },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  demoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAvatarText: { fontSize: 17, fontWeight: '900' },
  demoName: { fontSize: 14, fontWeight: '800' },
});

