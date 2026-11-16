import { useEffect, useState, type ReactNode } from 'react';
import { BookingContext as Context } from './context';
import { type Booking, type BookingAction, type Court, type Search, createBooking, dayKey, nextDays, transition } from './model';
function useStore() {
    const [search, setSearch] = useState<Search>(() => ({ day: dayKey(nextDays()[0]), start: 1140, duration: 90 }));
    const [selected, setSelected] = useState<{
        court: Court;
        search: Search;
    } | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => { const timer = setInterval(() => { const time = Date.now(); setNow(time); setBooking(b => b ? transition(b, { type: 'tick', now: time }) : null); }, 1000); return () => clearInterval(timer); }, []);
    function act(action: BookingAction) { setNow(action.now); setBooking(b => b ? transition(b, action) : null); }
    function begin(count: number) { if (selected) {
        const time = Date.now();
        setNow(time);
        setBooking(createBooking(selected.court, selected.search, count, time));
    } }
    return { search, setSearch, selected, select: setSelected, booking, now, act, begin, reset: () => setBooking(null) };
}
export type BookingStore = ReturnType<typeof useStore>;
export function BookingProvider({ children }: { children: ReactNode }) {
    const value = useStore();
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
