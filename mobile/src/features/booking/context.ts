import { createContext, useContext } from 'react';

import type { Booking } from './domain/payment';
import type { Search, Slot } from './domain/schedule';

/** Everything the screens may read or do. They never touch the booking's state directly. */
export type BookingStore = {
  readonly search: Search;
  updateSearch: (change: Partial<Search>) => void;

  /** The slot picked from the results, waiting to be paid for at checkout. */
  readonly selection: Slot | null;
  select: (slot: Slot) => void;

  readonly booking: Booking | null;
  /** Starts paying for the selection. Ignored if the rules do not allow a new booking right now. */
  begin: (payers: number) => void;
  pay: (payer: number) => void;
  coverRemaining: () => void;
  reset: () => void;
};

export const BookingContext = createContext<BookingStore | null>(null);

export function useBooking(): BookingStore {
  const store = useContext(BookingContext);
  if (!store) throw new Error('useBooking must be used inside BookingProvider');
  return store;
}
