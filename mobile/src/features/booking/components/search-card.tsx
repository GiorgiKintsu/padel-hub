import { Button, Card, Chip, ChipGroup, Column, Copy, Heading, Label } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { useLanguage } from '@/i18n/context';

import { useBooking } from '../context';
import { clock } from '../domain/format';
import { dayKey, DURATION_OPTIONS, START_OPTIONS, upcomingDays } from '../domain/schedule';

/** The day / time / duration picker on the home screen. */
export function SearchCard({ onSubmit }: { onSubmit: () => void }) {
  const { t, weekday } = useLanguage();
  const { search, updateSearch } = useBooking();
  // Minute precision is plenty: the list of days only changes at midnight.
  const now = useNow(60_000);

  return (
    <Card variant="dark">
      <Heading onDark>{t('when')}</Heading>
      <ChipGroup scroll>
        {upcomingDays(now).map(date => {
          const day = dayKey(date);
          return (
            <Chip
              dark
              key={day}
              caption={weekday(date)}
              label={String(date.getDate())}
              active={search.day === day}
              onPress={() => updateSearch({ day })}
            />
          );
        })}
      </ChipGroup>

      <Column gap={8}>
        <Label onDark>{t('time')}</Label>
        <ChipGroup scroll>
          {START_OPTIONS.map(start => (
            <Chip
              dark
              key={start}
              label={clock(start)}
              active={search.start === start}
              onPress={() => updateSearch({ start })}
            />
          ))}
        </ChipGroup>
      </Column>

      <Column gap={8}>
        <Label onDark>{t('duration')}</Label>
        <ChipGroup>
          {DURATION_OPTIONS.map(duration => (
            <Chip
              dark
              key={duration}
              label={t('minutes', { count: duration })}
              active={search.duration === duration}
              onPress={() => updateSearch({ duration })}
            />
          ))}
        </ChipGroup>
      </Column>

      <Column gap={10}>
        <Button label={t('findBest')} onPress={onSubmit} />
        <Copy onDark>{t('searchHint')}</Copy>
      </Column>
    </Card>
  );
}
