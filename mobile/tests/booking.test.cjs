require('./register-ts.cjs');

const assert = require('node:assert/strict');
const { describe, test } = require('node:test');

const { DEMO_COURTS: courts } = require('../src/features/booking/domain/courts.ts');
const { clock, countdown, money, signedMinutes, timeRange } = require('../src/features/booking/domain/format.ts');
const {
  AUTHOR_HOLD_MS,
  FRIENDS_HOLD_MS,
  SPLIT_OPTIONS,
  bookingReducer,
  canPay,
  createBooking,
  isActive,
  outstanding,
  payerStatus,
  price,
  totalPaid,
  transition,
} = require('../src/features/booking/domain/payment.ts');
const {
  DURATION_OPTIONS,
  availableStarts,
  dayKey,
  defaultSearch,
  findOptions,
  isAvailable,
  startTime,
  upcomingDays,
} = require('../src/features/booking/domain/schedule.ts');

const [vake, , dighomi] = courts;
const search = { day: '2030-01-20', start: 1140, duration: 90 };
/** Long before the searched day, so every start time is still bookable. */
const EARLY = 0;
const start = 1000;

const slot = { court: vake, ...search };
const make = (payers = 4) => createBooking(slot, payers, start);
const pay = (booking, payer, now) => transition(booking, { type: 'pay', payer, now });

describe('payment', () => {
  test('full payment confirms immediately', () => {
    const booking = pay(make(1), 0, start + 1);
    assert.equal(booking.phase, 'confirmed');
    assert.equal(booking.paid[0], booking.total);
  });

  test('the court is held five minutes for the author', () => {
    assert.equal(make().deadline, start + AUTHOR_HOLD_MS);
    assert.equal(AUTHOR_HOLD_MS, 5 * 60_000);
  });

  test('author payment starts ten minutes, duplicate payment cannot extend it', () => {
    const booking = pay(make(), 0, start + 50);
    assert.equal(booking.phase, 'friends');
    assert.equal(booking.deadline, start + 50 + FRIENDS_HOLD_MS);
    assert.equal(FRIENDS_HOLD_MS, 10 * 60_000);
    assert.equal(pay(booking, 0, start + 100), booking);
  });

  test('a friend paying does not extend the friends deadline', () => {
    const afterAuthor = pay(make(), 0, start + 50);
    assert.equal(pay(afterAuthor, 1, start + 5000).deadline, afterAuthor.deadline);
  });

  test('friends cannot pay before the author', () => {
    const booking = make();
    assert.equal(pay(booking, 1, start + 1), booking);
    assert.equal(canPay(booking, 1), false);
    assert.equal(canPay(booking, 0), true);
  });

  test('a payer that does not exist is ignored', () => {
    const booking = pay(make(), 0, start + 1);
    for (const payer of [-1, 4, 1.5]) assert.equal(pay(booking, payer, start + 2), booking);
  });

  test('late payment at exact deadline expires without charging', () => {
    const booking = make();
    const expired = pay(booking, 0, booking.deadline);
    assert.equal(expired.phase, 'expired');
    assert.equal(totalPaid(expired), 0);
  });

  test('expiry preserves actual contributions for simulated refunds', () => {
    const booking = pay(make(), 0, start + 1);
    const expired = transition(booking, { type: 'tick', now: booking.deadline });
    assert.equal(expired.phase, 'expired');
    assert.equal(expired.paid[0], booking.total / 4);
    assert.equal(payerStatus(expired, 0), 'refunded');
    assert.equal(payerStatus(expired, 1), 'unpaid');
  });

  test('a tick before the deadline changes nothing', () => {
    const booking = make();
    assert.equal(transition(booking, { type: 'tick', now: booking.deadline - 1 }), booking);
  });

  test('author covers outstanding amount without double payment', () => {
    let booking = pay(make(), 0, start + 1);
    booking = pay(booking, 1, start + 2);
    assert.equal(outstanding(booking), booking.total / 2);
    booking = transition(booking, { type: 'cover', now: start + 3 });
    assert.equal(booking.phase, 'confirmed');
    assert.equal(booking.paid[0], booking.total * 0.75);
    assert.equal(totalPaid(booking), booking.total);
    assert.deepEqual([0, 1, 2, 3].map(payer => payerStatus(booking, payer)), ['paid', 'paid', 'covered', 'covered']);
    assert.equal(pay(booking, 2, start + 4), booking);
  });

  test('author cannot cover before paying their own share', () => {
    const booking = make();
    assert.equal(transition(booking, { type: 'cover', now: start + 1 }), booking);
  });

  test('all equal contributions confirm for every split', () => {
    for (const payers of SPLIT_OPTIONS) {
      let booking = make(payers);
      for (let payer = 0; payer < payers; payer++) booking = pay(booking, payer, start + payer + 1);
      assert.equal(booking.phase, 'confirmed');
    }
  });

  test('fixture prices divide into exact tetri for every duration and split', () => {
    for (const court of courts)
      for (const duration of DURATION_OPTIONS)
        for (const payers of SPLIT_OPTIONS) assert.ok(Number.isInteger(price(court, duration) / payers));
  });
});

describe('booking slot', () => {
  const begin = { type: 'begin', slot, payers: 2, now: start };

  test('begin creates a booking and reset clears it', () => {
    const booking = bookingReducer(null, begin);
    assert.equal(booking.phase, 'author');
    assert.equal(booking.paid.length, 2);
    assert.equal(bookingReducer(booking, { type: 'reset' }), null);
  });

  test('an active booking cannot be replaced, an expired one can', () => {
    const active = bookingReducer(null, begin);
    const other = { ...slot, court: dighomi, start: 1170 };
    assert.equal(bookingReducer(active, { ...begin, slot: other }), active);

    const expired = bookingReducer(active, { type: 'tick', now: active.deadline });
    assert.equal(isActive(expired), false);
    assert.equal(bookingReducer(expired, { ...begin, slot: other }).slot, other);
  });

  test('a booking cannot start for a slot that is closed, off the schedule or badly split', () => {
    const afterCutoff = startTime(slot.day, slot.start) - 60_000;
    assert.equal(bookingReducer(null, { ...begin, now: afterCutoff }), null);
    assert.equal(bookingReducer(null, { ...begin, slot: { ...slot, start: 1150 } }), null);
    for (const payers of [0, 5, 2.5]) assert.equal(bookingReducer(null, { ...begin, payers }), null);
  });

  test('the booking keeps the slot it was started with', () => {
    assert.equal(bookingReducer(null, begin).slot, slot);
    assert.equal(bookingReducer(null, begin).total, price(vake, slot.duration));
  });

  test('payment actions without a booking do nothing', () => {
    assert.equal(bookingReducer(null, { type: 'pay', payer: 0, now: start }), null);
  });
});

describe('schedule', () => {
  test('slots respect closing time', () => {
    const starts = availableStarts(vake, { ...search, duration: 120 }, EARLY);
    assert.ok(starts.length > 0);
    assert.ok(starts.every(time => time + 120 <= 23 * 60));
    // 21:30 + 120 minutes would run past the 23:00 closing time.
    const late = { ...vake, starts: [1260, 1290] };
    assert.deepEqual(availableStarts(late, { ...search, duration: 120 }, EARLY), [1260]);
  });

  test('slots close fifteen minutes before the game', () => {
    const game = startTime(search.day, search.start);
    assert.equal(isAvailable(slot, game - 15 * 60_000 - 1), true);
    assert.equal(isAvailable(slot, game - 15 * 60_000), false);
    assert.deepEqual(availableStarts(vake, search, new Date('2031-01-01').getTime()), []);
  });

  test('best options put the closest time first and break ties by price', () => {
    const options = findOptions(courts, search, EARLY);
    // Vake and Saburtalo both have the exact time; Saburtalo is cheaper. Dighomi is 30 minutes off.
    assert.deepEqual(options.map(option => option.court.id), ['saburtalo', 'vake', 'dighomi']);
    assert.deepEqual(options[1].starts.slice(0, 3), [1140, 1170, 1080]);
    assert.deepEqual(options.map(option => option.best), [1140, 1140, 1110]);
    assert.deepEqual(options[2].starts.slice(0, 2), [1110, 1170]);
  });

  test('courts with no free time are left out', () => {
    const options = findOptions(courts, { ...search, duration: 120 }, startTime(search.day, 1240));
    assert.deepEqual(options.map(option => option.court.id), ['saburtalo', 'vake']);
    assert.deepEqual(options[0].starts, [1260]);
    assert.equal(dighomi.starts.some(time => time > 1255), false);
  });

  test('search offers the next seven days, starting tomorrow', () => {
    const now = new Date(2030, 0, 31, 23, 30).getTime();
    const days = upcomingDays(now).map(dayKey);
    assert.equal(days.length, 7);
    assert.equal(days[0], '2030-02-01');
    assert.equal(days[6], '2030-02-07');
    assert.deepEqual(defaultSearch(now), { day: '2030-02-01', start: 1140, duration: 90 });
  });
});

describe('format', () => {
  test('clock and time range', () => {
    assert.equal(clock(540), '09:00');
    assert.equal(clock(1170), '19:30');
    assert.equal(timeRange(1140, 90), '19:00 – 20:30');
  });

  test('money shows decimals only when needed', () => {
    assert.equal(money(9000), '90 ₾');
    assert.equal(money(2250), '22.50 ₾');
    assert.equal(money(0), '0 ₾');
  });

  test('countdown rounds up and never goes negative', () => {
    assert.equal(countdown(5 * 60_000), '5:00');
    assert.equal(countdown(59_001), '1:00');
    assert.equal(countdown(1), '0:01');
    assert.equal(countdown(-500), '0:00');
  });

  test('signed minutes', () => {
    assert.equal(signedMinutes(30), '+30');
    assert.equal(signedMinutes(-60), '−60');
  });
});
