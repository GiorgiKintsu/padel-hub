import type { ReactNode } from 'react';

import { Card, Column, Divider, Heading, Meta } from '@/components/ui';
import { useLanguage } from '@/i18n/context';

import { timeRange } from '../domain/format';
import type { Slot } from '../domain/schedule';

type SlotSummaryCardProps = {
  slot: Slot;
  /** Shown under a divider at the bottom of the card, e.g. the price. */
  children?: ReactNode;
};

/** The green hero card that says which court, which day and what time. Shared by checkout and the booking screen. */
export function SlotSummaryCard({ slot, children }: SlotSummaryCardProps) {
  const { t, dateLabel, localize } = useLanguage();
  const { court } = slot;

  return (
    <Card variant="dark">
      <Heading onDark>{localize(court.name)}</Heading>
      <Column gap={8}>
        <Meta onDark icon="location">
          {localize(court.area)} · {t('courtNumber', { number: court.number })} ·{' '}
          {court.indoor ? t('indoor') : t('outdoor')}
        </Meta>
        <Meta onDark icon="booking">
          {dateLabel(slot.day)}
        </Meta>
        <Meta onDark icon="clock">
          {timeRange(slot.start, slot.duration)} · {t('minutes', { count: slot.duration })}
        </Meta>
      </Column>
      {children !== undefined && (
        <>
          <Divider onDark />
          {children}
        </>
      )}
    </Card>
  );
}
