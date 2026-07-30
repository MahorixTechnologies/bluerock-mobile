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
import { useAuth } from '@/providers/AuthProvider';

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

            <Pressable
              disabled={!canSubmit}
              onPress={async () => {
                setError(null);
                try {
                  await login({ email: email.trim(), password });
                  router.replace('/(tabs)');
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
});
