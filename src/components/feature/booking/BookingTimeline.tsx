import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import type { Booking } from '@/lib/models';
import type { EnrichedBooking } from '@/hooks/useBooking';

type StepState = 'completed' | 'active' | 'pending' | 'skipped';

type TimelineStep = {
  key: string;
  title: string;
  date: string;
  state: StepState;
  symbol: { ios: string; android: string; web: string };
};

function parseDate(value: string): Date | null {
  if (!value) return null;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function parseIsoDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatStepDate(iso: string): string {
  const dt = parseDate(iso) ?? parseIsoDate(iso);
  if (!dt) return iso;
  return dt.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildSteps(booking: Booking | EnrichedBooking): TimelineStep[] {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startDt = parseIsoDate(booking.startDate);
  const endDt = parseIsoDate(booking.endDate);
  const isPastEnd = endDt ? endDt.getTime() < todayUtc : false;
  const isActiveStay = startDt && endDt
    ? startDt.getTime() <= todayUtc && endDt.getTime() >= todayUtc
    : false;
  const isFuture = startDt ? startDt.getTime() > todayUtc : true;
  const isTerminalBad = booking.status === 'CANCELLED' || booking.status === 'REJECTED';

  const steps: TimelineStep[] = [];

  steps.push({
    key: 'requested',
    title: 'Booking requested',
    date: formatStepDate(booking.createdAt || booking.startDate),
    state: 'completed',
    symbol: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
  });

  const reviewState: StepState = booking.status === 'PENDING' ? 'active'
    : booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'pending'
    : 'completed';
  steps.push({
    key: 'review',
    title: booking.status === 'PENDING' ? 'Awaiting host review' : 'Host reviewed',
    date: reviewState === 'completed' ? formatStepDate(booking.createdAt || booking.startDate) : 'Pending',
    state: reviewState,
    symbol: { ios: 'person.2.fill', android: 'group', web: 'group' },
  });

  const payDone = booking.paymentStatus === 'PAID' || booking.paymentStatus === 'REFUNDED';
  const paySkipped = isTerminalBad && !payDone;
  const payState: StepState = paySkipped ? 'skipped'
    : payDone ? 'completed'
    : 'pending';
  steps.push({
    key: 'payment',
    title: booking.paymentStatus === 'REFUNDED' ? 'Payment refunded'
      : booking.paymentStatus === 'PAID' ? 'Payment confirmed'
      : 'Payment pending',
    date: payState === 'completed' || payState === 'skipped' ? formatStepDate(booking.createdAt || booking.startDate) : 'Pending',
    state: payState,
    symbol: { ios: 'banknote.fill', android: 'payments', web: 'payments' },
  });

  const stayState: StepState = booking.status === 'COMPLETED' ? 'completed'
    : isTerminalBad ? 'skipped'
    : isActiveStay ? 'active'
    : booking.status === 'CONFIRMED' && isFuture ? 'pending'
    : booking.status === 'CONFIRMED' && isPastEnd ? 'completed'
    : 'pending';
  steps.push({
    key: 'stay',
    title: booking.status === 'COMPLETED' ? 'Stay completed'
      : isTerminalBad ? 'Booking did not proceed'
      : isActiveStay ? 'Stay in progress'
      : isFuture ? 'Upcoming stay'
      : 'Stay',
    date: booking.endDate ? formatStepDate(booking.endDate) : 'Pending',
    state: stayState,
    symbol: { ios: 'moon.stars.fill', android: 'hotel', web: 'hotel' },
  });

  if (isTerminalBad) {
    steps.push({
      key: 'cancelled',
      title: booking.status === 'CANCELLED' ? 'Booking cancelled' : 'Booking declined',
      date: formatStepDate(booking.createdAt || booking.startDate),
      state: 'completed',
      symbol: { ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' },
    });
  } else {
    const completedState: StepState = booking.status === 'COMPLETED' ? 'completed' : 'pending';
    steps.push({
      key: 'completed',
      title: booking.status === 'COMPLETED' ? 'Journey completed' : 'Awaiting completion',
      date: booking.status === 'COMPLETED' && booking.endDate ? formatStepDate(booking.endDate) : 'Pending',
      state: completedState,
      symbol: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
    });
  }

  return steps.filter((s) => s.state !== 'skipped');
}

type BookingTimelineProps = {
  booking: Booking | EnrichedBooking;
  palette: AppPalette;
};

function dotStyle(state: StepState, palette: AppPalette) {
  switch (state) {
    case 'completed':
      return { bg: palette.success, border: palette.success, color: palette.onPrimary ?? '#ffffff' };
    case 'active':
      return { bg: palette.primary, border: palette.primary, color: palette.onPrimary ?? '#ffffff' };
    case 'pending':
    default:
      return { bg: palette.soft, border: palette.border, color: palette.muted };
  }
}

function lineColor(state: StepState, palette: AppPalette): string {
  switch (state) {
    case 'completed':
      return palette.success;
    case 'active':
      return palette.primary;
    case 'pending':
    default:
      return palette.border;
  }
}

export function BookingTimeline({ booking, palette }: BookingTimelineProps) {
  const steps = buildSteps(booking);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}>
      <Text style={[styles.headerLabel, { color: palette.muted }]}>Booking timeline</Text>

      <View style={styles.stepsWrap}>
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const nextState = isLast ? step.state : steps[idx + 1]?.state ?? 'pending';
          const dot = dotStyle(step.state, palette);
          const connector = lineColor(step.state, palette);
          const titleColor = step.state === 'pending' ? palette.muted : palette.text;
          const dateColor = palette.muted;

          return (
            <View key={step.key} style={styles.stepRow}>
              <View style={styles.railWrap}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: dot.bg,
                      borderColor: dot.border,
                    },
                  ]}>
                  <SymbolView
                    name={step.symbol as any}
                    size={14}
                    tintColor={dot.color}
                    weight="semibold"
                  />
                </View>
                {!isLast ? (
                  <View
                    style={[
                      styles.railLine,
                      {
                        backgroundColor: connector,
                        opacity: step.state === 'completed' ? 1 : 0.5,
                      },
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: titleColor }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDate, { color: dateColor }]}>{step.date}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  stepsWrap: {
    gap: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 62,
  },
  railWrap: {
    width: 28,
    alignItems: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  railLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 14,
    paddingLeft: 12,
    gap: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  stepDate: {
    fontSize: 12,
    fontWeight: '600',
  },
});
