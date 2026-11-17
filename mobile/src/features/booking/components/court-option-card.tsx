import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Button, Card, Chip, ChipGroup, Column, Divider, Heading, Label, Meta, Row } from '@/components/ui';
import { useLanguage } from '@/i18n/context';

import { clock, money, signedMinutes, timeRange } from '../domain/format';
import { price } from '../domain/payment';
import type { CourtOption, Search } from '../domain/schedule';
import type { MinuteOfDay } from '../domain/units';

/** How many of the closest start times are offered before the player asks for all of them. */
const BEST_STARTS = 3;

type CourtOptionCardProps = {
  option: CourtOption;
  search: Search;
  /** Lists every free start time in clock order instead of the closest few. */
  showAllStarts: boolean;
  disabled: boolean;
  onReserve: (start: MinuteOfDay) => void;
};

/** One court in the search results, with a start-time picker and its price. */
export function CourtOptionCard({ option, search, showAllStarts, disabled, onReserve }: CourtOptionCardProps) {
  const { t, localize } = useLanguage();
  const { court, starts, best } = option;
  const [picked, setPicked] = useState<MinuteOfDay | null>(null);

  // A picked time can disappear when the search changes or the booking cutoff passes; fall back to the best one.
  const start = picked !== null && starts.includes(picked) ? picked : best;
  const offset = start - search.start;
  const shownStarts = showAllStarts ? [...starts].sort((a, b) => a - b) : starts.slice(0, BEST_STARTS);

  return (
    <Card>
      <Row style={styles.badges}>
        {offset === 0 ? (
          <Badge icon="check">{t('exactMatch')}</Badge>
        ) : (
          <Badge tone="neutral" icon="clock">
            {t('timeOffset', { offset: signedMinutes(offset) })}
          </Badge>
        )}
        <Badge tone="neutral" icon={court.indoor ? 'indoor' : 'outdoor'}>
          {court.indoor ? t('indoor') : t('outdoor')}
        </Badge>
      </Row>

      <View style={styles.header}>
        <Column gap={4} style={styles.name}>
          <Heading>{localize(court.name)}</Heading>
          <Meta icon="location">
            {localize(court.area)} · {t('courtNumber', { number: court.number })}
          </Meta>
        </Column>
        <View style={styles.price}>
          <Heading style={styles.amount}>{money(price(court, search.duration))}</Heading>
          <Label>{t('totalPrice')}</Label>
        </View>
      </View>

      <Divider />

      <Column gap={10}>
        <ChipGroup>
          {shownStarts.map(time => (
            <Chip key={time} label={clock(time)} active={start === time} onPress={() => setPicked(time)} />
          ))}
        </ChipGroup>
        <Meta icon="clock">
          {timeRange(start, search.duration)} · {t('minutes', { count: search.duration })}
        </Meta>
      </Column>

      <Button disabled={disabled} label={t('reserve')} onPress={() => onReserve(start)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  badges: { flexWrap: 'wrap', justifyContent: 'flex-start', gap: 8 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { flex: 1 },
  price: { alignItems: 'flex-end' },
  amount: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
});
