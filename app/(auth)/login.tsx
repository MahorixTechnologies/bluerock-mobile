import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input, PasswordInput } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DEMO_ACCOUNTS, useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && status !== 'loading';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { backgroundColor: palette.primarySoft }]}>
            <SymbolView
              name={{ ios: 'house.lodge.fill', android: 'home', web: 'home' } as any}
              size={18}
              tintColor={palette.primary}
            />
          </View>
          <Text style={[styles.brandName, { color: palette.text }]}>BlueRock</Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Sign in to manage your properties, bookings, and account.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email address"
            size="md"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            placeholder="Enter your email"
            leftIcon="envelope"
          />

          <PasswordInput
            label="Password"
            size="md"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            leftIcon="lock"
          />

          <View style={styles.rowBetween}>
            <View style={styles.rememberWrap}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#d1d5db', true: palette.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor="#d1d5db"
                style={styles.switch}
              />
              <Text style={[styles.rememberText, { color: palette.muted }]}>Remember me</Text>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text style={[styles.linkText, { color: palette.primary }]}>Forgot password?</Text>
              </Pressable>
            </Link>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: palette.dangerSoft }]}>
              <SymbolView
                name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' } as any}
                size={15}
                tintColor={palette.danger}
              />
              <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            disabled={!canSubmit}
            onPress={async () => {
              setError(null);
              try {
                await login({ email: email.trim(), password });
                router.replace('/');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Login failed');
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: palette.primary,
                opacity: (canSubmit ? 1 : 0.5) * (pressed ? 0.92 : 1),
                shadowColor: palette.primary,
              },
            ]}>
            <Text style={styles.primaryButtonText}>
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </Text>
            {status !== 'loading' ? (
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow-forward', web: 'arrow-forward' } as any}
                size={16}
                tintColor="#ffffff"
                weight="semibold"
              />
            ) : null}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: palette.muted }]}>Don’t have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable hitSlop={8}>
                <Text style={[styles.linkText, { color: palette.primary }]}>Register</Text>
              </Pressable>
            </Link>
          </View>

          <View style={[styles.demoCard, { backgroundColor: palette.soft, borderColor: palette.border }]}>
            <View style={styles.demoCardHeader}>
              <SymbolView
                name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' } as any}
                size={14}
                tintColor={palette.primary}
              />
              <Text style={[styles.demoEyebrow, { color: palette.primary }]}>Demo accounts</Text>
            </View>
            <Text style={[styles.demoSubtitle, { color: palette.muted }]}>
              No backend needed — tap a card to sign in instantly.
            </Text>
            <View style={styles.demoChips}>
              {DEMO_ACCOUNTS.map((account) => {
                const roleLabel =
                  account.role === 'ADMIN' ? 'Admin' : account.role === 'LANDLORD' ? 'Host' : 'Guest';
                return (
                  <Pressable
                    key={account.email}
                    onPress={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      setError(null);
                    }}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.demoChip,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <View style={[styles.demoChipAvatar, { backgroundColor: palette.primarySoft }]}>
                      <Text style={[styles.demoChipAvatarText, { color: palette.primary }]}>
                        {roleLabel.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.demoChipBody}>
                      <Text style={[styles.demoChipName, { color: palette.text }]} numberOfLines={1}>
                        {roleLabel}
                      </Text>
                      <Text style={[styles.demoChipEmail, { color: palette.muted }]} numberOfLines={1}>
                        {account.email}
                      </Text>
                    </View>
                    <SymbolView
                      name={{ ios: 'arrow.right', android: 'arrow-forward', web: 'arrow-forward' } as any}
                      size={13}
                      tintColor={palette.muted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { minHeight: '100%', paddingHorizontal: 24, paddingBottom: 32 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 16, fontWeight: '800', letterSpacing: 0.1 },
  header: { marginTop: 28, gap: 6 },
  title: { fontSize: 25, lineHeight: 30, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  form: { marginTop: 24, gap: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rememberWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switch: { transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }] },
  rememberText: { fontSize: 13, fontWeight: '500' },
  linkText: { fontSize: 13, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { fontSize: 13, lineHeight: 18, flex: 1 },
  primaryButton: {
    minHeight: 50,
    marginTop: 4,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  footerRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: { fontSize: 13 },
  demoCard: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  demoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  demoEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  demoSubtitle: { fontSize: 12, lineHeight: 16 },
  demoChips: { gap: 8 },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  demoChipAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoChipAvatarText: { fontSize: 13, fontWeight: '900' },
  demoChipBody: { flex: 1, gap: 1 },
  demoChipName: { fontSize: 13, fontWeight: '700' },
  demoChipEmail: { fontSize: 11.5, fontWeight: '500' },
});
