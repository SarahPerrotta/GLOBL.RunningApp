import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IncognitoContext = createContext(null);
const STORAGE_KEY = 'incognito';

export function IncognitoProvider({ children }) {
  const [incognito, setIncognito] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // load saved value once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw !== null) setIncognito(raw === '1');
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // save to storage whenever it changes
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, incognito ? '1' : '0').catch(() => {});
  }, [incognito, loaded]);

  const toggleIncognito = useCallback(() => setIncognito(v => !v), []);

  const value = useMemo(
    () => ({ incognito, setIncognito, toggleIncognito, loaded }),
    [incognito, loaded, toggleIncognito]
  );

  return (
    <IncognitoContext.Provider value={value}>
      {children}
    </IncognitoContext.Provider>
  );
}

export function useIncognito() {
  const ctx = useContext(IncognitoContext);
  if (!ctx) throw new Error('useIncognito must be used within <IncognitoProvider>');
  return ctx;
}
