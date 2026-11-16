import { createContext, useContext } from 'react';
import { formatDate, formatWeekday, translate, type Language, type TranslationKey } from './translations';
export type LanguageState = { language: Language; setLanguage: (language: Language) => void; storageError: boolean };
export const LanguageContext = createContext<LanguageState | null>(null);
export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('LanguageProvider is missing');
  return {
    ...value,
    t: (key: TranslationKey, params?: Record<string, string | number>) => translate(value.language, key, params),
    dateLabel: (day: string) => formatDate(day, value.language),
    weekday: (date: Date) => formatWeekday(date, value.language),
    courtName: (court: { name: string; nameEn: string }) => value.language === 'en' ? court.nameEn : court.name,
    courtArea: (court: { area: string; areaEn: string }) => value.language === 'en' ? court.areaEn : court.area,
  };
}
