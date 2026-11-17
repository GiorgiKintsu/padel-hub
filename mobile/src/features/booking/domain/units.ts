/**
 * Names for the plain numbers and strings the domain passes around. They are aliases, not checked
 * types: they exist so a signature says which unit it expects.
 */

/** Money in tetri (100 tetri = 1 ₾). Always a whole number. */
export type Tetri = number;

/** A length of time in minutes. */
export type Minutes = number;

/** A time of day as minutes after local midnight, e.g. 1140 for 19:00. */
export type MinuteOfDay = number;

/** A calendar day in the device's time zone, as `YYYY-MM-DD`. */
export type DayKey = string;

/** A moment in time, in milliseconds since the Unix epoch. */
export type Timestamp = number;
