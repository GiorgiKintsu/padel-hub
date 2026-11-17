import { en } from './locales/en';
import { ka, type TranslationKey } from './locales/ka';

export type { TranslationKey };
export type Language = 'ka' | 'en';
export type TranslationParams = Record<string, string | number>;

/** Content that comes with the data (a club name, a district) rather than interface copy. */
export type LocalizedText = Record<Language, string>;

export const DEFAULT_LANGUAGE: Language = 'ka';

/**
 * Each language is labelled in its own language so it is recognisable from any locale.
 * `short` is what the compact switch shows; `label` is what a screen reader says.
 */
export const LANGUAGES: readonly { code: Language; label: string; short: string }[] = [
  { code: 'ka', label: 'ქართული', short: 'ქარ' },
  { code: 'en', label: 'English', short: 'ENG' },
];

const dictionaries: Record<Language, Record<TranslationKey, string>> = { ka, en };

export function isLanguage(value: unknown): value is Language {
  return value === 'ka' || value === 'en';
}

/** Replaces `{name}` placeholders; an unknown placeholder is left visible instead of silently dropped. */
export function translate(language: Language, key: TranslationKey, params: TranslationParams = {}): string {
  return dictionaries[language][key].replace(/\{(\w+)\}/g, (token, name: string) =>
    params[name] === undefined ? token : String(params[name]),
  );
}
