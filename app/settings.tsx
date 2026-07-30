import Constants from 'expo-constants';
import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppPalette } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/providers/SettingsProvider';

export default function SettingsScreen() {
  const { palette, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status, profile, logout, markEmailVerified } = useAuth();
  const { settings, setSetting } = useSettings();

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const signedIn = status === 'signedIn' && !!profile;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' } as any}
            size={18}
            tintColor={palette.text}
            weight="semibold"
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Section palette={palette} title="Notifications">
          <ToggleRow
            palette={palette}
            icon="bell.fill"
            androidIcon="notifications"
            label="Push notifications"
            hint="Booking updates and messages on this device"
            value={settings.pushNotifications}
            onChange={(v) => setSetting('pushNotifications', v)}
          />
          <Divider palette={palette} />
          <ToggleRow
            palette={palette}
            icon="envelope.fill"
            androidIcon="email"
            label="Email notifications"
            hint="Receipts and confirmations by email"
            value={settings.emailNotifications}
            onChange={(v) => setSetting('emailNotifications', v)}
          />
          <Divider palette={palette} />
          <ToggleRow
            palette={palette}
            icon="calendar"
            androidIcon="event"
            label="Booking reminders"
            hint="Reminders before your stay begins"
            value={settings.bookingReminders}
            onChange={(v) => setSetting('bookingReminders', v)}
          />
          <Divider palette={palette} />
          <ToggleRow
            palette={palette}
            icon="megaphone.fill"
            androidIcon="campaign"
            label="Promotions & offers"
            hint="Occasional deals and product news"
            value={settings.marketingEmails}
            onChange={(v) => setSetting('marketingEmails', v)}
          />
        </Section>

        <Section palette={palette} title="Preferences">
          <InfoRow
            palette={palette}
            icon={isDark ? 'moon.fill' : 'sun.max.fill'}
            androidIcon="brightness-6"
            label="Appearance"
            value={isDark ? 'Dark · follows system' : 'Light · follows system'}
          />
        </Section>

        {signedIn ? (
          <Section palette={palette} title="Account">
            <Link href="/(tabs)/profile" asChild>
              <NavRow palette={palette} icon="person.fill" androidIcon="person" label="Edit profile" />
            </Link>
            <Divider palette={palette} />
            {profile?.emailVerified ? (
              <InfoRow
                palette={palette}
                icon="checkmark.seal.fill"
                androidIcon="verified"
                label="Email"
                value="Verified"
                valueColor={palette.success}
              />
            ) : (
              <ActionRow
                palette={palette}
                icon="exclamationmark.triangle.fill"
                androidIcon="warning"
                iconColor={palette.warning}
                label="Verify email"
                hint={profile?.email}
                onPress={markEmailVerified}
              />
            )}
          </Section>
        ) : null}

        <Section palette={palette} title="About">
          <InfoRow
            palette={palette}
            icon="info.circle.fill"
            androidIcon="info"
            label="App version"
            value={version}
          />
          <Divider palette={palette} />
          <InfoRow
            palette={palette}
            icon="shield.fill"
            androidIcon="security"
            label="Terms & privacy"
            value="BlueRock"
          />
        </Section>

        {signedIn ? (
          <Button variant="danger" onPress={logout} style={{ marginTop: 6 }}>
            Log Out
          </Button>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Section({
  palette,
  title,
  children,
}: {
  palette: AppPalette;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.muted }]}>{title.toUpperCase()}</Text>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        {children}
      </View>
    </View>
  );
}

function RowIcon({
  palette,
  icon,
  androidIcon,
  tint,
}: {
  palette: AppPalette;
  icon: string;
  androidIcon: string;
  tint?: string;
}) {
  return (
    <View style={[styles.rowIcon, { backgroundColor: palette.primarySoft }]}>
      <SymbolView
        name={{ ios: icon, android: androidIcon, web: androidIcon } as any}
        size={16}
        tintColor={tint ?? palette.primary}
        weight="semibold"
      />
    </View>
  );
}

function ToggleRow({
  palette,
  icon,
  androidIcon,
  label,
  hint,
  value,
  onChange,
}: {
  palette: AppPalette;
  icon: string;
  androidIcon: string;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <RowIcon palette={palette} icon={icon} androidIcon={androidIcon} />
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: palette.text }]}>{label}</Text>
        {hint ? <Text style={[styles.rowHint, { color: palette.muted }]}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: palette.soft, true: palette.primary }}
        thumbColor="#ffffff"
        ios_backgroundColor={palette.soft}
      />
    </View>
  );
}

function InfoRow({
  palette,
  icon,
  androidIcon,
  label,
  value,
  valueColor,
}: {
  palette: AppPalette;
  icon: string;
  androidIcon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <RowIcon palette={palette} icon={icon} androidIcon={androidIcon} />
      <Text style={[styles.rowLabel, { color: palette.text, flex: 1 }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? palette.muted }]}>{value}</Text>
    </View>
  );
}

function NavRow({
  palette,
  icon,
  androidIcon,
  label,
  onPress,
}: {
  palette: AppPalette;
  icon: string;
  androidIcon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      <RowIcon palette={palette} icon={icon} androidIcon={androidIcon} />
      <Text style={[styles.rowLabel, { color: palette.text, flex: 1 }]}>{label}</Text>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' } as any}
        size={14}
        tintColor={palette.muted}
        weight="semibold"
      />
    </Pressable>
  );
}

function ActionRow({
  palette,
  icon,
  androidIcon,
  iconColor,
  label,
  hint,
  onPress,
}: {
  palette: AppPalette;
  icon: string;
  androidIcon: string;
  iconColor?: string;
  label: string;
  hint?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      <RowIcon palette={palette} icon={icon} androidIcon={androidIcon} tint={iconColor} />
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: palette.text }]}>{label}</Text>
        {hint ? <Text style={[styles.rowHint, { color: palette.muted }]}>{hint}</Text> : null}
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' } as any}
        size={14}
        tintColor={palette.muted}
        weight="semibold"
      />
    </Pressable>
  );
}

function Divider({ palette }: { palette: AppPalette }) {
  return <View style={[styles.divider, { backgroundColor: palette.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 22 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, marginLeft: 4 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowHint: { fontSize: 12, lineHeight: 16 },
  rowValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginLeft: 46 },
});
