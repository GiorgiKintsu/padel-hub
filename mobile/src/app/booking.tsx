import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { Button, Card, Column, Copy, Heading, IconTile, Notice } from '@/components/ui';
import { CountdownCard } from '@/features/booking/components/countdown-card';
import { PaymentCard } from '@/features/booking/components/payment-card';
import { PhaseBadge } from '@/features/booking/components/phase-badge';
import { SlotSummaryCard } from '@/features/booking/components/slot-summary-card';
import { useBooking } from '@/features/booking/context';
import { money } from '@/features/booking/domain/format';
import { isPending, outstanding, totalPaid } from '@/features/booking/domain/payment';
import { useLanguage } from '@/i18n/context';

export default function BookingScreen() {
  const { t } = useLanguage();
  const { booking, pay, coverRemaining, reset } = useBooking();

  if (!booking) {
    return (
      <Screen title={t('myBooking')}>
        <Card>
          <IconTile name="booking" />
          <Column gap={4}>
            <Heading>{t('noBooking')}</Heading>
            <Copy>{t('noBookingHint')}</Copy>
          </Column>
          <Button label={t('findCourt')} onPress={() => router.navigate('/')} />
        </Card>
      </Screen>
    );
  }

  const { slot, phase } = booking;

  return (
    <Screen title={t('myBooking')}>
      <PhaseBadge phase={phase} />
      <SlotSummaryCard slot={slot} />

      {/* Keyed by deadline: when the friends' clock starts, the timer restarts with a fresh "now". */}
      {isPending(booking) && <CountdownCard key={booking.deadline} booking={booking} />}

      {phase === 'expired' && (
        <Column gap={4}>
          <Heading>{t('courtReleased')}</Heading>
          <Notice tone="danger" icon="alert">
            {t('refundExplanation', { amount: money(totalPaid(booking)) })}
          </Notice>
        </Column>
      )}

      <PaymentCard booking={booking} onPay={pay} />

      <Column gap={10}>
        {phase === 'friends' && (
          <Button label={t('coverRemaining', { amount: money(outstanding(booking)) })} onPress={coverRemaining} />
        )}
        <Button
          secondary
          label={t('clearBooking')}
          onPress={() => {
            reset();
            router.replace('/');
          }}
        />
      </Column>
    </Screen>
  );
}
