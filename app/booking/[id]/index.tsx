import { SymbolView } from 'expo-symbols';
import { Href, Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { BookingDetailCard } from '@/components/bookings/BookingDetailCard';
import { BookingPaymentSummary } from '@/components/bookings/BookingPaymentSummary';
import { BookingCombinedBadge } from '@/components/bookings/BookingStatusBadge';
import { BookingTimeline } from '@/components/bookings/BookingTimeline';
import { PaymentSheet } from '@/components/payments/PaymentSheet';
import { ReceiptSheet } from '@/components/payments/ReceiptSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBooking, type EnrichedBooking } from '@/hooks/useBooking';
import { formatMoney } from '@/lib/format';
import type { Receipt as ReceiptType } from '@/lib/models';
import {
  confirmPayment,
  createPaymentIntent,
  getReceiptForBooking,
  isRefundEligible,
} from '@/lib/payments';
import { useAuth } from '@/providers/AuthProvider';
import { useBookings } from '@/providers/BookingProvider';
import { prettyDate } from '@/components/bookings/utils';

function StayDatesCard({ booking, palette }: { booking: EnrichedBooking; palette: any }) {
  return (
    <View
      style={[
        styles.stayCard,
        { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow },
      ]}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.stayIconBubble, { backgroundColor: palette.primarySoft }]}>
              <SymbolView
                name={{ ios: 'calendar', android: 'event', web: 'event' } as any}
                size={18}
                tintColor={palette.primary}
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.stayEyebrow, { color: palette.muted }]}>CHECK-IN</Text>
              <Text style={[styles.stayDate, { color: palette.text }]}>
                {prettyDate(booking.startDate)}
              </Text>
            </View>
          </View>
          <View style={[styles.stayDivider, { backgroundColor: palette.border }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.stayIconBubble, { backgroundColor: palette.primarySoft }]}>
              <SymbolView
                name={{ ios: 'calendar', android: 'event', web: 'event' } as any}
                size={18}
                tintColor={palette.primary}
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.stayEyebrow, { color: palette.muted }]}>CHECK-OUT</Text>
              <Text style={[styles.stayDate, { color: palette.text }]}>
                {prettyDate(booking.endDate)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.nightsCard, { backgroundColor: palette.soft }]}>
          <SymbolView
            name={{ ios: 'moon.stars.fill', android: 'hotel', web: 'hotel' } as any}
            size={20}
            tintColor={palette.primary}
          />
          <Text style={[styles.nightsCount, { color: palette.primary }]}>{booking.nights}</Text>
          <Text style={[styles.nightsLabel, { color: palette.muted }]}>
            night{booking.nights !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = id ?? '';
  const { palette } = useAppTheme();
  const { data: booking } = useBooking(bookingId);
  const { profile } = useAuth();
  const role = profile?.role ?? 'RENTER';
  const profileId = 'id' in (profile as any) ? (profile as any).id : undefined;
  const { payBooking, refundBooking, decideBooking, decideBusy } = useBookings();

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptType | null>(null);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [payBusy, setPayBusy] = useState(false);

  const openReceipt = () => {
    if (!booking) return;
    let receipt = getReceiptForBooking(booking.id);
    if (!receipt) {
      const intent = createPaymentIntent(booking);
      const out = confirmPayment(intent.id, 'Card');
      receipt = out.receipt;
    }
    setActiveReceipt(receipt);
    setReceiptOpen(true);
  };

  const onConfirmPay = async () => {
    if (!booking || payBusy) return;
    try {
      setPayBusy(true);
      await payBooking(booking.id);
    } finally {
      setPayBusy(false);
      setPaymentSheetVisible(false);
    }
  };

  const askRefund = () => {
    if (!booking) return;
    Alert.alert(
      'Request refund',
      `Refund ${formatMoney(booking.total, booking.currency)} for ${booking.listing.title || booking.listingTitle}? This will reverse the payment in accordance with our cancellation policy.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            await refundBooking(booking.id, 'Guest requested cancellation');
          },
        },
      ],
    );
  };

  const canAccess = (() => {
    if (!booking) return true;
    if (role === 'LANDLORD') {
      const { ownerBookings } = useBookings();
      return ownerBookings.some((ob) => ob.id === bookingId);
    }
    return true;
  })();

  const refundEligible = booking ? isRefundEligible(booking) : false;
  const decideIsBusy = bookingId ? Boolean(decideBusy[bookingId]) : false;

  return (
    <>
      <Stack.Screen options={{ title: 'Booking' }} />
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor: palette.bg },
          ]}>
          {!booking ? (
            <View style={[styles.notFoundWrap, { alignItems: 'center', justifyContent: 'center' }]}>
              <View style={[styles.notFoundIcon, { backgroundColor: palette.dangerSoft }]}>
                <SymbolView
                  name={{ ios: 'exclamationmark.triangle.fill', android: 'error', web: 'error' } as any}
                  size={32}
                  tintColor={palette.danger}
                />
              </View>
              <Text style={[styles.title, { color: palette.text, marginTop: 16 }]}>Booking not found</Text>
              <Text style={[styles.subtitle, { color: palette.muted, marginTop: 6, textAlign: 'center' }]}>
                This booking may have been removed or the link is incorrect.
              </Text>
              <Link href="/(tabs)/bookings" asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.backButton,
                    { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1, marginTop: 20 },
                  ]}>
                  <Text style={[styles.backButtonText, { color: palette.onPrimary }]}>Back to bookings</Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <>
              {!canAccess ? (
                <View
                  style={[
                    styles.bannerCard,
                    { backgroundColor: palette.warningSoft, borderColor: palette.warning },
                  ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <SymbolView
                      name={{ ios: 'lock.fill', android: 'lock', web: 'lock' } as any}
                      size={16}
                      tintColor={palette.warning}
                    />
                    <Text style={[styles.bannerText, { color: palette.warning }]}>
                      You don't own this booking
                    </Text>
                  </View>
                </View>
              ) : null}

              <BookingDetailCard booking={booking} palette={palette} />

              <BookingCombinedBadge
                status={booking.status}
                paymentStatus={booking.paymentStatus}
                palette={palette}
              />

              <StayDatesCard booking={booking} palette={palette} />

              <BookingTimeline booking={booking} palette={palette} />

              <BookingPaymentSummary booking={booking} palette={palette} />

              {canAccess ? (
                <View style={styles.actionFooter}>
                  {role === 'RENTER' && booking.paymentStatus === 'UNPAID' && (
                    <Button onPress={() => setPaymentSheetVisible(true)}>
                      Pay Now · {formatMoney(booking.total, booking.currency)}
                    </Button>
                  )}

                  {role === 'RENTER' && booking.paymentStatus === 'PAID' && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Button variant="secondary" onPress={openReceipt}>
                          Receipt
                        </Button>
                      </View>
                      {refundEligible && (
                        <View style={{ flex: 1 }}>
                          <Button variant="danger" onPress={askRefund}>
                            Refund
                          </Button>
                        </View>
                      )}
                    </View>
                  )}

                  {role === 'RENTER' && booking.paymentStatus === 'REFUNDED' && (
                    <Button variant="secondary" onPress={openReceipt}>
                      View receipt
                    </Button>
                  )}

                  {role === 'LANDLORD' && booking.status === 'PENDING' && (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Button
                          loading={decideIsBusy}
                          disabled={decideIsBusy}
                          onPress={() => decideBooking(booking.id, 'APPROVE')}>
                          Accept
                        </Button>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          variant="danger"
                          loading={decideIsBusy}
                          disabled={decideIsBusy}
                          onPress={() => decideBooking(booking.id, 'REJECT')}>
                          Reject
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.actionFooter}>
                  <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                      styles.softBack,
                      { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
                    ]}>
                    <SymbolView
                      name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow_back' } as any}
                      size={16}
                      tintColor={palette.text}
                    />
                    <Text style={[styles.softBackText, { color: palette.text }]}>Go back</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {booking ? (
          <>
            <PaymentSheet
              visible={paymentSheetVisible}
              onClose={() => setPaymentSheetVisible(false)}
              booking={booking}
              onConfirm={onConfirmPay}
              palette={palette}
              busy={payBusy}
            />

            <ReceiptSheet
              visible={receiptOpen}
              onClose={() => setReceiptOpen(false)}
              receipt={activeReceipt}
              booking={booking}
              palette={palette}
            />
          </>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 80,
    gap: 14,
  },
  notFoundWrap: {
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14 },
  backButton: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: { fontSize: 15, fontWeight: '800' },
  bannerCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  stayCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  stayIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  stayDate: {
    fontSize: 15,
    fontWeight: '800',
  },
  stayDivider: {
    width: 2,
    height: 16,
    marginLeft: 19,
    marginTop: -2,
    marginBottom: -2,
    opacity: 0.6,
  },
  nightsCard: {
    width: 92,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 2,
  },
  nightsCount: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  nightsLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  actionFooter: {
    marginTop: 4,
    marginBottom: 8,
  },
  softBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
  },
  softBackText: { fontWeight: '800', fontSize: 15 },
});
