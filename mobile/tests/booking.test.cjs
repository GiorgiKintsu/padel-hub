/* global __dirname */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const filename = require('node:path').resolve(__dirname, '../src/features/booking/model.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const loaded = new Module(filename, module);
loaded._compile(compiled.outputText, filename);
const { createBooking, transition, courts, price, available } = loaded.exports;
const search = { day: '2030-01-20', start: 1140, duration: 90 };
const start = 1000;
const make = (count = 4) => createBooking(courts[0], search, count, start);
test('full payment confirms immediately', () => {
 const b = transition(make(1), { type: 'pay', index: 0, now: start + 1 });
 assert.equal(b.phase, 'confirmed'); assert.equal(b.paid[0], b.total);
});
test('author payment starts ten minutes, duplicate payment cannot extend it', () => {
 const b = transition(make(), { type: 'pay', index: 0, now: start + 50 });
 assert.equal(b.phase, 'friends'); assert.equal(b.deadline, start + 50 + 600000);
 assert.deepEqual(transition(b, { type: 'pay', index: 0, now: start + 100 }), b);
});
test('friends cannot pay before the author', () => {
 const b = make(); assert.deepEqual(transition(b, { type: 'pay', index: 1, now: start + 1 }), b);
});
test('late payment at exact deadline expires without charging', () => {
 const b = make(); const expired = transition(b, { type: 'pay', index: 0, now: b.deadline });
 assert.equal(expired.phase, 'expired'); assert.equal(expired.paid.reduce((a,b)=>a+b), 0);
});
test('expiry preserves actual contributions for simulated refunds', () => {
 const b = transition(make(), { type: 'pay', index: 0, now: start + 1 });
 const expired = transition(b, { type: 'tick', now: b.deadline });
 assert.equal(expired.phase, 'expired'); assert.equal(expired.paid[0], b.total / 4);
});
test('author covers outstanding amount without double payment', () => {
 let b = transition(make(), { type: 'pay', index: 0, now: start + 1 });
 b = transition(b, { type: 'pay', index: 1, now: start + 2 });
 b = transition(b, { type: 'cover', now: start + 3 });
 assert.equal(b.phase, 'confirmed'); assert.equal(b.paid[0], b.total * .75);
 assert.equal(b.paid.reduce((a,b)=>a+b), b.total);
 assert.deepEqual(transition(b, { type: 'pay', index: 2, now: start + 4 }), b);
});
test('all equal contributions confirm for two, three and four payers', () => {
 for(const count of [2,3,4]) { let b = make(count); for(let i=0;i<count;i++) b=transition(b,{type:'pay',index:i,now:start+i+1}); assert.equal(b.phase,'confirmed'); }
});
test('fixture prices divide into exact cents and slots respect closing time', () => {
 for (const court of courts) for(const duration of [60,90,120]) for(const n of [2,3,4]) assert.ok(Number.isInteger(price(court,duration)/n));
 assert.ok(available(courts[0],{...search,duration:120},0).every(t=>t+120<=1380));
 assert.deepEqual(available(courts[0], search, new Date('2031-01-01').getTime()),[]);
});
