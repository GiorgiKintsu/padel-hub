import { createContext, useContext } from 'react';

import { formatDate, formatWeekday } from './dates';
import { translate, type Language, type LocalizedText, type TranslationKey, type TranslationParams } from './translate';

export type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** True when the choice could not be read from or written to device storage. */
  storageError: boolean;
};

export const LanguageContext = createContext<LanguageState | null>(null);

export function useLanguage() {
  const state = useContext(LanguageContext);
  if (!state) throw new Error('LanguageProvider is missing');
  const { language } = state;

  return {
    ...state,
    t: (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    localize: (text: LocalizedText) => text[language],
    dateLabel: (day: string) => formatDate(day, language),
    weekday: (date: Date) => formatWeekday(date, language),
  };
}
