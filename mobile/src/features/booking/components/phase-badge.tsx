import { Badge, type IconName, type Tone } from '@/components/ui';
import { useLanguage } from '@/i18n/context';
import type { TranslationKey } from '@/i18n/translate';

import type { BookingPhase } from '../domain/payment';

const PHASES: Record<BookingPhase, { label: TranslationKey; tone: Tone; icon: IconName }> = {
  author: { label: 'awaitingPayment', tone: 'warning', icon: 'clock' },
  friends: { label: 'awaitingPayment', tone: 'warning', icon: 'clock' },
  confirmed: { label: 'confirmed', tone: 'lime', icon: 'check' },
  expired: { label: 'expired', tone: 'danger', icon: 'alert' },
};

/** Where a booking stands, in one pill. Used wherever a booking is summarised. */
export function PhaseBadge({ phase }: { phase: BookingPhase }) {
  const { t } = useLanguage();
  const { label, tone, icon } = PHASES[phase];

  return (
    <Badge tone={tone} icon={icon}>
      {t(label)}
    </Badge>
  );
}
