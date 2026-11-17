import type { Language } from './translate';

// Hand-written short names: Hermes does not ship reliable Georgian `Intl` data on every device.
const weekdays: Record<Language, readonly string[]> = {
  ka: ['კვ', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const months: Record<Language, readonly string[]> = {
  ka: ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function formatWeekday(date: Date, language: Language): string {
  return weekdays[language][date.getDay()] ?? '';
}

/** Formats a `YYYY-MM-DD` day key as e.g. "20 Jan". Noon keeps the date stable in any time zone. */
export function formatDate(day: string, language: Language): string {
  const date = new Date(`${day}T12:00:00`);
  return `${date.getDate()} ${months[language][date.getMonth()] ?? ''}`;
}
