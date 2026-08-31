import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input, PasswordInput } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';

type RegisterStep = 'details' | 'password';
type UserRole = 'RENTER' | 'LANDLORD';

function formatPhoneNumberForApi(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

function getPasswordChecks(password: string) {
  return [
    { label: 'Minimum of 8 characters', passed: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', passed: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', passed: /\d/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export default function RegisterScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { register, status } = useAuth();
  const [role, setRole] = useState<UserRole>('LANDLORD');
  const [step, setStep] = useState<RegisterStep>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cardAnimation = useRef(new Animated.Value(1)).current;

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const isPasswordValid = passwordChecks.every((item) => item.passed);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const canContinueDetails =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.replace(/\D/g, '').length >= 9;
  const canCreateAccount = isPasswordValid && passwordsMatch && status !== 'loading';

  useEffect(() => {
    cardAnimation.setValue(0);
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [cardAnimation, step]);

  const animatedCardStyle = {
    opacity: cardAnimation,
    transform: [
      {
        translateY: cardAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const handleBack = () => {
    setError(null);
    if (step === 'details') {
      router.back();
      return;
    }
    setStep('details');
  };

  const handleContinue = () => {
    setError(null);
    setStep('password');
  };

  const handleCreateAccount = async () => {
    if (!canCreateAccount) return;

    setError(null);

    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: formatPhoneNumberForApi(phone),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  const title = step === 'details' ? 'Create account' : 'Create a password';

  const subtitle =
    step === 'details'
      ? role === 'LANDLORD'
        ? 'Set up your homeowner account to start managing your properties.'
        : 'Set up your renter account to start booking and managing your stays.'
      : 'Secure your account with a strong password.';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: palette.field,
              borderColor: palette.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' } as any}
            size={16}
            tintColor={palette.text}
            weight="semibold"
          />
        </Pressable>

        <View style={styles.headerBlock}>
          {step === 'details' ? (
            <View style={styles.roleRow}>
              {(['LANDLORD', 'RENTER'] as UserRole[]).map((value) => {
                const active = role === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setRole(value)}
                    style={({ pressed }) => [
                      styles.roleChip,
                      {
                        borderColor: active ? palette.primary : palette.border,
                        backgroundColor: active ? palette.primarySoft : palette.field,
                        opacity: pressed ? 0.88 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.roleChipText,
                        { color: active ? palette.primary : palette.muted },
                      ]}>
                      {value === 'LANDLORD' ? 'Homeowner' : 'Renter'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>
        </View>

        <Animated.View style={[styles.card, animatedCardStyle]}>
          {step === 'details' ? (
            <View style={styles.formBlock}>
              <View style={styles.nameRow}>
                <Input
                  label="First name"
                  size="md"
                  containerStyle={styles.nameField}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  placeholder="First name"
                />
                <Input
                  label="Last name"
                  size="md"
                  containerStyle={styles.nameField}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  placeholder="Last name"
                />
              </View>

              <Input
                label="Email address"
                size="md"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="Enter your email"
                leftIcon="envelope"
              />

              <Input
                label="Phone number"
                size="md"
                value={phone}
                onChangeText={(value) => setPhone(value.replace(/[^\d]/g, '').slice(0, 10))}
                keyboardType="number-pad"
                placeholder="812 345 6789"
                leftAdornment={
                  <Text style={[styles.phonePrefixText, { color: palette.muted }]}>+234</Text>
                }
              />

              <Pressable
                disabled={!canContinueDetails}
                onPress={handleContinue}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: canContinueDetails ? palette.primary : palette.primarySoft,
                    shadowColor: palette.primary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>Continue</Text>
                <SymbolView
                  name={{ ios: 'arrow.right', android: 'arrow-forward', web: 'arrow-forward' } as any}
                  size={15}
                  tintColor={palette.onPrimary}
                  weight="semibold"
                />
              </Pressable>

              <Text style={[styles.termsText, { color: palette.muted }]}>
                By creating an account you agree to our{' '}
                <Text style={[styles.linkText, { color: palette.primary }]}>Terms of Service</Text> &{' '}
                <Text style={[styles.linkText, { color: palette.primary }]}>Privacy Policy</Text>
              </Text>

              <View style={styles.inlineFooter}>
                <Text style={[styles.footerText, { color: palette.muted }]}>Already have an account?</Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable hitSlop={8}>
                    <Text style={[styles.linkText, { color: palette.primary }]}>Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          ) : null}

          {step === 'password' ? (
            <View style={styles.formBlock}>
              <PasswordInput
                label="Password"
                size="md"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                leftIcon="lock"
              />

              <View style={[styles.rulesCard, { backgroundColor: palette.field, borderColor: palette.border }]}>
                {passwordChecks.map((item) => (
                  <View key={item.label} style={styles.ruleRow}>
                    <View
                      style={[
                        styles.ruleIconWrap,
                        { backgroundColor: item.passed ? palette.successSoft : palette.warningSoft },
                      ]}>
                      <Text style={[styles.ruleIcon, { color: item.passed ? palette.success : palette.warning }]}>
                        {item.passed ? '✓' : '!'}
                      </Text>
                    </View>
                    <Text style={[styles.ruleText, { color: item.passed ? palette.success : palette.muted }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <PasswordInput
                label="Confirm password"
                size="md"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                leftIcon="lock"
                error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match.' : null}
              />

              {error ? <Text style={[styles.verificationError, { color: palette.danger }]}>{error}</Text> : null}

              <Pressable
                disabled={!canCreateAccount}
                onPress={handleCreateAccount}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: canCreateAccount ? palette.primary : palette.primarySoft,
                    shadowColor: palette.primary,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
                  {status === 'loading' ? 'Creating account…' : 'Create account'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    minHeight: '100%',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    gap: 8,
    marginTop: 20,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  roleChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    marginTop: 20,
  },
  formBlock: {
    gap: 14,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameField: {
    flex: 1,
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  termsText: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  linkText: {
    fontWeight: '700',
  },
  inlineFooter: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 13,
  },
  rulesCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 9,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleIcon: {
    fontSize: 13,
    fontWeight: '800',
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  verificationError: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
});
