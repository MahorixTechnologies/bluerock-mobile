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

import { Input, PasswordInput } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DEMO_ACCOUNTS, useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
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
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: palette.primary }]}>
          <View style={styles.brandMark}>
            <SymbolView
              name={{ ios: 'house.lodge.fill', android: 'home', web: 'home' } as any}
              size={30}
              tintColor="#ffffff"
            />
          </View>
          <Text style={styles.brandName}>BlueRock</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>Welcome back 👋</Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>
              Sign in to manage your properties, bookings, and account.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email address"
              size="lg"
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
              size="lg"
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
                  style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
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
                  size={16}
                  tintColor={palette.danger}
                />
                <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text>
              </View>
            ) : null}

            <View style={[styles.demoCard, { backgroundColor: palette.successSoft, borderColor: palette.success }]}>
              <View style={styles.demoCardHeader}>
                <SymbolView
                  name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' } as any}
                  size={18}
                  tintColor={palette.success}
                />
                <Text style={[styles.demoEyebrow, { color: palette.success }]}>
                  DEMO ACCOUNTS · TAP TO FILL
                </Text>
              </View>
              <Text style={[styles.demoSubtitle, { color: palette.muted }]}>
                No backend needed. Tap any chip below to sign in instantly.
              </Text>
              <View style={styles.demoChips}>
                {DEMO_ACCOUNTS.map((account) => {
                  const roleLabel =
                    account.role === 'ADMIN'
                      ? 'Admin'
                      : account.role === 'LANDLORD'
                      ? 'Host'
                      : 'Guest';
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
                          borderColor: palette.primary,
                          backgroundColor: '#ffffff',
                          opacity: pressed ? 0.85 : 1,
                          shadowColor: palette.primary,
                        },
                      ]}>
                      <View style={[styles.demoChipAvatar, { backgroundColor: palette.primarySoft }]}>
                        <Text style={[styles.demoChipAvatarText, { color: palette.primary }]}>
                          {roleLabel.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.demoChipBody}>
                        <View style={styles.demoChipTopRow}>
                          <Text style={[styles.demoChipName, { color: palette.text }]}>{account.name}</Text>
                          <Text style={[styles.demoChipRole, { backgroundColor: palette.primarySoft, color: palette.primary }]}>
                            {roleLabel}
                          </Text>
                        </View>
                        <Text style={[styles.demoChipEmail, { color: palette.muted }]}>{account.email}</Text>
                        <Text style={[styles.demoChipPw, { color: palette.muted }]}>
                          password · <Text style={{ color: palette.text, fontWeight: '700' }}>{account.password}</Text>
                        </Text>
                      </View>
                      <SymbolView
                        name={{ ios: 'arrow.right.circle.fill', android: 'arrow_circle_right', web: 'arrow_circle_right' } as any}
                        size={22}
                        tintColor={palette.primary}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
                  opacity: (canSubmit ? 1 : 0.55) * (pressed ? 0.92 : 1),
                  shadowColor: palette.primary,
                },
              ]}>
              <Text style={styles.primaryButtonText}>
                {status === 'loading' ? 'Signing in…' : 'Sign in'}
              </Text>
              {status !== 'loading' ? (
                <SymbolView
                  name={{ ios: 'arrow.right', android: 'arrow-forward', web: 'arrow-forward' } as any}
                  size={18}
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
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { minHeight: '100%', paddingBottom: 32 },
  hero: {
    height: 180,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 24,
  },
  brandMark: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: '#ffffff', fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  body: { paddingHorizontal: 24 },
  header: { marginTop: 28, gap: 8 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '800' },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { marginTop: 26, gap: 18 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rememberWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rememberText: { fontSize: 14, fontWeight: '500' },
  linkText: { fontSize: 14, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { fontSize: 14, lineHeight: 20, flex: 1 },
  primaryButton: {
    minHeight: 56,
    marginTop: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: { fontSize: 14 },
  demoCard: {
    marginTop: 4,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  demoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  demoEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  demoSubtitle: { fontSize: 13, lineHeight: 18 },
  demoChips: { gap: 10 },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  demoChipAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoChipAvatarText: { fontSize: 16, fontWeight: '900' },
  demoChipBody: { flex: 1, gap: 2 },
  demoChipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demoChipName: { fontSize: 14, fontWeight: '800' },
  demoChipRole: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    letterSpacing: 0.3,
  },
  demoChipEmail: { fontSize: 12, fontWeight: '600' },
  demoChipPw: { fontSize: 12 },
});
