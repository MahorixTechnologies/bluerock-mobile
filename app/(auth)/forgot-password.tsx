import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Input, PasswordInput } from '@/components/inputs';
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
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetStatus, setResetStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const canSubmit = email.trim().length > 0 && status !== 'sending';
  const canReset =
    passwordChecks.every((item) => item.passed) &&
    confirmPassword.length > 0 &&
    confirmPassword === password &&
    resetStatus !== 'saving';

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
              backgroundColor: palette.field,
              borderColor: palette.border,
              opacity: pressed ? 0.82 : 1,
            },
          ]}>
          <Text style={[styles.backIcon, { color: palette.text }]}>‹</Text>
        </Pressable>

        <View style={styles.iconWrap}>
          <View style={[styles.iconHalo, { backgroundColor: palette.primarySoft, borderColor: palette.border }]}>
            <View style={[styles.iconCore, { backgroundColor: palette.primary }]}>
              <SymbolView
                name={{ ios: 'lock.fill', android: 'lock', web: 'lock' } as any}
                size={36}
                tintColor={palette.onPrimary}
              />
            </View>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>
            {step === 'request' ? 'Forgot Password?' : 'Reset Password?'}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {step === 'request'
              ? 'Enter your email and we’ll send you a secure recovery link'
              : 'Create a strong new password for your account'}
          </Text>
        </View>

        {step === 'request' ? (
          <>
            <View style={styles.form}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="Enter your email"
                leftIcon="envelope"
              />

              {error ? <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text> : null}

              <Pressable
                disabled={!canSubmit}
                onPress={async () => {
                  setError(null);
                  setStatus('sending');
                  try {
                    const token = await requestPasswordReset(email.trim());
                    setResetToken(token);
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
                    backgroundColor: canSubmit ? palette.primary : palette.primarySoft,
                    shadowColor: palette.primary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
                  {status === 'sending' ? 'Sending Recovery Link...' : 'Send Recovery Link  →'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: palette.muted }]}>Remember your password?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={[styles.linkText, { color: palette.primary }]}>Back to Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </>
        ) : null}

        {step === 'reset' ? (
          <View style={styles.form}>
            {!resetToken ? (
              <View style={[styles.inlineBanner, { backgroundColor: palette.warningSoft }]}>
                <Text style={[styles.inlineBannerText, { color: palette.warning }]}>
                  If an account exists for that email, a reset link has been sent. Configure
                  EXPO_PUBLIC_API_URL to complete the reset in this app.
                </Text>
              </View>
            ) : null}

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              leftIcon="lock"
            />

            <View style={[styles.rulesCard, { borderColor: palette.border, backgroundColor: palette.field }]}>
              {passwordChecks.map((item) => (
                <View key={item.label} style={styles.ruleRow}>
                  <View
                    style={[
                      styles.ruleIconWrap,
                      { backgroundColor: item.passed ? palette.successSoft : palette.field },
                    ]}>
                    <Text style={[styles.ruleIcon, { color: item.passed ? palette.success : palette.placeholder }]}>
                      {item.passed ? '✓' : '✓'}
                    </Text>
                  </View>
                  <Text style={[styles.ruleText, { color: item.passed ? palette.success : palette.muted }]}>
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

            {resetStatus === 'error' && error ? (
              <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text>
            ) : null}

            <Pressable
              disabled={!canReset || !resetToken}
              onPress={async () => {
                if (!resetToken) return;
                setError(null);
                setResetStatus('saving');
                try {
                  await confirmPasswordReset({ token: resetToken, newPassword: password });
                  setResetStatus('done');
                  router.replace('/(auth)/login');
                } catch (e: any) {
                  setResetStatus('error');
                  setError(e?.message ?? 'Failed to reset password');
                }
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: canReset && resetToken ? palette.primary : palette.primarySoft,
                  shadowColor: palette.primary,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}>
              <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
                {resetStatus === 'saving' ? 'Resetting…' : 'Reset Password  →'}
              </Text>
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
  },
  iconCore: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 270,
    textAlign: 'center',
  },
  form: {
    marginTop: 34,
    gap: 18,
  },
  primaryButton: {
    minHeight: 56,
    marginTop: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: {
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
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
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
  inlineBanner: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineBannerText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
