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
  TextInput,
  View,
} from 'react-native';

import TextField from '@/components/TextField';
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
  const { register, status } = useAuth();
  const [role, setRole] = useState<UserRole>('LANDLORD');
  const [step, setStep] = useState<RegisterStep>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      duration: 260,
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
          outputRange: [20, 0],
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
      });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  const title = step === 'details' ? 'Create Account' : 'Create Password';

  const subtitle =
    step === 'details'
      ? role === 'LANDLORD'
        ? 'Create your homeowner account to start managing your properties.'
        : 'Create your renter account to start booking and managing your stays.'
      : 'Secure your account';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
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

        <Animated.View
          style={[styles.card, animatedCardStyle, { backgroundColor: palette.card }]}>
          {step === 'details' ? (
            <View style={styles.formBlock}>
              <TextField
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                placeholder="Enter your first name"
                labelColor={palette.text}
                textColor={palette.text}
                borderColor={palette.border}
                backgroundColor={palette.field}
                placeholderTextColor={palette.placeholder}
                inputStyle={styles.textFieldInput}
              />

              <TextField
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                placeholder="Enter your last name"
                labelColor={palette.text}
                textColor={palette.text}
                borderColor={palette.border}
                backgroundColor={palette.field}
                placeholderTextColor={palette.placeholder}
                inputStyle={styles.textFieldInput}
              />

              <TextField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="Enter your email"
                labelColor={palette.text}
                textColor={palette.text}
                borderColor={palette.border}
                backgroundColor={palette.field}
                placeholderTextColor={palette.placeholder}
                inputStyle={styles.textFieldInput}
              />

              <View style={styles.fieldBlock}>
                <Text style={[styles.label, { color: palette.text }]}>Phone Number</Text>
                <View
                  style={[
                    styles.phoneRow,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.field,
                    },
                  ]}>
                  <View style={[styles.phonePrefix, { borderColor: palette.border }]}>
                    <Text style={[styles.phonePrefixText, { color: palette.muted }]}>+234</Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={(value) => setPhone(value.replace(/[^\d]/g, '').slice(0, 10))}
                    keyboardType="number-pad"
                    placeholder="812 345 6789"
                    placeholderTextColor={palette.placeholder}
                    style={[styles.phoneInput, { color: palette.text }]}
                  />
                </View>
              </View>

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
                <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>Continue  →</Text>
              </Pressable>

              <Text style={[styles.termsText, { color: palette.muted }]}>
                By creating an account you agree to our{' '}
                <Text style={[styles.linkText, { color: palette.primary }]}>Terms of Service</Text> &{' '}
                <Text style={[styles.linkText, { color: palette.primary }]}>Privacy Policy</Text>
              </Text>

              <View style={styles.inlineFooter}>
                <Text style={[styles.footerText, { color: palette.muted }]}>Already have an account?</Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text style={[styles.linkText, { color: palette.primary }]}>Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          ) : null}

          {step === 'password' ? (
            <View style={styles.formBlock}>
              <View style={styles.fieldBlock}>
                <Text style={[styles.label, { color: palette.text }]}>Password</Text>
                <View
                  style={[
                    styles.passwordWrap,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.field,
                    },
                  ]}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    placeholder="********"
                    placeholderTextColor={palette.placeholder}
                    style={[styles.passwordInput, { color: palette.text }]}
                  />
                  <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={8} style={styles.eyeButton}>
                    <SymbolView
                      name={{ ios: showPassword ? 'eye.slash' : 'eye', android: 'visibility', web: 'visibility' } as any}
                      size={20}
                      tintColor={palette.muted}
                    />
                  </Pressable>
                </View>
              </View>

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

              <View style={styles.fieldBlock}>
                <Text style={[styles.label, { color: palette.text }]}>Confirm Password</Text>
                <View
                  style={[
                    styles.passwordWrap,
                    {
                      borderColor: confirmPassword.length > 0 && !passwordsMatch ? palette.danger : palette.border,
                      backgroundColor: palette.field,
                    },
                  ]}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    secureTextEntry={!showConfirmPassword}
                    placeholder="********"
                    placeholderTextColor={palette.placeholder}
                    style={[styles.passwordInput, { color: palette.text }]}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((value) => !value)}
                    hitSlop={8}
                    style={styles.eyeButton}>
                    <SymbolView
                      name={{ ios: showConfirmPassword ? 'eye.slash' : 'eye', android: 'visibility', web: 'visibility' } as any}
                      size={20}
                      tintColor={palette.muted}
                    />
                  </Pressable>
                </View>
              </View>

              {confirmPassword.length > 0 && !passwordsMatch ? (
                <Text style={[styles.verificationError, { color: palette.danger }]}>Passwords do not match.</Text>
              ) : null}

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
                  {status === 'loading' ? 'Creating Account...' : 'Create Account  →'}
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
    paddingTop: 36,
    paddingBottom: 32,
    minHeight: '100%',
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 18 : 8,
  },
  backIcon: {
    fontSize: 32,
    lineHeight: 32,
    marginTop: -2,
  },
  headerBlock: {
    gap: 10,
    marginTop: 28,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  roleChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
  },
  card: {
    marginTop: 28,
    padding: 4,
    borderRadius: 32,
  },
  formBlock: {
    gap: 18,
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  fieldBlock: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  textFieldInput: {
    minHeight: 64,
    borderRadius: 16,
  },
  phoneRow: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  phonePrefix: {
    width: 88,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  primaryButton: {
    minHeight: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  linkText: {
    fontWeight: '700',
  },
  inlineFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 15,
  },
  passwordWrap: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    minWidth: 52,
    alignItems: 'flex-end',
  },
  rulesCard: {
    borderRadius: 18,
    borderWidth: 1,
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
  verificationError: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});
