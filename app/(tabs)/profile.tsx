import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
  const { palette } = useAppTheme();
  const { status, profile, logout, markEmailVerified, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile?.name, profile?.phone]);

  if (status !== 'signedIn' || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <Text style={[styles.title, { color: palette.text }]}>Account</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Log in to manage your profile and bookings.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Button>Log In</Button>
          </Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Button variant="secondary" style={{ marginTop: 10 }}>
              Create account
            </Button>
          </Pressable>
        </Link>
      </View>
    );
  }

  const initials = (profile.name?.trim() || profile.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  const roleLabel = profile.role === 'LANDLORD' ? 'Landlord' : profile.role === 'ADMIN' ? 'Admin' : 'Renter';

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={[styles.container, { backgroundColor: palette.bg, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: palette.text }]}>Account</Text>
        <Link href="/settings" asChild>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.settingsButton,
              { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.7 : 1 },
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
      <Text style={[styles.subtitle, { color: palette.muted }]}>Manage your account information.</Text>

      <View
        style={[styles.identityCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
        <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.avatarText, { color: palette.primary }]}>{initials || 'U'}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.identityName, { color: palette.text }]} numberOfLines={1}>
            {profile.name?.trim() || 'Your name'}
          </Text>
          <Text style={[styles.identityEmail, { color: palette.muted }]} numberOfLines={1}>
            {profile.email}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
              <Text style={[styles.badgeText, { color: palette.primary }]}>{roleLabel}</Text>
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
                {profile.emailVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {!profile.emailVerified ? (
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.cardLabel, { color: palette.text }]}>Verify your email</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>
            Verify your email to unlock booking confirmations and payout features.
          </Text>
          <Button variant="secondary" onPress={markEmailVerified} style={{ marginTop: 6 }}>
            Verify email
          </Button>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.cardLabel, { color: palette.text }]}>Personal details</Text>

        <Input
          label="Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setSaved(false);
          }}
          placeholder="Your name"
          leftIcon="person"
        />

        <Input
          label="Phone"
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            setSaved(false);
          }}
          placeholder="Phone number"
          keyboardType="phone-pad"
          leftIcon="phone"
        />

        {saved ? <Text style={[styles.savedText, { color: palette.success }]}>Profile saved ✓</Text> : null}

        <Button
          disabled={saving}
          loading={saving}
          onPress={async () => {
            setSaving(true);
            try {
              await updateProfile({ name: name.trim(), phone: phone.trim() });
              setSaved(true);
            } finally {
              setSaving(false);
            }
          }}>
          Save profile
        </Button>
      </View>

      <Button variant="danger" onPress={logout}>
        Log Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 14, marginBottom: 4 },
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
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
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
  },
  cardLabel: { fontSize: 16, fontWeight: '800' },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  meta: { fontSize: 13, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  savedText: { fontSize: 13, fontWeight: '700' },
});
