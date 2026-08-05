import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { Booking } from '@/lib/models';
import { prettyDate } from '@/components/bookings/utils';

type PaymentSheetProps = {
  visible: boolean;
  onClose: () => void;
  booking: Booking | null;
  onConfirm: () => void;
  palette: AppPalette;
  busy?: boolean;
};

export function PaymentSheet({ visible, onClose, booking, onConfirm, palette, busy }: PaymentSheetProps) {
  if (!visible || !booking) return null;

  const nights = booking.nights;
  const subtotal = booking.subtotal;
  const serviceFee = booking.serviceFee;
  const total = booking.total;
  const nightlyRate = booking.pricePerNight;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: palette.card, shadowColor: palette.shadow }]}>
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
        </View>

        <View style={styles.innerPad}>
          <View style={[styles.eyebrowPill, { backgroundColor: palette.primarySoft }]}>
            <Text style={[styles.eyebrowText, { color: palette.primary }]}>Payment intent</Text>
          </View>
          <Text style={[styles.title, { color: palette.text }]}>Confirm your booking</Text>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.propertyTitle, { color: palette.text }]} numberOfLines={1}>
              {booking.listingTitle}
            </Text>
            <Text style={[styles.propertyLocation, { color: palette.muted }]} numberOfLines={1}>
              {booking.location}
            </Text>
            <View style={styles.summaryDates}>
              <Text style={[styles.summaryMeta, { color: palette.muted }]}>
                {prettyDate(booking.startDate)} — {prettyDate(booking.endDate)}
              </Text>
              <Text style={[styles.summaryMeta, { color: palette.muted }]}>
                {nights} {nights === 1 ? 'night' : 'nights'}
              </Text>
            </View>
          </View>

          <View style={styles.breakdown}>
            <View style={styles.breakRow}>
              <Text style={[styles.breakLabel, { color: palette.muted }]}>Accommodation</Text>
              <Text style={[styles.breakValue, { color: palette.text }]}>
                {formatMoney(subtotal, booking.currency)}
              </Text>
            </View>
            <View style={styles.breakRow}>
              <Text style={[styles.breakLabel, { color: palette.muted }]}>Service fee (10%)</Text>
              <Text style={[styles.breakValue, { color: palette.text }]}>
                {formatMoney(serviceFee, booking.currency)}
              </Text>
            </View>
            <View style={[styles.breakDivider, { backgroundColor: palette.border }]} />
            <View style={styles.breakRow}>
              <Text style={[styles.totalLabel, { color: palette.text }]}>Total payable</Text>
              <Text style={[styles.totalValue, { color: palette.primary }]}>
                {formatMoney(total, booking.currency)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.methodCard,
              {
                backgroundColor: palette.primarySoft,
                borderColor: palette.primarySoft,
              },
            ]}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodEmoji}>💳</Text>
            </View>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodTitle, { color: palette.primary }]}>Card ending ••4242</Text>
              <Text style={[styles.methodSub, { color: palette.primary }]}>Default</Text>
            </View>
            <View style={[styles.methodCheckWrap, { backgroundColor: palette.primary }]}>
              <Text style={styles.methodCheck}>✓</Text>
            </View>
          </View>

          <Text style={[styles.security, { color: palette.muted }]}>
            🔒 Secured · Receipt issued immediately.
          </Text>

          <Pressable
            disabled={busy}
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor: palette.primary,
                opacity: busy ? 0.7 : pressed ? 0.92 : 1,
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color={palette.onPrimary} />
            ) : (
              <Text style={[styles.confirmText, { color: palette.onPrimary }]}>
                Confirm &amp; Pay {formatMoney(total, booking.currency)}
              </Text>
            )}
          </Pressable>

          <Pressable
            disabled={busy}
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              {
                borderColor: palette.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.closeText, { color: palette.text }]}>Close</Text>
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
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handleWrap: { paddingTop: 10, alignItems: 'center' },
  handle: { width: 38, height: 5, borderRadius: 999 },
  innerPad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 16 },
  eyebrowPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: { fontSize: 22, fontWeight: '900', lineHeight: 28, marginTop: 2 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 4,
  },
  propertyTitle: { fontSize: 16, fontWeight: '800' },
  propertyLocation: { fontSize: 13, lineHeight: 18 },
  summaryDates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryMeta: { fontSize: 12, fontWeight: '600' },
  breakdown: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakLabel: { fontSize: 13, fontWeight: '600' },
  breakValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  breakDivider: { height: 1, marginVertical: 2 },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: { fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  methodIcon: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodEmoji: { fontSize: 20 },
  methodInfo: { flex: 1, gap: 2 },
  methodTitle: { fontSize: 14, fontWeight: '800' },
  methodSub: { fontSize: 12, fontWeight: '600' },
  methodCheckWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCheck: { color: '#fff', fontSize: 12, fontWeight: '900' },
  security: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  confirmButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  confirmText: { fontSize: 16, fontWeight: '800' },
  closeButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  closeText: { fontSize: 15, fontWeight: '700' },
});
