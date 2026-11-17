import { StyleSheet, View } from 'react-native';

import { Button, Card, Column, Copy, Heading, IconTile, Meta } from '@/components/ui';
import { useLanguage } from '@/i18n/context';

import { useBooking } from '../context';
import { timeRange } from '../domain/format';
import { isActive } from '../domain/payment';
import { PhaseBadge } from './phase-badge';

/** Home-screen summary of the current booking, or an invitation to make the first one. */
export function NextGameCard({ onOpen }: { onOpen: () => void }) {
  const { t, dateLabel, localize } = useLanguage();
  const { booking } = useBooking();

  if (!isActive(booking)) {
    return (
      <Card>
        <View style={styles.lead}>
          <IconTile name="court" />
          <Column gap={2} style={styles.text}>
            <Heading>{t('courtWaiting')}</Heading>
            <Copy>{t('firstBooking')}</Copy>
          </Column>
        </View>
      </Card>
    );
  }

  const { slot, phase } = booking;
  return (
    <Card>
      <PhaseBadge phase={phase} />
      <Column gap={6}>
        <Heading>{localize(slot.court.name)}</Heading>
        <Meta icon="booking">{dateLabel(slot.day)}</Meta>
        <Meta icon="clock">
          {timeRange(slot.start, slot.duration)} · {t('minutes', { count: slot.duration })}
        </Meta>
      </Column>
      <Button secondary label={t('viewBooking')} onPress={onOpen} />
    </Card>
  );
}

const styles = StyleSheet.create({
  lead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  text: { flex: 1 },
});
