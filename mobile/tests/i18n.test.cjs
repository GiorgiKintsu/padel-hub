require('./register-ts.cjs');

const assert = require('node:assert/strict');
const { test } = require('node:test');

const { formatDate, formatWeekday } = require('../src/i18n/dates.ts');
const { en } = require('../src/i18n/locales/en.ts');
const { ka } = require('../src/i18n/locales/ka.ts');
const { isLanguage, translate } = require('../src/i18n/translate.ts');

const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

test('both locales have the same keys, none of them empty', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ka).sort());
  for (const dictionary of [ka, en]) for (const text of Object.values(dictionary)) assert.ok(text.trim().length > 0);
});

test('a translation uses the same placeholders in every language', () => {
  for (const key of Object.keys(ka)) assert.deepEqual(placeholders(en[key]), placeholders(ka[key]), key);
});

test('translate fills placeholders and leaves unknown ones visible', () => {
  assert.equal(translate('en', 'minutes', { count: 90 }), '90 min');
  assert.equal(translate('ka', 'courtNumber', { number: 2 }), 'კორტი 2');
  assert.equal(translate('en', 'minutes'), '{count} min');
});

test('only supported languages are accepted from storage', () => {
  assert.equal(isLanguage('ka'), true);
  assert.equal(isLanguage('en'), true);
  for (const value of ['ru', '', null, undefined, 1]) assert.equal(isLanguage(value), false);
});

test('dates are formatted per language', () => {
  assert.equal(formatDate('2030-01-20', 'en'), '20 Jan');
  assert.equal(formatDate('2030-01-20', 'ka'), '20 იან');
  const sunday = new Date(2030, 0, 20, 12);
  assert.equal(formatWeekday(sunday, 'en'), 'Sun');
  assert.equal(formatWeekday(sunday, 'ka'), 'კვ');
});
