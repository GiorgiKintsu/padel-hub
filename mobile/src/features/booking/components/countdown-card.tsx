import { StyleSheet } from 'react-native';

import { Card, Column, Copy, Display, Label, ProgressBar } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { useLanguage } from '@/i18n/context';
import { colors } from '@/theme';

import { countdown } from '../domain/format';
import { AUTHOR_HOLD_MS, FRIENDS_HOLD_MS, type Booking } from '../domain/payment';

/** Below this the timer turns amber: the deadline is close enough to act on right now. */
const URGENT_MS = 60_000;

/**
 * Time left to pay. Render it only while the booking is pending: it keeps its own one-second clock,
 * so the rest of the screen does not re-render on every tick. Expiry itself is decided by the store.
 */
export function CountdownCard({ booking }: { booking: Booking }) {
  const { t } = useLanguage();
  const now = useNow(1000);

  const waitingForAuthor = booking.phase === 'author';
  const remaining = Math.max(0, booking.deadline - now);
  const urgent = remaining <= URGENT_MS;
  const label = waitingForAuthor ? t('authorTime') : t('friendsTime');

  return (
    <Card>
      <Column gap={4}>
        <Label>{label}</Label>
        {/* Not a live region: a screen reader would otherwise announce every second. */}
        <Display style={[styles.time, urgent && styles.timeUrgent]}>{countdown(remaining)}</Display>
      </Column>
      <ProgressBar
        value={remaining / (waitingForAuthor ? AUTHOR_HOLD_MS : FRIENDS_HOLD_MS)}
        tone={urgent ? 'warning' : 'lime'}
        accessibilityLabel={label}
      />
      <Copy>{t('expiryHint')}</Copy>
    </Card>
  );
}

const styles = StyleSheet.create({
  time: { fontSize: 44, lineHeight: 52, fontVariant: ['tabular-nums'] },
  timeUrgent: { color: colors.warning },
});
