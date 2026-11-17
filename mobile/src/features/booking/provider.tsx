import { useEffect, useReducer, useState, type ReactNode } from 'react';

import { BookingContext, type BookingStore } from './context';
import { bookingReducer, isPending } from './domain/payment';
import { defaultSearch, type Search, type Slot } from './domain/schedule';

/**
 * Session-only booking state: the search, the picked slot and the single current booking.
 * Nothing here is persisted, so a reload starts from scratch.
 *
 * This is the only place that reads the device clock for the booking rules: every event is stamped
 * here and the domain decides what it means.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<Search>(() => defaultSearch(Date.now()));
  const [selection, select] = useState<Slot | null>(null);
  const [booking, dispatch] = useReducer(bookingReducer, null);

  // The clock only runs while a payment deadline is open; it is what turns a missed deadline into an expiry.
  const pending = booking !== null && isPending(booking);
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => dispatch({ type: 'tick', now: Date.now() }), 1000);
    return () => clearInterval(timer);
  }, [pending]);

  const store: BookingStore = {
    search,
    updateSearch: change => setSearch(current => ({ ...current, ...change })),
    selection,
    select,
    booking,
    begin: payers => {
      if (selection) dispatch({ type: 'begin', slot: selection, payers, now: Date.now() });
    },
    pay: payer => dispatch({ type: 'pay', payer, now: Date.now() }),
    coverRemaining: () => dispatch({ type: 'cover', now: Date.now() }),
    reset: () => dispatch({ type: 'reset' }),
  };

  return <BookingContext.Provider value={store}>{children}</BookingContext.Provider>;
}
