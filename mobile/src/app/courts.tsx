import { router } from 'expo-router';
import { useState } from 'react';

import { Screen } from '@/components/screen';
import { Button, Card, Chip, ChipGroup, Column, Copy, Heading, IconTile, Meta, Notice } from '@/components/ui';
import { CourtOptionCard } from '@/features/booking/components/court-option-card';
import { useBooking } from '@/features/booking/context';
import { clock } from '@/features/booking/domain/format';
import { isActive } from '@/features/booking/domain/payment';
import { useCourtOptions } from '@/features/booking/use-court-options';
import { useLanguage } from '@/i18n/context';

export default function Courts() {
  const { t, dateLabel, localize } = useLanguage();
  const { search, select, booking } = useBooking();
  const [showAll, setShowAll] = useState(false);
  const best = useCourtOptions(search);
  // "All courts" is a directory, so it is ordered by name rather than by how well a court matches.
  const options = showAll
    ? [...best].sort((a, b) => localize(a.court.name).localeCompare(localize(b.court.name)))
    : best;
  const hasActiveBooking = isActive(booking);

  return (
    <Screen back title={t('freeCourts')}>
      <Column>
        <Meta icon="booking">
          {dateLabel(search.day)} · {clock(search.start)} · {t('minutes', { count: search.duration })}
        </Meta>
        <ChipGroup>
          <Chip label={t('bestOptions')} active={!showAll} onPress={() => setShowAll(false)} />
          <Chip label={t('allCourts')} active={showAll} onPress={() => setShowAll(true)} />
        </ChipGroup>
      </Column>

      {hasActiveBooking && (
        <Column gap={10}>
          <Notice>{t('existingBooking')}</Notice>
          <Button secondary label={t('myBooking')} onPress={() => router.push('/booking')} />
        </Column>
      )}

      {options.length === 0 && (
        <Card>
          <IconTile name="clock" />
          <Column gap={4}>
            <Heading>{t('noTimes')}</Heading>
            <Copy>{t('chooseAnother')}</Copy>
          </Column>
          <Button label={t('changeSearch')} onPress={() => router.replace('/')} />
        </Card>
      )}

      {options.map(option => (
        <CourtOptionCard
          key={option.court.id}
          option={option}
          search={search}
          showAllStarts={showAll}
          disabled={hasActiveBooking}
          onReserve={start => {
            select({ court: option.court, day: search.day, start, duration: search.duration });
            router.push('/checkout');
          }}
        />
      ))}
    </Screen>
  );
}
