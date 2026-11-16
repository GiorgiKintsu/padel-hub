import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LanguageContext } from './context';
import { isLanguage, type Language } from './translations';
const STORAGE_KEY = 'padel-hub.language';
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>('ka');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (active && isLanguage(saved)) updateLanguage(saved);
    }).catch(() => { if (active) setStorageError(true); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  function setLanguage(next: Language) {
    updateLanguage(next);
    // Serialize rapid selections so the last choice is also the last stored value.
    writes.current = writes.current.then(() => AsyncStorage.setItem(STORAGE_KEY, next)).then(() => setStorageError(false)).catch(() => setStorageError(true));
  }
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6F0' }}><ActivityIndicator color="#123D32" /></View>;
  return <LanguageContext.Provider value={{ language, setLanguage, storageError }}>{children}</LanguageContext.Provider>;
}
