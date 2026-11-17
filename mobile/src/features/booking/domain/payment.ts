import type { Court } from './courts';
import { isAvailable, type Slot } from './schedule';
import type { Minutes, Tetri, Timestamp } from './units';

/** The court is held this long for the author's own payment. */
export const AUTHOR_HOLD_MS = 5 * 60_000;
/** Once the author has paid their share, the friends get this long to pay theirs. */
export const FRIENDS_HOLD_MS = 10 * 60_000;
/** How many payers a split may have. Paying in full is one payer. */
export const SPLIT_OPTIONS: readonly number[] = [2, 3, 4];

/**
 * `author`  – the court is held, waiting for the author's payment.
 * `friends` – the author has paid; waiting for the rest of the money.
 * `confirmed` / `expired` – final; nothing changes a booking after that.
 */
export type BookingPhase = 'author' | 'friends' | 'confirmed' | 'expired';

export type PayerStatus = 'paid' | 'pending' | 'covered' | 'refunded' | 'unpaid';

/** A booking is immutable: every change produces a new object. Payer 0 is always the author. */
export type Booking = {
  /** A snapshot taken when payment began, so later price or schedule changes cannot alter it. */
  readonly slot: Slot;
  readonly total: Tetri;
  /** What each payer owes when everyone pays for themselves. */
  readonly share: Tetri;
  /** What each payer has actually paid; the author's entry grows when they cover for friends. */
  readonly paid: readonly Tetri[];
  readonly deadline: Timestamp;
  readonly phase: BookingPhase;
};

/** Every action carries the time it happened, so the rules stay pure and testable. */
export type PaymentAction =
  | { type: 'pay'; payer: number; now: Timestamp }
  | { type: 'cover'; now: Timestamp }
  | { type: 'tick'; now: Timestamp };

export type BookingEvent =
  | PaymentAction
  | { type: 'begin'; slot: Slot; payers: number; now: Timestamp }
  | { type: 'reset' };

export function price(court: Court, duration: Minutes): Tetri {
  return (court.hourlyRate * duration) / 60;
}

export function isValidPayerCount(payers: number): boolean {
  return payers === 1 || SPLIT_OPTIONS.includes(payers);
}

/**
 * Splits are plain division. How to round a total that does not divide evenly is still an open
 * product question (OPEN-05), so the demo only uses prices that divide into whole tetri.
 */
export function createBooking(slot: Slot, payers: number, now: Timestamp): Booking {
  const total = price(slot.court, slot.duration);
  return {
    slot,
    total,
    share: total / payers,
    paid: Array<Tetri>(payers).fill(0),
    deadline: now + AUTHOR_HOLD_MS,
    phase: 'author',
  };
}

export function totalPaid(booking: Booking): Tetri {
  return booking.paid.reduce((sum, amount) => sum + amount, 0);
}

export function outstanding(booking: Booking): Tetri {
  return booking.total - totalPaid(booking);
}

/** Still waiting for money. */
export function isPending(booking: Booking): boolean {
  return booking.phase === 'author' || booking.phase === 'friends';
}

/** Occupies the player's single booking slot: anything that has not expired. */
export function isActive(booking: Booking | null): booking is Booking {
  return booking !== null && booking.phase !== 'expired';
}

/** Friends can only pay after the author, and nobody pays twice. */
export function canPay(booking: Booking, payer: number): boolean {
  return isPending(booking) && booking.paid[payer] === 0 && (payer === 0 || booking.phase === 'friends');
}

export function payerStatus(booking: Booking, payer: number): PayerStatus {
  const hasPaid = (booking.paid[payer] ?? 0) > 0;
  if (booking.phase === 'expired') return hasPaid ? 'refunded' : 'unpaid';
  if (hasPaid) return 'paid';
  return booking.phase === 'confirmed' ? 'covered' : 'pending';
}

/** Applies a payment action. An action that is not allowed returns the same booking object. */
export function transition(booking: Booking, action: PaymentAction): Booking {
  if (!isPending(booking)) return booking;
  // The deadline is checked first, so a payment arriving at or after it expires instead of charging.
  if (action.now >= booking.deadline) return { ...booking, phase: 'expired' };

  switch (action.type) {
    case 'tick':
      return booking;
    case 'pay':
      return canPay(booking, action.payer) ? collect(booking, action.payer, booking.share, action.now) : booking;
    case 'cover':
      return booking.phase === 'friends' ? collect(booking, 0, outstanding(booking), action.now) : booking;
  }
}

function collect(booking: Booking, payer: number, amount: Tetri, now: Timestamp): Booking {
  const paid = booking.paid.map((value, index) => (index === payer ? value + amount : value));
  const next = { ...booking, paid };

  if (totalPaid(next) === booking.total) return { ...next, phase: 'confirmed' };
  // Only the author's own payment starts the friends' clock; later payments must not extend it.
  return { ...next, phase: 'friends', deadline: booking.phase === 'author' ? now + FRIENDS_HOLD_MS : booking.deadline };
}

/**
 * The player's single booking slot: starts a booking, applies payment actions, clears it.
 * The rules live here rather than in the screens, so no caller can start a booking the UI would not offer.
 */
export function bookingReducer(booking: Booking | null, event: BookingEvent): Booking | null {
  switch (event.type) {
    case 'begin': {
      const allowed = !isActive(booking) && isValidPayerCount(event.payers) && isAvailable(event.slot, event.now);
      return allowed ? createBooking(event.slot, event.payers, event.now) : booking;
    }
    case 'reset':
      return null;
    default:
      return booking && transition(booking, event);
  }
}
