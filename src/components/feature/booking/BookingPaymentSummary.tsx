import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { PaymentStatusBadge } from '@/components/bookings/BookingStatusBadge';
import type { AppPalette } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { Booking } from '@/lib/models';
import type { EnrichedBooking } from '@/hooks/useBooking';

type BookingPaymentSummaryProps = {
  booking: Booking | EnrichedBooking;
  palette: AppPalette;
};

export function BookingPaymentSummary({
  booking,
  palette,
}: BookingPaymentSummaryProps) {
  const perNight = booking.nights > 0
    ? Math.round(booking.subtotal / booking.nights)
    : booking.pricePerNight || 0;

  return (
    <View
      style={[
        styles.priceCard,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}>
      <Text style={[styles.headerLabel, { color: palette.muted }]}>Payment summary</Text>

      <View style={[styles.priceRow]}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={[styles.priceLabel, { color: palette.text }]}>Accommodation</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={[styles.priceValue, { color: palette.text }]}>
            {formatMoney(booking.subtotal, booking.currency)}
          </Text>
          <Text style={[styles.priceSubLabel, { color: palette.muted }]}>
            {booking.nights} nights × {formatMoney(perNight, booking.currency)}
          </Text>
        </View>
      </View>

      <View style={[styles.priceRow]}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={[styles.priceLabel, { color: palette.text }]}>Service fee</Text>
          <Text style={[styles.feePctLabel, { color: palette.muted }]}>10%</Text>
        </View>
        <Text style={[styles.priceValue, { color: palette.text }]}>
          {formatMoney(booking.serviceFee, booking.currency)}
        </Text>
      </View>

      <View style={[styles.totalRow]}>
        <Text style={[styles.totalLabel, { color: palette.text }]}>Total payable</Text>
        <Text style={[styles.totalValue, { color: palette.primary }]}>
          {formatMoney(booking.total, booking.currency)}
        </Text>
      </View>

      <View style={[styles.paymentMethodRow, { backgroundColor: palette.soft }]}>
        <View style={styles.paymentMethodLeft}>
          <View style={[styles.cardIconBubble, { backgroundColor: palette.primarySoft }]}>
            <SymbolView
              name={{ ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' } as any}
              size={16}
              tintColor={palette.primary}
            />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={[styles.pmLabel, { color: palette.muted }]}>Payment method</Text>
            <Text style={[styles.pmValue, { color: palette.text }]}>Card •••• 4242</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusRow}>
        <PaymentStatusBadge paymentStatus={booking.paymentStatus} palette={palette} size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: { fontSize: 14, fontWeight: '600' },
  feePctLabel: { fontSize: 12, fontWeight: '700' },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  priceSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  paymentMethodRow: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 2,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pmLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pmValue: { fontSize: 14, fontWeight: '800' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 2,
  },
});
