import { SymbolView } from 'expo-symbols';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatMoney } from '@/lib/format';
import { computeTotals, payoutBatches, payoutPaymentMethods } from '@/lib/payouts-data';
import { useAuth } from '@/providers/AuthProvider';
import type { AppPalette } from '@/constants/theme';
import type { PayoutBatch } from '@/lib/payouts-data';

export default function PayoutsScreen() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const [showWithdrawNotice, setShowWithdrawNotice] = useState(false);

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

  const totals = computeTotals();
  const available = totals.pending;
  const pendingBatch = payoutBatches.find((b) => b.status === 'Pending');

  const nextFriday = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  })();

  return (
    <ScrollView
      style={{ backgroundColor: palette.bg }}
      contentContainerStyle={[styles.container, { backgroundColor: palette.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: palette.text }]}>Payouts</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        Track expected earnings and completed transfers.
      </Text>

      <View style={[styles.previewBanner, { backgroundColor: palette.warningSoft }]}>
        <SymbolView
          name={{ ios: 'exclamationmark.circle.fill', android: 'info', web: 'info' } as any}
          size={14}
          tintColor={palette.warning}
        />
        <Text style={[styles.previewBannerText, { color: palette.warning }]}>
          Preview data — live payouts aren't connected yet.
        </Text>
      </View>

      <View style={styles.kpiGrid}>
        <StatCard
          palette={palette}
          iconIos="dollarsign.circle.fill"
          iconAndroid="attach_money"
          iconBg={palette.primarySoft}
          iconFg={palette.primary}
          label="Total Gross"
          value={formatMoney(totals.totalGross, 'USD')}
        />
        <StatCard
          palette={palette}
          iconIos="creditcard.and.123"
          iconAndroid="account_balance_wallet"
          iconBg={palette.successSoft}
          iconFg={palette.success}
          label="Available Balance"
          value={formatMoney(available, 'USD')}
        />
        <StatCard
          palette={palette}
          iconIos="checkmark.seal.fill"
          iconAndroid="check_circle"
          iconBg={palette.primarySoft}
          iconFg={palette.primary}
          label="Paid YTD"
          value={formatMoney(totals.paid, 'USD')}
        />
        <StatCard
          palette={palette}
          iconIos="percent"
          iconAndroid="percent"
          iconBg={palette.warningSoft}
          iconFg={palette.warning}
          label="Service Fee"
          value={formatMoney(totals.fees, 'USD')}
        />
        <StatCard
          palette={palette}
          iconIos="exclamationmark.triangle.fill"
          iconAndroid="error"
          iconBg={palette.dangerSoft}
          iconFg={palette.danger}
          label="Failed"
          value={formatMoney(totals.failed, 'USD')}
        />
      </View>

      <View style={styles.mainGrid}>
        <View style={styles.leftCol}>
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Payout history</Text>
              <Text style={[styles.sectionCount, { color: palette.muted }]}>{payoutBatches.length}</Text>
            </View>

            <View style={styles.historyList}>
              {payoutBatches.map((batch) => (
                <HistoryRow key={batch.id} batch={batch} palette={palette} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.rightCol}>
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Next deposit</Text>
              <View style={[styles.calendarPill, { backgroundColor: palette.primarySoft }]}>
                <Text style={[styles.calendarPillText, { color: palette.primary }]}>
                  Scheduled {nextFriday}
                </Text>
              </View>
            </View>

            <View style={styles.nextDepositHead}>
              <Text style={[styles.nextDepositAmount, { color: palette.primary }]}>
                {formatMoney(available, 'USD')}
              </Text>
              <Text style={[styles.nextDepositLabel, { color: palette.muted }]}>Pending payout amount</Text>
            </View>

            <View style={[styles.nextBreakdown, { borderTopColor: palette.border }]}>
              <View style={styles.nextBreakRow}>
                <Text style={[styles.nextBreakLabel, { color: palette.muted }]}>Pending stays</Text>
                <Text style={[styles.nextBreakValue, { color: palette.text }]}>
                  {formatMoney(available + (pendingBatch ? pendingBatch.fee : Math.round(available * 0.0526)), 'USD')}
                </Text>
              </View>
              <View style={styles.nextBreakRow}>
                <Text style={[styles.nextBreakLabel, { color: palette.muted }]}>Service fee (5%)</Text>
                <Text style={[styles.nextBreakFee, { color: palette.danger }]}>
                  − {formatMoney(pendingBatch ? pendingBatch.fee : Math.round(available * 0.0526), 'USD')}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowWithdrawNotice(true)}
              style={({ pressed }) => [
                styles.withdrawButton,
                { backgroundColor: palette.primarySoft, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.withdrawText, { color: palette.primary }]}>Withdraw to Bank</Text>
            </Pressable>
            {showWithdrawNotice ? (
              <View style={[styles.withdrawNotice, { backgroundColor: palette.warningSoft }]}>
                <SymbolView
                  name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' } as any}
                  size={14}
                  tintColor={palette.warning}
                />
                <Text style={[styles.withdrawNoticeText, { color: palette.warning }]}>
                  Bank withdrawals aren't available yet.
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Payment methods</Text>

            <View style={styles.methodList}>
              {payoutPaymentMethods.map((m) => (
                <View key={m.title} style={[styles.methodRow, { borderBottomColor: palette.border }]}>
                  <View
                    style={[
                      styles.methodIconTile,
                      { backgroundColor: m.color + '20' },
                    ]}
                  >
                    <Text style={styles.methodIconText}>{m.icon}</Text>
                  </View>
                  <View style={styles.methodBody}>
                    <View style={styles.methodTitleRow}>
                      <Text style={[styles.methodTitle, { color: palette.text }]}>{m.title}</Text>
                      <View style={[styles.methodTag, { backgroundColor: m.color + '18' }]}>
                        <Text style={[styles.methodTagText, { color: m.color }]}>{m.tag}</Text>
                      </View>
                    </View>
                    <Text style={[styles.methodSub, { color: palette.muted }]}>{m.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

type StatCardProps = {
  palette: AppPalette;
  iconIos: string;
  iconAndroid: string;
  iconBg: string;
  iconFg: string;
  label: string;
  value: string;
};

function StatCard({ palette, iconIos, iconAndroid, iconBg, iconFg, label, value }: StatCardProps) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <SymbolView
          name={{ ios: iconIos, android: iconAndroid, web: iconAndroid } as any}
          size={16}
          tintColor={iconFg}
        />
      </View>
      <Text style={[styles.statLabel, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

function HistoryRow({ batch, palette }: { batch: PayoutBatch; palette: AppPalette }) {
  const gross = batch.amount + batch.fee;
  const statusColor =
    batch.status === 'Paid'
      ? { bg: palette.successSoft, fg: palette.success }
      : batch.status === 'Pending'
        ? { bg: palette.warningSoft, fg: palette.warning }
        : { bg: palette.dangerSoft, fg: palette.danger };
  const methodIcon = batch.method === 'Bank Transfer' ? '🏦' : batch.method === 'Wallet' ? '👛' : '💳';
  return (
    <View style={[styles.historyRow, { borderBottomColor: palette.border }]}>
      <View style={styles.historyRowTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.historyDateIdRow}>
            <Text style={[styles.historyDate, { color: palette.text }]}>
              {new Date(batch.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text style={[styles.historyId, { color: palette.muted }]}>{batch.id}</Text>
          </View>
          <Text style={[styles.historyLabel, { color: palette.text }]}>{batch.label}</Text>
          <Text style={[styles.historyRef, { color: palette.muted }]}>{batch.reference}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusChipText, { color: statusColor.fg }]}>{batch.status}</Text>
        </View>
      </View>

      <View style={styles.historyRowMeta}>
        <Text style={[styles.historyBookings, { color: palette.muted }]} numberOfLines={1}>
          Bookings: {batch.bookingIds}
        </Text>
        <View style={[styles.methodBubble, { backgroundColor: palette.soft }]}>
          <Text style={styles.methodBubbleIcon}>{methodIcon}</Text>
          <Text style={[styles.methodBubbleText, { color: palette.muted }]}>{batch.method}</Text>
        </View>
      </View>

      <View style={styles.historyMoney}>
        <View style={styles.moneyCol}>
          <Text style={[styles.moneyLabel, { color: palette.muted }]}>Gross</Text>
          <Text style={[styles.moneyValue, { color: palette.text }]}>{formatMoney(gross, batch.currency)}</Text>
        </View>
        <View style={styles.moneyCol}>
          <Text style={[styles.moneyLabel, { color: palette.muted }]}>Fee</Text>
          <Text style={[styles.moneyFee, { color: palette.danger }]}>− {formatMoney(batch.fee, batch.currency)}</Text>
        </View>
        <View style={[styles.moneyCol, styles.moneyColRight]}>
          <Text style={[styles.moneyLabel, { color: palette.muted }]}>Net</Text>
          <Text style={[styles.moneyNet, { color: palette.text }]}>{formatMoney(batch.amount, batch.currency)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 14 },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { marginTop: 2, fontSize: 14, lineHeight: 20 },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },

  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewBannerText: { fontSize: 12, fontWeight: '700', flex: 1, lineHeight: 16 },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  statCard: {
    width: '48%',
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase', marginTop: 2, opacity: 0.85 },
  statValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.2 },

  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  leftCol: { flexBasis: '100%', flexGrow: 1.2 },
  rightCol: { flexBasis: '100%', flexGrow: 0.8, gap: 12 },

  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '900' },
  sectionCount: { fontSize: 12, fontWeight: '700', opacity: 0.75 },

  historyList: { gap: 0 },
  historyRow: { paddingVertical: 14, borderBottomWidth: 1, gap: 10 },
  historyRowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  historyDateIdRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  historyDate: { fontSize: 13, fontWeight: '800' },
  historyId: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  historyLabel: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  historyRef: { fontSize: 11, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },
  statusChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusChipText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  historyRowMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  historyBookings: { fontSize: 11, fontWeight: '600', flex: 1 },
  methodBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  methodBubbleIcon: { fontSize: 12 },
  methodBubbleText: { fontSize: 11, fontWeight: '700' },
  historyMoney: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2 },
  moneyCol: { flex: 1 },
  moneyColRight: { alignItems: 'flex-end' },
  moneyLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2, textTransform: 'uppercase', opacity: 0.75 },
  moneyValue: { fontSize: 13, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  moneyFee: { fontSize: 13, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  moneyNet: { fontSize: 15, fontWeight: '900', marginTop: 2, fontVariant: ['tabular-nums'] },

  calendarPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  calendarPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2, textTransform: 'uppercase' },
  nextDepositHead: { alignItems: 'flex-start', gap: 4, marginTop: 2 },
  nextDepositAmount: { fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  nextDepositLabel: { fontSize: 12, fontWeight: '600' },
  nextBreakdown: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  nextBreakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nextBreakLabel: { fontSize: 13, fontWeight: '600' },
  nextBreakValue: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  nextBreakFee: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  withdrawButton: {
    marginTop: 4,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  withdrawText: { fontSize: 15, fontWeight: '800' },
  withdrawNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  withdrawNoticeText: { fontSize: 12, fontWeight: '700', flex: 1, lineHeight: 16 },

  methodList: { gap: 0 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  methodIconTile: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconText: { fontSize: 20 },
  methodBody: { flex: 1, gap: 4 },
  methodTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  methodTitle: { fontSize: 14, fontWeight: '800' },
  methodTag: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  methodTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  methodSub: { fontSize: 12, lineHeight: 16 },
});
