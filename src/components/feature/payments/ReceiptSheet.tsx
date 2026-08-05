import { Clipboard } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { Booking, Receipt as ReceiptType } from '@/lib/models';

type ReceiptSheetProps = {
  visible: boolean;
  onClose: () => void;
  receipt: ReceiptType | null;
  booking: Booking | null;
  palette: AppPalette;
};

function prettyDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReceiptSheet({ visible, onClose, receipt, booking, palette }: ReceiptSheetProps) {
  if (!visible || !receipt || !booking) return null;

  const copyRef = async () => {
    try {
      if (typeof Clipboard !== 'undefined' && Clipboard.setString) {
        Clipboard.setString(receipt.id);
      }
    } catch {}
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
        </View>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerEmoji}>🧾</Text>
              <Text style={[styles.headerLabel, { color: palette.muted }]}>RECEIPT</Text>
            </View>
            <Text style={[styles.receiptNumber, { color: palette.text }]}>{receipt.number}</Text>
          </View>

          <View style={[styles.dateRow, { borderBottomColor: palette.border }]}>
            <View>
              <Text style={[styles.subtleLabel, { color: palette.muted }]}>Issued</Text>
              <Text style={[styles.subtleValue, { color: palette.text }]}>{prettyDateTime(receipt.issuedAt)}</Text>
            </View>
            <View style={styles.dateRowRight}>
              <Text style={[styles.subtleLabel, { color: palette.muted }]}>Paid</Text>
              <Text style={[styles.subtleValue, { color: palette.text }]}>{prettyDateTime(receipt.issuedAt)}</Text>
            </View>
          </View>

          <View style={styles.fromTo}>
            <View>
              <Text style={[styles.fromToLabel, { color: palette.muted }]}>From</Text>
              <Text style={[styles.fromToValue, { color: palette.text }]}>BlueRock</Text>
            </View>
            <Text style={[styles.arrow, { color: palette.muted }]}>→</Text>
            <View style={styles.toCol}>
              <Text style={[styles.fromToLabel, { color: palette.muted }]}>To</Text>
              <Text style={[styles.fromToValue, { color: palette.text }]} numberOfLines={1}>
                guest@bluerock.stay
              </Text>
            </View>
          </View>

          <View style={[styles.sectionDivider, { backgroundColor: palette.border }]} />

          <View style={styles.items}>
            {receipt.lineItems.map((li, idx) => (
              <View key={idx} style={[
                styles.itemRow,
                idx < receipt.lineItems.length - 1 ? { borderBottomColor: palette.border, borderBottomWidth: 1, paddingBottom: 12, marginBottom: 12 } : null,
              ]}>
                <Text style={[styles.itemLabel, { color: palette.text }]}>{li.label}</Text>
                <Text style={[styles.itemAmount, { color: palette.text }]}>
                  {formatMoney(li.amount, receipt.currency)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.sectionDivider, { backgroundColor: palette.border }]} />

          <View style={styles.totals}>
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { color: palette.muted }]}>Subtotal</Text>
              <Text style={[styles.totalsValue, { color: palette.text }]}>
                {formatMoney(receipt.subtotal, receipt.currency)}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { color: palette.muted }]}>Service fee</Text>
              <Text style={[styles.totalsValue, { color: palette.text }]}>
                {formatMoney(receipt.serviceFee, receipt.currency)}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={[styles.netLabel, { color: palette.text }]}>Net total</Text>
              <Text style={[styles.netValue, { color: palette.primary }]}>
                {formatMoney(receipt.total, receipt.currency)}
              </Text>
            </View>
          </View>

          <View style={[styles.sectionDivider, { backgroundColor: palette.border }]} />

          <View style={styles.refRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.refLabel, { color: palette.muted }]}>Transaction reference</Text>
              <Text style={[styles.refValue, { color: palette.text }]}>{receipt.id}</Text>
            </View>
            <Pressable
              onPress={copyRef}
              style={({ pressed }) => [
                styles.copyButton,
                {
                  backgroundColor: palette.primarySoft,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.copyText, { color: palette.primary }]}>copy</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: palette.primary, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <Text style={[styles.doneText, { color: palette.onPrimary }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,12,20,0.45)',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  sheetWrap: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  handleWrap: { alignItems: 'center', paddingBottom: 12 },
  handle: { width: 38, height: 5, borderRadius: 999 },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    gap: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerEmoji: { fontSize: 18 },
  headerLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  receiptNumber: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14, borderBottomWidth: 1 },
  subtleLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, opacity: 0.8 },
  subtleValue: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  dateRowRight: { alignItems: 'flex-end' },
  fromTo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fromToLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, opacity: 0.8 },
  fromToValue: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  arrow: { fontSize: 16, fontWeight: '800', marginHorizontal: 4 },
  toCol: { flex: 1, alignItems: 'flex-end' },
  sectionDivider: { height: 1, marginVertical: 2 },
  items: { gap: 0 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 14, fontWeight: '600', flex: 1, paddingRight: 8 },
  itemAmount: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  totals: { gap: 8 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalsLabel: { fontSize: 13, fontWeight: '600' },
  totalsValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  netLabel: { fontSize: 15, fontWeight: '900' },
  netValue: { fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  refLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, opacity: 0.8 },
  refValue: { fontSize: 13, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  copyText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  actions: { marginTop: 16 },
  doneButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  doneText: { fontSize: 16, fontWeight: '800' },
});
