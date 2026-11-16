export type Court = {
    id: string;
    name: string;
    nameEn: string;
    area: string;
    areaEn: string;
    distance: string;
    number: number;
    indoor: boolean;
    hourlyPrice: number;
    starts: number[];
};
export const courts: Court[] = [
    { id: 'vake', name: 'ვაკე პადელ კლუბი', nameEn: 'Vake Padel Club', area: 'ვაკე', areaEn: 'Vake', distance: '1.2', number: 2, indoor: true, hourlyPrice: 60, starts: [540, 600, 1080, 1140, 1170, 1200, 1260] },
    { id: 'saburtalo', name: 'საბურთალო არენა', nameEn: 'Saburtalo Arena', area: 'საბურთალო', areaEn: 'Saburtalo', distance: '3.4', number: 1, indoor: false, hourlyPrice: 48, starts: [600, 660, 1080, 1140, 1200, 1260] },
    { id: 'dighomi', name: 'დიღომი პადელი', nameEn: 'Dighomi Padel', area: 'დიღომი', areaEn: 'Dighomi', distance: '6.1', number: 3, indoor: true, hourlyPrice: 54, starts: [540, 660, 1110, 1170, 1230] },
];
export type Search = {
    day: string;
    start: number;
    duration: number;
};
export type Booking = {
    court: Court;
    search: Search;
    count: number;
    total: number;
    paid: number[];
    deadline: number;
    phase: 'author' | 'friends' | 'confirmed' | 'expired';
};
export type BookingAction = {
    type: 'pay';
    index: number;
    now: number;
} | {
    type: 'cover';
    now: number;
} | {
    type: 'tick';
    now: number;
};
export function dayKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function nextDays() { return Array.from({ length: 7 }, (_, i) => { const day = new Date(); day.setHours(12, 0, 0, 0); day.setDate(day.getDate() + i + 1); return day; }); }
export function startDate(search: Search) { const date = new Date(`${search.day}T00:00:00`); date.setMinutes(search.start); return date; }
export function clock(minutes: number) { return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`; }
export function money(cents: number) { return `${(cents / 100).toFixed(cents % 100 ? 2 : 0)} ₾`; }
export function price(court: Court, duration: number) { return court.hourlyPrice * 100 * duration / 60; }
export function available(court: Court, search: Search, now = Date.now()) { return court.starts.filter(start => start + search.duration <= 1380 && startDate({ ...search, start }).getTime() > now + 15 * 60000); }
export function createBooking(court: Court, search: Search, count: number, now: number): Booking {
    return { court, search: { ...search }, count, total: price(court, search.duration), paid: Array(count).fill(0), deadline: now + 5 * 60000, phase: 'author' };
}
export function transition(booking: Booking, action: BookingAction): Booking {
    if (booking.phase === 'confirmed' || booking.phase === 'expired')
        return booking;
    if (action.now >= booking.deadline)
        return { ...booking, phase: 'expired' };
    if (action.type === 'tick')
        return booking;
    const paid = [...booking.paid];
    if (action.type === 'cover') {
        if (booking.phase !== 'friends')
            return booking;
        paid[0] += booking.total - paid.reduce((a, b) => a + b, 0);
    }
    else {
        if (action.index < 0 || action.index >= booking.count || paid[action.index] || (booking.phase === 'author' && action.index !== 0))
            return booking;
        paid[action.index] = booking.total / booking.count;
    }
    if (paid.reduce((a, b) => a + b, 0) === booking.total)
        return { ...booking, paid, phase: 'confirmed' };
    return { ...booking, paid, phase: 'friends', deadline: booking.phase === 'author' ? action.now + 10 * 60000 : booking.deadline };
}
