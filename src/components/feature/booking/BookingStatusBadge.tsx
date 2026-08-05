import { StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import type { BookingStatus, PaymentStatus } from '@/lib/models';

type BadgeSize = 'large' | 'small';

type BookingStatusBadgeProps = {
  status: BookingStatus;
  palette: AppPalette;
  size?: BadgeSize;
};

type PaymentStatusBadgeProps = {
  paymentStatus: PaymentStatus;
  palette: AppPalette;
  size?: BadgeSize;
};

type CombinedBadgeProps = {
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  palette: AppPalette;
};

function resolveBookingTone(
  status: BookingStatus,
  palette: AppPalette,
): { bg: string; textColor: string; label: string } {
  switch (status) {
    case 'PENDING':
      return { bg: palette.warningSoft, textColor: palette.warning, label: 'Awaiting Review' };
    case 'CONFIRMED':
      return { bg: palette.successSoft, textColor: palette.success, label: 'Confirmed' };
    case 'COMPLETED':
      return { bg: palette.successSoft, textColor: palette.success, label: 'Completed Stay' };
    case 'REJECTED':
      return { bg: palette.dangerSoft, textColor: palette.danger, label: 'Declined' };
    case 'CANCELLED':
      return { bg: palette.soft, textColor: palette.muted, label: 'Cancelled' };
  }
}

function resolvePaymentTone(
  paymentStatus: PaymentStatus,
  palette: AppPalette,
): { bg: string; textColor: string; label: string } {
  switch (paymentStatus) {
    case 'PAID':
      return { bg: palette.successSoft, textColor: palette.success, label: 'Paid' };
    case 'REFUNDED':
      return { bg: palette.soft, textColor: palette.muted, label: 'Refunded' };
    case 'UNPAID':
      return { bg: palette.warningSoft, textColor: palette.warning, label: 'Unpaid' };
  }
}

export function BookingStatusBadge({ status, palette, size = 'small' }: BookingStatusBadgeProps) {
  const { bg, textColor, label } = resolveBookingTone(status, palette);
  const pad = size === 'large' ? styles.largePill : styles.smallPill;
  const font = size === 'large' ? styles.largeText : styles.smallText;
  const weight = size === 'large' ? styles.largeText900 : font;

  return (
    <View style={[styles.pill, pad, { backgroundColor: bg }]}>
      <Text style={[size === 'large' ? weight : font, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function PaymentStatusBadge({
  paymentStatus,
  palette,
  size = 'small',
}: PaymentStatusBadgeProps) {
  const { bg, textColor, label } = resolvePaymentTone(paymentStatus, palette);
  const pad = size === 'large' ? styles.largePill : styles.smallPill;
  const font = size === 'large' ? styles.largeText : styles.smallText;

  return (
    <View style={[styles.pill, pad, { backgroundColor: bg }]}>
      <Text style={[font, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function BookingCombinedBadge({ status, paymentStatus, palette }: CombinedBadgeProps) {
  return (
    <View style={styles.combinedWrap}>
      <BookingStatusBadge status={status} palette={palette} size="large" />
      <View style={styles.combinedRight}>
        <PaymentStatusBadge paymentStatus={paymentStatus} palette={palette} size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  combinedWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  combinedRight: {
    alignSelf: 'flex-start',
  },
  pill: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largePill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  smallPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  largeText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  largeText900: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  smallText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
