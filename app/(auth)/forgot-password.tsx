import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Input, PasswordInput } from '@/components/inputs';
import { Text, useThemeColor, View } from '@/components/Themed';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';

type ResetStep = 'request' | 'reset';

function getPasswordChecks(password: string) {
  return [
    { label: 'Minimum of 8 characters', passed: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', passed: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', passed: /\d/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { requestPasswordReset } = useAuth();
  const [step, setStep] = useState<ResetStep>('request');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({ light: '#1f2937', dark: '#f8fafc' }, 'text');
  const mutedText = useThemeColor(
    { light: '#6b7280', dark: 'rgba(226,232,240,0.72)' },
    'text',
  );
  const borderColor = useThemeColor(
    { light: 'rgba(15,23,42,0.08)', dark: 'rgba(255,255,255,0.12)' },
    'text',
  );
  const inputBackground = useThemeColor({ light: '#f8fafc', dark: '#111827' }, 'background');

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const canSubmit = email.trim().length > 0 && status !== 'sending';
  const canReset =
    passwordChecks.every((item) => item.passed) &&
    confirmPassword.length > 0 &&
    confirmPassword === password;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setError(null);
            if (step === 'reset') {
              setStep('request');
              return;
            }
            router.back();
          }}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: inputBackground,
              borderColor,
              opacity: pressed ? 0.82 : 1,
            },
          ]}>
          <Text style={[styles.backIcon, { color: textColor }]}>‹</Text>
        </Pressable>

        <View style={styles.iconWrap} lightColor="transparent" darkColor="transparent">
          <View style={styles.iconHalo} lightColor="#e7f0ff" darkColor="#16325e">
            <View style={styles.iconCore} lightColor="#2f6bff" darkColor="#2f6bff">
              <SymbolView
                name={{ ios: 'lock.fill', android: 'lock', web: 'lock' } as any}
                size={36}
                tintColor="#ffffff"
              />
            </View>
          </View>
        </View>

        <View style={styles.header} lightColor="transparent" darkColor="transparent">
          <Text style={[styles.title, { color: palette.text }]}>
            {step === 'request' ? 'Forgot Password?' : 'Reset Password?'}
          </Text>
          <Text style={[styles.subtitle, { color: mutedText }]}>
            {step === 'request'
              ? 'Enter your email and we’ll send you a secure recovery link'
              : 'Create a strong new password for your account'}
          </Text>
        </View>

        {step === 'request' ? (
          <>
            <View
              style={[styles.segmentRow, { backgroundColor: inputBackground, borderColor }]}
              lightColor="transparent"
              darkColor="transparent">
              <Pressable
                onPress={() => setMethod('email')}
                style={({ pressed }) => [
                  styles.segmentButton,
                  method === 'email' ? [styles.segmentActive, { backgroundColor: palette.primary }] : null,
                  { opacity: pressed ? 0.92 : 1 },
                ]}>
                <SymbolView
                  name={{ ios: 'envelope.fill', android: 'email', web: 'email' } as any}
                  size={16}
                  tintColor={method === 'email' ? '#ffffff' : mutedText}
                />
                <Text style={[styles.segmentLabel, { color: method === 'email' ? '#ffffff' : mutedText }]}>Email</Text>
              </Pressable>
              <Pressable
                onPress={() => setMethod('phone')}
                style={({ pressed }) => [
                  styles.segmentButton,
                  method === 'phone' ? [styles.segmentActive, { backgroundColor: palette.primary }] : null,
                  { opacity: pressed ? 0.92 : 1 },
                ]}>
                <SymbolView
                  name={{ ios: 'phone.fill', android: 'phone', web: 'phone' } as any}
                  size={16}
                  tintColor={method === 'phone' ? '#ffffff' : mutedText}
                />
                <Text style={[styles.segmentLabel, { color: method === 'phone' ? '#ffffff' : mutedText }]}>Phone</Text>
              </Pressable>
            </View>

            <View style={styles.form} lightColor="transparent" darkColor="transparent">
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                editable={method === 'email'}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="Enter your email"
                leftIcon="envelope"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                disabled={!canSubmit || method !== 'email'}
                onPress={async () => {
                  if (method !== 'email') return;
                  setError(null);
                  setStatus('sending');
                  try {
                    await requestPasswordReset(email.trim());
                    setStatus('sent');
                    setStep('reset');
                  } catch (e: any) {
                    setStatus('error');
                    setError(e?.message ?? 'Failed to send reset link');
                  }
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: canSubmit && method === 'email' ? '#2563eb' : '#89a8f3',
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={styles.primaryButtonText}>
                  {status === 'sending' ? 'Sending Recovery Link...' : 'Send Recovery Link  →'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.footerRow} lightColor="transparent" darkColor="transparent">
              <Text style={[styles.footerText, { color: mutedText }]}>Remember your password?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.linkText}>Back to Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </>
        ) : null}

        {step === 'reset' ? (
          <View style={styles.form} lightColor="transparent" darkColor="transparent">
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              leftIcon="lock"
            />

            <View
              style={[styles.rulesCard, { borderColor, backgroundColor: inputBackground }]}
              lightColor="transparent"
              darkColor="transparent">
              {passwordChecks.map((item) => (
                <View key={item.label} style={styles.ruleRow} lightColor="transparent" darkColor="transparent">
                  <View
                    style={[
                      styles.ruleIconWrap,
                      { backgroundColor: item.passed ? '#d1fae5' : '#f8fafc' },
                    ]}
                    lightColor="transparent"
                    darkColor="transparent">
                    <Text style={[styles.ruleIcon, { color: item.passed ? '#16a34a' : '#d1d5db' }]}>
                      {item.passed ? '✓' : '✓'}
                    </Text>
                  </View>
                  <Text style={[styles.ruleText, { color: item.passed ? '#15803d' : mutedText }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="********"
              leftIcon="lock"
              error={
                confirmPassword.length > 0 && confirmPassword !== password
                  ? 'Passwords do not match.'
                  : null
              }
            />

            <Pressable
              disabled={!canReset}
              onPress={() => {
                setError(null);
                router.replace('/(auth)/login');
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: canReset ? '#89a8f3' : '#c8d4fb',
                  opacity: pressed ? 0.92 : 1,
                },
              ]}>
              <Text style={styles.primaryButtonText}>Reset Password  →</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  content: {
    minHeight: '100%',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 32,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 8 : 0,
  },
  backIcon: {
    fontSize: 28,
    lineHeight: 28,
    marginTop: -2,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: 26,
  },
  iconHalo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  iconCore: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 38,
  },
  header: {
    marginTop: 26,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0b2466',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 270,
    textAlign: 'center',
  },
  segmentRow: {
    marginTop: 34,
    borderRadius: 14,
    borderWidth: 1,
    padding: 6,
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#2563eb',
  },
  segmentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  segmentLabelActive: {
    color: '#ffffff',
  },
  form: {
    marginTop: 20,
    gap: 18,
  },
  primaryButton: {
    minHeight: 56,
    marginTop: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2f6bff',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    lineHeight: 20,
  },
  rulesCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  ruleText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
