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
  TextInput,
} from 'react-native';

import TextField from '@/components/TextField';
import { Text, useThemeColor, View } from '@/components/Themed';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';

type RegisterStep = 'details' | 'verify' | 'password';
type UserRole = 'RENTER' | 'LANDLORD';

const CODE_LENGTH = 6;

function maskEmailAddress(value: string) {
  const normalized = value.trim();
  if (!normalized.includes('@')) return normalized || 'your email address';

  const [name, domain] = normalized.split('@');
  if (!name || !domain) return normalized;

  const head = name.slice(0, 3);
  const masked = `${head}${'*'.repeat(Math.max(3, name.length - head.length))}`;
  return `${masked}@${domain}`;
}

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
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(47);
  const [error, setError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const codeInputRef = useRef<TextInput | null>(null);
  const cardAnimation = useRef(new Animated.Value(1)).current;

  const textColor = useThemeColor({ light: '#0f172a', dark: '#f8fafc' }, 'text');
  const subtleTextColor = useThemeColor(
    { light: '#6b7280', dark: 'rgba(226,232,240,0.76)' },
    'text',
  );
  const cardColor = useThemeColor({ light: '#f5f7fb', dark: '#111827' }, 'background');
  const inputBackground = useThemeColor({ light: '#ffffff', dark: '#0f172a' }, 'background');
  const borderColor = useThemeColor(
    { light: 'rgba(15, 23, 42, 0.08)', dark: 'rgba(255,255,255,0.12)' },
    'text',
  );
  const placeholderColor = useThemeColor(
    { light: 'rgba(100, 116, 139, 0.62)', dark: 'rgba(203, 213, 225, 0.42)' },
    'text',
  );

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const isPasswordValid = passwordChecks.every((item) => item.passed);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const canContinueDetails =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.replace(/\D/g, '').length >= 9;
  const canVerifyCode = verificationCode.length === CODE_LENGTH;
  const canCreateAccount = isPasswordValid && passwordsMatch && status !== 'loading';
  const maskedEmail = useMemo(() => maskEmailAddress(email), [email]);

  useEffect(() => {
    cardAnimation.setValue(0);
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [cardAnimation, step]);

  useEffect(() => {
    if (step !== 'verify') return;

    const focusTimeout = setTimeout(() => {
      codeInputRef.current?.focus();
    }, 280);

    return () => clearTimeout(focusTimeout);
  }, [step]);

  useEffect(() => {
    if (step !== 'verify' || resendTimer <= 0) return;

    const timer = setTimeout(() => setResendTimer((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer, step]);

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
    setVerificationError(null);
    if (step === 'details') {
      router.back();
      return;
    }

    if (step === 'verify') {
      setStep('details');
      return;
    }

    setStep('verify');
  };

  const handleContinue = () => {
    setError(null);
    setVerificationError(null);
    setResendTimer(47);
    setStep('verify');
  };

  const handleVerify = () => {
    if (!canVerifyCode) {
      setVerificationError('Enter the 6-digit code sent to your phone.');
      return;
    }

    setVerificationError(null);
    setStep('password');
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setVerificationCode('');
    setVerificationError(null);
    setResendTimer(47);
    codeInputRef.current?.focus();
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
      router.replace('/(tabs)/profile');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  const title =
    step === 'details'
      ? 'Create Account'
      : step === 'verify'
        ? 'Phone Verification'
        : 'Create Password';

  const subtitle =
    step === 'details'
      ? role === 'LANDLORD'
        ? 'Create your homeowner account to start managing your properties.'
        : 'Create your renter account to start booking and managing your stays.'
      : step === 'verify'
        ? 'Enter the 6-digit code sent to'
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
              backgroundColor: inputBackground,
              borderColor,
              opacity: pressed ? 0.82 : 1,
            },
          ]}>
          <Text style={[styles.backIcon, { color: textColor }]}>‹</Text>
        </Pressable>

        <View style={styles.headerBlock} lightColor="transparent" darkColor="transparent">
          {step === 'details' ? (
            <View style={styles.roleRow} lightColor="transparent" darkColor="transparent">
              {(['LANDLORD', 'RENTER'] as UserRole[]).map((value) => {
                const active = role === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setRole(value)}
                    style={({ pressed }) => [
                      styles.roleChip,
                      {
                        borderColor: active ? '#2f6bff' : borderColor,
                        backgroundColor: active ? 'rgba(47, 107, 255, 0.10)' : inputBackground,
                        opacity: pressed ? 0.88 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.roleChipText,
                        { color: active ? '#1d4ed8' : subtleTextColor },
                      ]}>
                      {value === 'LANDLORD' ? 'Homeowner' : 'Renter'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          {step === 'verify' ? (
            <View style={styles.verifySubtitleWrap} lightColor="transparent" darkColor="transparent">
              <Text style={[styles.subtitle, { color: subtleTextColor }]}>{subtitle}</Text>
              <Text style={[styles.maskedEmail, { color: palette.text }]}>{maskedEmail}</Text>
            </View>
          ) : (
            <Text style={[styles.subtitle, { color: subtleTextColor }]}>{subtitle}</Text>
          )}
        </View>

        <Animated.View
          style={[
            styles.card,
            animatedCardStyle,
            { backgroundColor: cardColor },
          ]}>
          {step === 'details' ? (
            <View style={styles.formBlock} lightColor="transparent" darkColor="transparent">
              <TextField
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                placeholder="Enter your first name"
                labelColor={textColor}
                textColor={textColor}
                borderColor={borderColor}
                backgroundColor={inputBackground}
                placeholderTextColor={placeholderColor}
                inputStyle={styles.textFieldInput}
              />

              <TextField
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                placeholder="Enter your last name"
                labelColor={textColor}
                textColor={textColor}
                borderColor={borderColor}
                backgroundColor={inputBackground}
                placeholderTextColor={placeholderColor}
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
                labelColor={textColor}
                textColor={textColor}
                borderColor={borderColor}
                backgroundColor={inputBackground}
                placeholderTextColor={placeholderColor}
                inputStyle={styles.textFieldInput}
              />

              <View style={styles.fieldBlock} lightColor="transparent" darkColor="transparent">
                <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
                <View
                  style={[
                    styles.phoneRow,
                    {
                      borderColor,
                      backgroundColor: inputBackground,
                    },
                  ]}
                  lightColor="transparent"
                  darkColor="transparent">
                  <View
                    style={[styles.phonePrefix, { borderColor }]}
                    lightColor="transparent"
                    darkColor="transparent">
                    <Text style={[styles.phonePrefixText, { color: subtleTextColor }]}>+234</Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={(value) => setPhone(value.replace(/[^\d]/g, '').slice(0, 10))}
                    keyboardType="number-pad"
                    placeholder="812 345 6789"
                    placeholderTextColor={placeholderColor}
                    style={[styles.phoneInput, { color: textColor }]}
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
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={styles.primaryButtonText}>Continue  →</Text>
              </Pressable>

              <Text style={[styles.termsText, { color: subtleTextColor }]}>
                By creating an account you agree to our{' '}
                <Text style={styles.linkText}>Terms of Service</Text> &{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>

              <View style={styles.inlineFooter} lightColor="transparent" darkColor="transparent">
                <Text style={[styles.footerText, { color: subtleTextColor }]}>Already have an account?</Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text style={styles.linkText}>Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          ) : null}

          {step === 'verify' ? (
            <View style={styles.verifyBlock} lightColor="transparent" darkColor="transparent">
              <View style={styles.verificationGraphic} lightColor="transparent" darkColor="transparent">
                <View style={styles.orbitOuter} lightColor="transparent" darkColor="transparent" />
                <View style={styles.orbitInner} lightColor="transparent" darkColor="transparent" />
                <View style={styles.shieldWrap}>
                  <Text style={styles.shieldIcon}>🛡️</Text>
                </View>
              </View>

              <Pressable
                onPress={() => codeInputRef.current?.focus()}
                style={styles.codeRow}
                accessibilityRole="button">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                  const digit = verificationCode[index] ?? '';
                  const isActive = index === verificationCode.length && verificationCode.length < CODE_LENGTH;
                  const hasErrorState = Boolean(verificationError);
                  return (
                    <View
                      key={`digit-${index}`}
                      style={[
                        styles.codeBox,
                        {
                          backgroundColor: inputBackground,
                          borderColor: hasErrorState
                            ? '#ef4444'
                            : isActive
                              ? '#2f6bff'
                              : index < verificationCode.length
                                ? 'rgba(47, 107, 255, 0.45)'
                                : borderColor,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.codeDigit,
                          {
                            color: hasErrorState ? '#dc2626' : '#1d4ed8',
                          },
                        ]}>
                        {digit || (isActive ? '|' : '')}
                      </Text>
                    </View>
                  );
                })}
              </Pressable>

              <TextInput
                ref={codeInputRef}
                value={verificationCode}
                onChangeText={(value) => {
                  setVerificationCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH));
                  setVerificationError(null);
                }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                style={styles.hiddenInput}
              />

              {verificationCode.length < CODE_LENGTH ? (
                <Text style={[styles.resendText, { color: subtleTextColor }]}>
                  Resend code in <Text style={styles.timerText}>00:{String(resendTimer).padStart(2, '0')}</Text>
                </Text>
              ) : (
                <View style={styles.didntReceiveWrap} lightColor="transparent" darkColor="transparent">
                  <Text style={[styles.resendText, { color: subtleTextColor }]}>Didn’t receive code?</Text>
                  <Pressable
                    onPress={handleResend}
                    style={({ pressed }) => [
                      styles.resendButton,
                      {
                        borderColor: '#b9cdfc',
                        backgroundColor: pressed ? '#edf4ff' : '#f5f9ff',
                      },
                    ]}>
                    <Text style={styles.resendButtonText}>↻  Resend Code</Text>
                  </Pressable>
                </View>
              )}

              {verificationError ? (
                <Text style={styles.verificationError}>The code you entered was incorrect.</Text>
              ) : null}

              <View style={styles.secureNotice} lightColor="#eaf7ef" darkColor="#0f2d1d">
                <Text style={styles.secureIcon}>🛡</Text>
                <View style={styles.secureTextWrap} lightColor="transparent" darkColor="transparent">
                  <Text style={styles.secureTitle}>Secure Verification</Text>
                  <Text style={styles.secureBody}>
                    This code expires in 10 minutes. Never share it with anyone.
                  </Text>
                </View>
              </View>

              <Pressable
                disabled={!canVerifyCode}
                onPress={handleVerify}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: canVerifyCode ? palette.primary : palette.primarySoft,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={styles.primaryButtonText}>Verify Account  →</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'password' ? (
            <View style={styles.formBlock} lightColor="transparent" darkColor="transparent">
              <View style={styles.fieldBlock} lightColor="transparent" darkColor="transparent">
                <Text style={[styles.label, { color: textColor }]}>Password</Text>
                <View
                  style={[
                    styles.passwordWrap,
                    {
                      borderColor,
                      backgroundColor: inputBackground,
                    },
                  ]}
                  lightColor="transparent"
                  darkColor="transparent">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    placeholder="********"
                    placeholderTextColor={placeholderColor}
                    style={[styles.passwordInput, { color: textColor }]}
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

              <View
                style={[
                  styles.rulesCard,
                  {
                    backgroundColor: inputBackground,
                    borderColor,
                  },
                ]}
                lightColor="transparent"
                darkColor="transparent">
                {passwordChecks.map((item) => (
                  <View key={item.label} style={styles.ruleRow} lightColor="transparent" darkColor="transparent">
                    <View
                      style={[
                        styles.ruleIconWrap,
                        {
                          backgroundColor: item.passed ? '#d1fae5' : '#fef3c7',
                        },
                      ]}
                      lightColor="transparent"
                      darkColor="transparent">
                      <Text style={[styles.ruleIcon, { color: item.passed ? '#16a34a' : '#d97706' }]}>
                        {item.passed ? '✓' : '!'}
                      </Text>
                    </View>
                    <Text style={[styles.ruleText, { color: item.passed ? '#15803d' : subtleTextColor }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.fieldBlock} lightColor="transparent" darkColor="transparent">
                <Text style={[styles.label, { color: textColor }]}>Confirm Password</Text>
                <View
                  style={[
                    styles.passwordWrap,
                    {
                      borderColor: confirmPassword.length > 0 && !passwordsMatch ? '#ef4444' : borderColor,
                      backgroundColor: inputBackground,
                    },
                  ]}
                  lightColor="transparent"
                  darkColor="transparent">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                    secureTextEntry={!showConfirmPassword}
                    placeholder="********"
                    placeholderTextColor={placeholderColor}
                    style={[styles.passwordInput, { color: textColor }]}
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
                <Text style={styles.verificationError}>Passwords do not match.</Text>
              ) : null}

              {error ? <Text style={styles.verificationError}>{error}</Text> : null}

              <Pressable
                disabled={!canCreateAccount}
                onPress={handleCreateAccount}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: canCreateAccount ? palette.primary : palette.primarySoft,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={styles.primaryButtonText}>
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
  verifySubtitleWrap: {
    gap: 6,
    alignItems: 'center',
  },
  maskedEmail: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
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
    shadowColor: '#85a3f3',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
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
    color: '#2563eb',
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
  verifyBlock: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 20,
  },
  verificationGraphic: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  orbitOuter: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  orbitInner: {
    position: 'absolute',
    width: 134,
    height: 134,
    borderRadius: 67,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(96, 165, 250, 0.22)',
  },
  shieldWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#2f6bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2f6bff',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  shieldIcon: {
    fontSize: 38,
  },
  codeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
  codeBox: {
    flex: 1,
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDigit: {
    fontSize: 28,
    fontWeight: '800',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  resendText: {
    fontSize: 15,
    textAlign: 'center',
  },
  timerText: {
    color: '#2563eb',
    fontWeight: '800',
  },
  didntReceiveWrap: {
    alignItems: 'center',
    gap: 10,
  },
  resendButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '700',
  },
  verificationError: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  secureNotice: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  secureIcon: {
    fontSize: 24,
    marginTop: 1,
  },
  secureTextWrap: {
    flex: 1,
    gap: 2,
  },
  secureTitle: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '800',
  },
  secureBody: {
    color: '#16a34a',
    fontSize: 14,
    lineHeight: 22,
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
  eyeText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '700',
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
});
