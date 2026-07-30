import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';

export default function PayoutsScreen() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();

  if (profile?.role !== 'LANDLORD') {
    return (
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <Text style={[styles.title, { color: palette.text }]}>Payouts</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Payouts are available for landlord accounts.
        </Text>
        <Link href="/(tabs)/profile" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>Go to Account</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.title, { color: palette.text }]}>Payouts</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        Track expected earnings and completed transfers.
      </Text>

      <View style={styles.summaryRow}>
        <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
          <View style={[styles.statIcon, { backgroundColor: palette.warningSoft }]}>
            <SymbolView
              name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' } as any}
              size={16}
              tintColor={palette.warning}
            />
          </View>
          <Text style={[styles.statLabel, { color: palette.muted }]}>Pending</Text>
          <Text style={[styles.statValue, { color: palette.text }]}>{formatMoney(0, 'NGN')}</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>No pending payouts yet</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
          <View style={[styles.statIcon, { backgroundColor: palette.successSoft }]}>
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check-circle', web: 'check-circle' } as any}
              size={16}
              tintColor={palette.success}
            />
          </View>
          <Text style={[styles.statLabel, { color: palette.muted }]}>Completed</Text>
          <Text style={[styles.statValue, { color: palette.text }]}>{formatMoney(0, 'NGN')}</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>Payout history appears here</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Payout overview</Text>
        <Text style={[styles.meta, { color: palette.muted }]}>
          Once bookings are confirmed and paid, BlueRock will show the amount available for payout on
          this screen.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>What happens next?</Text>
        <Step palette={palette} index={1} label="Guest confirms a booking" />
        <Step palette={palette} index={2} label="Payment is marked as successful" />
        <Step palette={palette} index={3} label="Your payout becomes available here" />
      </View>
    </View>
  );
}

function Step({
  palette,
  index,
  label,
}: {
  palette: ReturnType<typeof useAppTheme>['palette'];
  index: number;
  label: string;
}) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepBubble, { backgroundColor: palette.primarySoft }]}>
        <Text style={[styles.stepNumber, { color: palette.primary }]}>{index}</Text>
      </View>
      <Text style={[styles.meta, { color: palette.muted, flex: 1 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { marginTop: 6, fontSize: 14 },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  statValue: { fontSize: 22, fontWeight: '900' },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 13, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBubble: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontSize: 13, fontWeight: '800' },
});
