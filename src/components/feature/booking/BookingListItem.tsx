import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/lib/format';
import type { Booking, PaymentStatus, BookingStatus as BookingStatusType, Receipt } from '@/lib/models';
import { getReceiptForBooking, isRefundEligible, recordReceiptForPaidBooking } from '@/lib/payments';
import { useBookings } from '@/providers/BookingProvider';
import { PaymentSheet, type PaymentProvider } from '@/components/payments/PaymentSheet';
import { ReceiptSheet } from '@/components/payments/ReceiptSheet';

import type { BookingPalette } from './types';
import { prettyDate } from './utils';

type BookingListItemProps = {
  item: Booking;
  palette: BookingPalette;
  imageUri?: string;
};

function statusTone(status: BookingStatusType, palette: BookingPalette) {
  switch (status) {
    case 'PENDING':
      return palette.warning;
    case 'CONFIRMED':
    case 'COMPLETED':
      return palette.success;
    default:
      return palette.danger;
  }
}

function paymentTone(status: PaymentStatus, palette: BookingPalette) {
  switch (status) {
    case 'PAID':
      return palette.success;
    case 'UNPAID':
      return palette.warning;
    case 'REFUNDED':
      return palette.muted;
  }
}

export function BookingListItem({ item, palette, imageUri }: BookingListItemProps) {
  const { payBooking, refundBooking } = useBookings();
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [receiptSheetVisible, setReceiptSheetVisible] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const refundOk = isRefundEligible(item);

  const openReceipt = () => {
    const receipt = getReceiptForBooking(item.id) ?? recordReceiptForPaidBooking(item);
    setActiveReceipt(receipt);
    setReceiptSheetVisible(true);
  };

  const onConfirmPay = async (provider: PaymentProvider) => {
    if (payBusy) return;
    try {
      setPayBusy(true);
      await payBooking(item.id, provider);
      setPaymentSheetVisible(false);
    } catch (err) {
      Alert.alert('Payment failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setPayBusy(false);
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
          <View style={styles.imageWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <SymbolView
                  name={{ ios: 'bed.double.fill', android: 'hotel', web: 'hotel' } as any}
                  size={30}
                  tintColor="#ffffff"
                />
              </View>
            )}
            <View style={styles.scrim} />
            <View style={styles.badgeOverlayRow}>
              <View style={styles.overlayBadge}>
                <View style={[styles.overlayDot, { backgroundColor: statusTone(item.status, palette) }]} />
                <Text style={styles.overlayBadgeText}>{item.status}</Text>
              </View>
              <View style={styles.overlayBadge}>
                <View style={[styles.overlayDot, { backgroundColor: paymentTone(item.paymentStatus, palette) }]} />
                <Text style={styles.overlayBadgeText}>{item.paymentStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={1}>
              {item.listingTitle || 'Listing'}
            </Text>
            <Text style={[styles.cardSubtitle, { color: palette.muted }]} numberOfLines={1}>
              {item.location}
            </Text>

            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: 'calendar', android: 'event', web: 'event' } as any}
                size={14}
                tintColor={palette.muted}
              />
              <Text style={[styles.meta, { color: palette.muted }]} numberOfLines={1}>
                {prettyDate(item.startDate)} - {prettyDate(item.endDate)} · {item.nights} nights
              </Text>
            </View>

            <View style={[styles.priceGrid, { borderTopColor: palette.border }]}>
              <Text style={[styles.priceLabel, { color: palette.muted }]}>
                {formatMoney(item.pricePerNight, item.currency)}/night · Fee {formatMoney(item.serviceFee, item.currency)}
              </Text>
              <View style={styles.priceTotalWrap}>
                <Text style={[styles.priceLabelTotal, { color: palette.muted }]}>Total</Text>
                <Text style={[styles.priceValueTotal, { color: palette.primary }]}>
                  {formatMoney(item.total, item.currency)}
                </Text>
              </View>
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
                <Text style={[styles.actionDangerText, { color: palette.onPrimary }]}>Refund</Text>
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
    overflow: 'hidden',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  imageWrap: { width: '100%', height: 160, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    backgroundColor: '#b9bdc7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 64,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  badgeOverlayRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  overlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(17,24,39,0.55)',
  },
  overlayDot: { width: 6, height: 6, borderRadius: 3 },
  overlayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: '#ffffff',
  },
  body: { padding: 18, gap: 6 },
  cardTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, lineHeight: 24 },
  cardSubtitle: { fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  meta: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  priceGrid: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  priceLabel: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  priceTotalWrap: { alignItems: 'flex-end' },
  priceLabelTotal: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  priceValueTotal: { fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
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
