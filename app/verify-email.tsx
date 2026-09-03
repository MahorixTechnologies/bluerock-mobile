import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OtpInput } from '@/components/ui/inputs/OtpInput';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/providers/AuthProvider';

export default function VerifyEmailScreen() {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, requestEmailVerification, verifyEmail } = useAuth();
  const params = useLocalSearchParams<{ email?: string; sent?: string }>();
  const email = profile?.email ?? params.email ?? '';
  // Registration already emails a code as part of account creation — only
  // auto-send here when we arrive without one already in flight (e.g. the
  // login screen redirecting an unverified account), so a fresh signup
  // never gets two verification emails for one attempt.
  const alreadySent = params.sent === '1';

  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const requestedRef = useRef(false);

  async function sendCode() {
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await requestEmailVerification(email);
      if (result.demoCode) {
        setDemoCode(result.demoCode);
        setCode(result.demoCode);
      } else {
        setNotice('Check your email for a 6-digit code.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send a verification code.');
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (requestedRef.current || !email) return;
    requestedRef.current = true;
    if (alreadySent) {
      setNotice('Check your email for a 6-digit code.');
      return;
    }
    void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function handleVerify() {
    setVerifying(true);
    setError(null);
    try {
      await verifyEmail({ email, code: code.trim() });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code didn't work.");
    } finally {
      setVerifying(false);
    }
  }

  const canVerify = code.trim().length === 6 && !verifying;

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: palette.field, borderColor: palette.border, opacity: pressed ? 0.8 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' } as any}
            size={16}
            tintColor={palette.text}
            weight="semibold"
          />
        </Pressable>

        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: palette.text }]}>Verify your email</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            We&apos;ve sent a 6-digit code to{' '}
            <Text style={{ fontWeight: '800', color: palette.text }}>{email}</Text>. Enter it below
            to continue.
          </Text>
        </View>

        {demoCode ? (
          <View style={[styles.noticeCard, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}>
            <Text style={[styles.noticeText, { color: palette.primary }]}>
              ✨ Demo mode: no email server is wired up, so we&apos;ve pre-filled the code below
            </Text>
          </View>
        ) : null}

        {notice ? <Text style={[styles.plainNotice, { color: palette.muted }]}>{notice}</Text> : null}

        <View style={styles.otpBlock}>
          <OtpInput value={code} onChange={setCode} disabled={verifying} />
        </View>

        {error ? <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text> : null}

        <Pressable
          disabled={!canVerify}
          onPress={() => void handleVerify()}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: canVerify ? palette.primary : palette.primarySoft,
              shadowColor: palette.primary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
            {verifying ? 'Verifying…' : 'Verify'}
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: palette.muted }]}>Didn&apos;t receive a code?</Text>
          <Pressable onPress={() => void sendCode()} disabled={sending} hitSlop={8}>
            <Text style={[styles.linkText, { color: palette.primary, opacity: sending ? 0.6 : 1 }]}>
              {sending ? 'Sending…' : 'Resend code'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: { gap: 8, marginTop: 20 },
  title: { fontSize: 24, lineHeight: 29, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  noticeCard: { marginTop: 16, borderRadius: 14, borderWidth: 1, padding: 14 },
  noticeText: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  plainNotice: { marginTop: 16, fontSize: 13, fontWeight: '600' },
  otpBlock: { marginTop: 24 },
  errorText: { marginTop: 14, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: { fontSize: 13 },
  linkText: { fontWeight: '700', fontSize: 13 },
});
