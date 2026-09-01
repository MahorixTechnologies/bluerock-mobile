import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import {
  formatBookingDatesCompact,
  getBookingStatusMeta,
  getPaymentStatusMeta,
  getTimelineEvents,
  type TimelineEvent,
} from '@/components/bookings/utils';
import { formatMoney } from '@/lib/format';
import { Card, Eyebrow, Row2, cardStyles, type PaletteLike } from './presentational';
import type { TabKey, NormalizedBooking } from './types';

export function BookingTabBody(props: {
  tab: TabKey;
  booking: NormalizedBooking | null;
  palette: PaletteLike;
  profileRole: 'RENTER' | 'LANDLORD' | 'ADMIN' | string;
  ownerRole: boolean;
  onPay: () => void;
  onDecide: (d: 'APPROVE' | 'REJECT') => void;
  onRefund: () => void;
  onClose: () => void;
}) {
  const { tab, booking, palette, profileRole, ownerRole, onPay, onDecide, onRefund, onClose } = props;

  const display: NormalizedBooking | null = booking;

  if (!display) {
    return (
      <Card palette={palette}>
        <Text style={[cardStyles.title, { color: palette.text }]}>No booking data</Text>
        <Text style={[cardStyles.meta, { color: palette.muted }]}>
          Open a booking from the Bookings tab.
        </Text>
      </Card>
    );
  }

  const statusMeta = getBookingStatusMeta(display.status);
  const payMeta = getPaymentStatusMeta(display.paymentStatus);
  const timeline = getTimelineEvents(display);

  if (tab === 'info') {
    return (
      <View style={{ gap: 12 }}>
        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.primary}>STAY</Eyebrow>
          <Text style={[cardStyles.title, { color: palette.text }]}>{display.listingTitle}</Text>
          <Text style={[cardStyles.meta, { color: palette.muted }]}>{display.location}</Text>
          <View style={cardStyles.divider} />
          <Row2 palette={palette} label="Dates" value={formatBookingDatesCompact(display.startDate, display.endDate)} />
          <Row2 palette={palette} label="Nights" value={`${display.nights}`} />
          <Row2 palette={palette} label="Guests" value="—" />
        </Card>

        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.success}>STATUS</Eyebrow>
          <View style={cardStyles.badgeRow}>
            <View style={[cardStyles.badge, { backgroundColor: statusMeta.background }]}>
              <Text style={[cardStyles.badgeText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
            </View>
            <View style={[cardStyles.badge, { backgroundColor: payMeta.background }]}>
              <Text style={[cardStyles.badgeText, { color: payMeta.color }]}>{payMeta.label}</Text>
            </View>
          </View>
          <View style={cardStyles.divider} />
          <Row2 palette={palette} label="Booking ID" value={`#${display.id}`} mono />
          <Row2 palette={palette} label="Rate" value={formatMoney(display.pricePerNight, display.currency) + ' / night'} />
          <Row2 palette={palette} label="Subtotal" value={formatMoney(display.subtotal, display.currency)} />
          <Row2 palette={palette} label="Service fee" value={formatMoney(display.serviceFee, display.currency)} />
          <Row2 palette={palette} label="Total" value={formatMoney(display.total, display.currency)} strong />
        </Card>
      </View>
    );
  }

  if (tab === 'actions') {
    const canPay = display.paymentStatus === 'UNPAID' && display.status !== 'REJECTED' && display.status !== 'CANCELLED';
    const canRefund = display.paymentStatus === 'PAID' && display.status !== 'CANCELLED';
    const canDecide = ownerRole && display.status === 'PENDING';
    const renterView = profileRole !== 'LANDLORD';
    return (
      <View style={{ gap: 12 }}>
        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.primary}>ACTIONS</Eyebrow>
          <Text style={[cardStyles.title, { color: palette.text }]}>
            {renterView ? 'Manage your reservation' : 'Respond to this request'}
          </Text>
          <Text style={[cardStyles.meta, { color: palette.muted }]}>
            {renterView
              ? 'Pay for your stay or request a refund according to our policy.'
              : 'Approve or reject booking requests below. Pending requests hold the dates until you decide.'}
          </Text>
        </Card>

        {canDecide ? (
          <Card palette={palette}>
            <Eyebrow palette={palette} color={palette.warning}>HOST DECISION</Eyebrow>
            <View style={{ gap: 10 }}>
              <Button onPress={() => onDecide('APPROVE')}>Approve booking</Button>
              <Button variant="danger" onPress={() => onDecide('REJECT')}>
                Reject request
              </Button>
            </View>
          </Card>
        ) : null}

        {renterView ? (
          <Card palette={palette}>
            <Eyebrow palette={palette} color={palette.success}>PAYMENT</Eyebrow>
            <View style={cardStyles.priceRow}>
              <Text style={[cardStyles.priceLabel, { color: palette.muted }]}>Total due</Text>
              <Text style={[cardStyles.priceValue, { color: palette.text }]}>
                {formatMoney(display.total, display.currency)}
              </Text>
            </View>
            <View style={{ gap: 10, marginTop: 6 }}>
              <Button disabled={!canPay} loading={false} onPress={onPay}>
                {canPay ? `Pay ${formatMoney(display.total, display.currency)}` : 'Already paid'}
              </Button>
              <Button
                variant="secondary"
                disabled={!canRefund}
                onPress={onRefund}>
                Request refund
              </Button>
            </View>
          </Card>
        ) : null}

        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.muted}>QUICK LINKS</Eyebrow>
          <View style={{ gap: 10 }}>
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Card palette={palette}>
        <Eyebrow palette={palette} color={palette.primary}>TIMELINE</Eyebrow>
        <Text style={[cardStyles.title, { color: palette.text }]}>Booking status log</Text>
        <Text style={[cardStyles.meta, { color: palette.muted }]}>
          A simple record of what happened and what comes next.
        </Text>
        <View style={cardStyles.divider} />
        <View style={{ gap: 0 }}>
          {timeline.map((e: TimelineEvent, idx: number) => (
            <View key={e.label} style={cardStyles.timelineRow}>
              <View style={{ alignItems: 'center', width: 22 }}>
                <View
                  style={[
                    cardStyles.timelineDot,
                    {
                      backgroundColor: e.done ? palette.success : palette.border,
                      borderColor: e.done ? palette.success : palette.border,
                    },
                  ]}
                />
                {idx < timeline.length - 1 ? (
                  <View style={[cardStyles.timelineRail, { backgroundColor: palette.border }]} />
                ) : null}
              </View>
              <View style={{ flex: 1, paddingTop: 2, paddingBottom: idx === timeline.length - 1 ? 2 : 14 }}>
                <Text style={[cardStyles.timelineLabel, { color: palette.text }]}>{e.label}</Text>
                <Text style={[cardStyles.timelineMeta, { color: palette.muted }]}>{e.when ?? 'Pending'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}
