import type { Court } from './courts';
import type { DayKey, MinuteOfDay, Minutes, Timestamp } from './units';

/** What the player would like: a day, a preferred start time and how long to play. */
export type Search = {
  readonly day: DayKey;
  readonly start: MinuteOfDay;
  readonly duration: Minutes;
};

/** One concrete, bookable piece of court time. Unlike a `Search`, its start is exact. */
export type Slot = {
  readonly court: Court;
  readonly day: DayKey;
  readonly start: MinuteOfDay;
  readonly duration: Minutes;
};

/** A court that can host a search, with its free start times ordered closest-to-preferred first. */
export type CourtOption = {
  readonly court: Court;
  readonly starts: readonly MinuteOfDay[];
  /** The free start closest to the preferred time; always `starts[0]`. */
  readonly best: MinuteOfDay;
};

export const START_OPTIONS: readonly MinuteOfDay[] = [540, 600, 660, 1080, 1140, 1200, 1260];
export const DURATION_OPTIONS: readonly Minutes[] = [60, 90, 120];

const DEFAULT_START: MinuteOfDay = 1140;
const DEFAULT_DURATION: Minutes = 90;
const SEARCH_DAYS = 7;
/** Demo clubs close at 23:00; a game has to end by then. */
const CLOSING_TIME: MinuteOfDay = 23 * 60;
/** Demo clubs stop taking bookings this long before the game starts. */
const BOOKING_CUTOFF_MS = 15 * 60_000;

export function dayKey(date: Date): DayKey {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** A day `offset` days from now, pinned to noon so date maths cannot slip across midnight. */
function dayFromNow(now: Timestamp, offset: number): Date {
  const day = new Date(now);
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() + offset);
  return day;
}

/** The days offered in the search. The demo starts tomorrow: same-day booking rules are not agreed yet. */
export function upcomingDays(now: Timestamp): Date[] {
  return Array.from({ length: SEARCH_DAYS }, (_, index) => dayFromNow(now, index + 1));
}

export function defaultSearch(now: Timestamp): Search {
  return { day: dayKey(dayFromNow(now, 1)), start: DEFAULT_START, duration: DEFAULT_DURATION };
}

/** The moment a game starts, in the device's time zone. */
export function startTime(day: DayKey, start: MinuteOfDay): Timestamp {
  const date = new Date(`${day}T00:00:00`);
  date.setMinutes(start);
  return date.getTime();
}

/** Start times on the searched day that fit before closing and are still open for booking. */
export function availableStarts(court: Court, search: Pick<Search, 'day' | 'duration'>, now: Timestamp): MinuteOfDay[] {
  return court.starts.filter(
    start => start + search.duration <= CLOSING_TIME && startTime(search.day, start) > now + BOOKING_CUTOFF_MS,
  );
}

export function isAvailable(slot: Slot, now: Timestamp): boolean {
  return availableStarts(slot.court, slot, now).includes(slot.start);
}

/**
 * Courts that can host the search, best first: the closest start time wins and price breaks ties.
 * Within a court an earlier start wins a tie between two equally close times.
 */
export function findOptions(courts: readonly Court[], search: Search, now: Timestamp): CourtOption[] {
  const distance = (start: MinuteOfDay) => Math.abs(start - search.start);
  const options: CourtOption[] = [];

  for (const court of courts) {
    const starts = availableStarts(court, search, now).sort((a, b) => distance(a) - distance(b));
    const best = starts[0];
    if (best !== undefined) options.push({ court, starts, best });
  }

  return options.sort((a, b) => distance(a.best) - distance(b.best) || a.court.hourlyRate - b.court.hourlyRate);
}
