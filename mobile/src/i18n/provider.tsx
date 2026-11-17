import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { LanguageContext } from './context';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from './translate';

const STORAGE_KEY = 'padel-hub.language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrent] = useState<Language>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (active && isLanguage(saved)) setCurrent(saved);
      })
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  function setLanguage(next: Language) {
    setCurrent(next);
    // Serialize rapid selections so the last choice is also the last stored value.
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, next))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }

  // Wait for the saved choice so the interface never flashes in the wrong language.
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return <LanguageContext.Provider value={{ language, setLanguage, storageError }}>{children}</LanguageContext.Provider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
