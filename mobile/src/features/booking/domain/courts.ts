import type { LocalizedText } from '@/i18n/translate';

import type { MinuteOfDay, Tetri } from './units';

export type Court = {
  readonly id: string;
  readonly name: LocalizedText;
  readonly area: LocalizedText;
  readonly number: number;
  readonly indoor: boolean;
  readonly hourlyRate: Tetri;
  /** Bookable start times, ascending. */
  readonly starts: readonly MinuteOfDay[];
};

/**
 * Demo fixtures. These clubs, prices and hours are invented; they stand in for the club calendar
 * until a real availability source exists. Every rate divides into whole tetri for each supported
 * duration and split (see `tests/booking.test.cjs`).
 */
export const DEMO_COURTS: readonly Court[] = [
  {
    id: 'vake',
    name: { ka: 'ვაკე პადელ კლუბი', en: 'Vake Padel Club' },
    area: { ka: 'ვაკე', en: 'Vake' },
    number: 2,
    indoor: true,
    hourlyRate: 6000,
    starts: [540, 600, 1080, 1140, 1170, 1200, 1260],
  },
  {
    id: 'saburtalo',
    name: { ka: 'საბურთალო არენა', en: 'Saburtalo Arena' },
    area: { ka: 'საბურთალო', en: 'Saburtalo' },
    number: 1,
    indoor: false,
    hourlyRate: 4800,
    starts: [600, 660, 1080, 1140, 1200, 1260],
  },
  {
    id: 'dighomi',
    name: { ka: 'დიღომი პადელი', en: 'Dighomi Padel' },
    area: { ka: 'დიღომი', en: 'Dighomi' },
    number: 3,
    indoor: true,
    hourlyRate: 5400,
    starts: [540, 660, 1110, 1170, 1230],
  },
];
