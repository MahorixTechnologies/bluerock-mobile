import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib/format';
import type { Booking, PaymentStatus, BookingStatus as BookingStatusType, Receipt } from '@/lib/models';
import { createPaymentIntent, confirmPayment, getReceiptForBooking, isRefundEligible } from '@/lib/payments';
import { useBookings } from '@/providers/BookingProvider';
import { PaymentSheet } from '@/components/payments/PaymentSheet';
import { ReceiptSheet } from '@/components/payments/ReceiptSheet';

import type { BookingPalette } from './types';
import { bookingStatus, prettyDate } from './utils';

type BookingListItemProps = {
  item: Booking;
  palette: BookingPalette;
  todayUtc: number;
};

function statusBadgeStyle(status: BookingStatusType, palette: BookingPalette) {
  switch (status) {
    case 'PENDING':
      return { bg: palette.warningSoft, fg: palette.warning };
    case 'CONFIRMED':
    case 'COMPLETED':
      return { bg: palette.successSoft, fg: palette.success };
    default:
      return { bg: palette.dangerSoft, fg: palette.danger };
  }
}

function paymentBadgeStyle(status: PaymentStatus, palette: BookingPalette) {
  switch (status) {
    case 'PAID':
      return { bg: palette.successSoft, fg: palette.success };
    case 'UNPAID':
      return { bg: palette.warningSoft, fg: palette.warning };
    case 'REFUNDED':
      return { bg: palette.soft, fg: palette.muted };
    default:
      return { bg: palette.dangerSoft, fg: palette.danger };
  }
}

export function BookingListItem({ item, palette, todayUtc }: BookingListItemProps) {
  const { payBooking, refundBooking } = useBookings();
  const upcoming = bookingStatus(item.endDate, todayUtc) === 'Upcoming';
  const badgeBg = upcoming ? palette.successSoft : palette.soft;
  const badgeColor = upcoming ? palette.success : palette.muted;
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [receiptSheetVisible, setReceiptSheetVisible] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const statusStyle = statusBadgeStyle(item.status, palette);
  const payStyle = paymentBadgeStyle(item.paymentStatus, palette);
  const refundOk = isRefundEligible(item);

  const openReceipt = () => {
    let receipt = getReceiptForBooking(item.id);
    if (!receipt) {
      const intent = createPaymentIntent(item);
      const out = confirmPayment(intent.id, 'Card');
      receipt = out.receipt;
    }
    setActiveReceipt(receipt);
    setReceiptSheetVisible(true);
  };

  const onConfirmPay = async () => {
    if (payBusy) return;
    try {
      setPayBusy(true);
      await payBooking(item.id);
    } finally {
      setPayBusy(false);
      setPaymentSheetVisible(false);
    }
  };

  const askRefund = () => {
    Alert.alert(
      'Request refund',
      `Refund ${formatMoney(item.total, item.currency)} for ${item.listingTitle}? This will reverse the payment in accordance with our policy.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: () => {
            refundBooking(item.id, 'Guest requested cancellation');
          },
        },
      ],
    );
  };

  return (
    <View style={{ gap: 12 }}>
      <Link href={`/booking/${item.id}` as Href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              shadowColor: palette.shadow,
              opacity: pressed ? 0.96 : 1,
            },
          ]}>
          <View style={styles.bookingCardTop}>
            <View style={[styles.bookingIconBubble, { backgroundColor: palette.primarySoft }]}>
              <SymbolView
                name={{ ios: 'bed.double.fill', android: 'hotel', web: 'hotel' } as any}
                size={18}
                tintColor={palette.primary}
              />
            </View>
            <View style={styles.bookingTitleWrap}>
              <Text style={[styles.eyebrow, { color: palette.muted }]}>Reserved stay</Text>
              <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
                {item.listingTitle || 'Listing'}
              </Text>
              <Text style={[styles.cardSubtitle, { color: palette.muted }]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            <View style={styles.badgeStack}>
              <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.badgeText, { color: statusStyle.fg }]}>{item.status}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: payStyle.bg }]}>
                <Text style={[styles.badgeText, { color: payStyle.fg }]}>{item.paymentStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={[styles.infoTile, { backgroundColor: palette.soft }]}>
              <Text style={[styles.infoLabel, { color: palette.muted }]}>Dates</Text>
              <Text style={[styles.infoValue, { color: palette.text }]}>
                {prettyDate(item.startDate)} - {prettyDate(item.endDate)}
              </Text>
            </View>
            <View style={[styles.infoTile, { backgroundColor: palette.soft }]}>
              <Text style={[styles.infoLabel, { color: palette.muted }]}>Total</Text>
              <Text style={[styles.infoValue, { color: palette.text }]}>{formatMoney(item.total, item.currency)}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: palette.soft }]}>
              <SymbolView
                name={{ ios: 'moon.stars.fill', android: 'hotel', web: 'hotel' } as any}
                size={13}
                tintColor={palette.muted}
              />
              <Text style={[styles.meta, { color: palette.muted }]}>{item.nights} nights</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: palette.soft }]}>
              <SymbolView
                name={{ ios: 'creditcard.fill', android: 'payments', web: 'payments' } as any}
                size={13}
                tintColor={palette.muted}
              />
              <Text style={[styles.meta, { color: palette.muted }]}>Fee {formatMoney(item.serviceFee, item.currency)}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: palette.soft }]}>
              <SymbolView
                name={{ ios: 'wallet.pass.fill', android: 'payments', web: 'payments' } as any}
                size={13}
                tintColor={palette.muted}
              />
              <Text style={[styles.meta, { color: palette.muted }]}>
                {formatMoney(item.pricePerNight, item.currency)}/night
              </Text>
            </View>
          </View>

          <View style={[styles.priceGrid, { borderTopColor: palette.border }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: palette.muted }]}>Subtotal</Text>
              <Text style={[styles.priceValue, { color: palette.text }]}>
                {formatMoney(item.subtotal, item.currency)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: palette.muted }]}>Service fee</Text>
              <Text style={[styles.priceValue, { color: palette.text }]}>
                {formatMoney(item.serviceFee, item.currency)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabelTotal, { color: palette.text }]}>Total</Text>
              <Text style={[styles.priceValueTotal, { color: palette.primary }]}>
                {formatMoney(item.total, item.currency)}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>

      <View style={styles.actionBar}>
        {item.paymentStatus === 'UNPAID' && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setPaymentSheetVisible(true);
            }}
            style={({ pressed }) => [
              styles.actionPrimary,
              { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={[styles.actionPrimaryText, { color: palette.onPrimary }]}>Pay Now</Text>
          </Pressable>
        )}

        {item.paymentStatus === 'PAID' && (
          <>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                openReceipt();
              }}
              style={({ pressed }) => [
                styles.actionSoft,
                { borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.actionSoftText, { color: palette.text }]}>Receipt</Text>
            </Pressable>
            {refundOk && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  askRefund();
                }}
                style={({ pressed }) => [
                  styles.actionDanger,
                  { backgroundColor: palette.danger, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={[styles.actionDangerText, { color: palette.onPrimary ?? '#ffffff' }]}>Refund</Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      <PaymentSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        booking={item}
        onConfirm={onConfirmPay}
        palette={palette}
        busy={payBusy}
      />

      <ReceiptSheet
        visible={receiptSheetVisible}
        onClose={() => setReceiptSheetVisible(false)}
        receipt={activeReceipt}
        booking={item}
        palette={palette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 18,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
    backgroundColor: 'white',
  },
  bookingCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  bookingIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingTitleWrap: { flex: 1, gap: 6 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  cardSubtitle: { fontSize: 13, lineHeight: 18 },
  badgeStack: { alignItems: 'flex-end', gap: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  infoGrid: { flexDirection: 'row', gap: 8, marginVertical: 0 },
  infoTile: { flex: 1, borderRadius: 18, padding: 14, gap: 8 },
  infoLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '800', lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  meta: { fontSize: 12, fontWeight: '600' },
  priceGrid: { borderTopWidth: 1, paddingTop: 14, gap: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 13, fontWeight: '600' },
  priceValue: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  priceLabelTotal: { fontSize: 14, fontWeight: '900' },
  priceValueTotal: { fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] },
  actionBar: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionPrimary: {
    flex: 1,
    minWidth: 140,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  actionPrimaryText: { fontWeight: '800', fontSize: 15 },
  actionSoft: {
    flex: 1,
    minWidth: 120,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 52,
  },
  actionSoftText: { fontWeight: '700', fontSize: 15 },
  actionDanger: {
    flex: 1,
    minWidth: 120,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  actionDangerText: { fontWeight: '800', fontSize: 15 },
});
