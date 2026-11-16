import { createContext, useContext } from 'react';
import type { BookingStore } from './store';
export const BookingContext = createContext<BookingStore | null>(null);
export function useBooking() {
    const value = useContext(BookingContext);
    if (!value) throw new Error('BookingProvider is missing');
    return value;
}
