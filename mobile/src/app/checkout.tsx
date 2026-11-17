import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Chip, ChipGroup, Column, Copy, Display, Heading, Label, Notice, Row } from '@/components/ui';
import { SlotSummaryCard } from '@/features/booking/components/slot-summary-card';
import { useBooking } from '@/features/booking/context';
import { money } from '@/features/booking/domain/format';
import { isActive, price, SPLIT_OPTIONS } from '@/features/booking/domain/payment';
import { isAvailable } from '@/features/booking/domain/schedule';
import { useNow } from '@/hooks/use-now';
import { useLanguage } from '@/i18n/context';
import { colors, radius } from '@/theme';

/** The service fee is zero in the demo. The real fee model is a product decision that is not built yet. */
const DEMO_SERVICE_FEE = 0;

export default function Checkout() {
  const { t } = useLanguage();
  const { selection, begin, booking } = useBooking();
  const [payers, setPayers] = useState(1);
  const now = useNow(1000);

  // Reached without picking a court first, e.g. through a deep link or a web reload.
  if (!selection) {
    return (
      <Screen back title={t('chooseCourt')}>
        <Copy>{t('chooseCourtHint')}</Copy>
        <Button label={t('viewCourts')} onPress={() => router.replace('/courts')} />
      </Screen>
    );
  }

  const total = price(selection.court, selection.duration);
  // The slot can pass its booking cutoff while this screen is open.
  const stillAvailable = isAvailable(selection, now);

  return (
    <Screen back title={t('summary')}>
      <SlotSummaryCard slot={selection}>
        <Row>
          <Label onDark>{t('totalPrice')}</Label>
          <Display style={styles.total}>{money(total)}</Display>
        </Row>
      </SlotSummaryCard>

      <Card>
        <Heading>{t('howPay')}</Heading>
        <Column gap={10}>
          <ChipGroup>
            <Chip label={t('payFull')} active={payers === 1} onPress={() => setPayers(1)} />
            {SPLIT_OPTIONS.map(count => (
              <Chip
                key={count}
                label={t('splitPeople', { count })}
                active={payers === count}
                onPress={() => setPayers(count)}
              />
            ))}
          </ChipGroup>
          <Copy>{payers === 1 ? t('fullHint') : t('splitHint')}</Copy>
        </Column>

        <View style={styles.share}>
          <Row>
            <Label>{t('yourShare')}</Label>
            <Heading style={styles.shareAmount}>{money(total / payers)}</Heading>
          </Row>
          <Copy>{t('demoFee', { amount: money(DEMO_SERVICE_FEE) })}</Copy>
        </View>
      </Card>

      <Card variant="muted">
        <Heading>{t('demoScenario')}</Heading>
        <Column gap={8}>
          <Copy>{t('timerRules')}</Copy>
          <Copy>{t('simulationHint')}</Copy>
        </Column>
      </Card>

      {!stillAvailable && (
        <Notice tone="danger" icon="alert">
          {t('noLongerAvailable')}
        </Notice>
      )}

      {isActive(booking) ? (
        <Button label={t('viewCurrent')} onPress={() => router.replace('/booking')} />
      ) : (
        <Button
          disabled={!stillAvailable}
          label={t('startPayment')}
          onPress={() => {
            begin(payers);
            router.replace('/booking');
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.lime },
  share: { gap: 4, padding: 14, borderRadius: radius.md, backgroundColor: colors.limeSoft },
  shareAmount: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
});
