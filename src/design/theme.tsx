import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, type Palette } from './tokens';

export type ThemePreference = 'light' | 'dark' | 'system';
const KEY = 'macrova.theme';

type Ctx = {
  colors: Palette;
  scheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  // Light is the default until the user picks something else.
  const [preference, setPref] = useState<ThemePreference>('light');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPref(v);
      })
      .catch(() => {});
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPref(p);
    AsyncStorage.setItem(KEY, p).catch(() => {});
  };

  const scheme: 'light' | 'dark' = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(
    () => ({ colors: scheme === 'dark' ? dark : light, scheme, preference, setPreference }),
    [scheme, preference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
