import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { lightColors, darkColors, type ThemeColors, type ThemeMode, type ResolvedMode } from './palettes';
import { loadThemeMode, saveThemeMode } from '../utils/themeStorage';

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const defaultValue: ThemeContextValue = {
  mode: 'light',
  resolved: 'light',
  colors: lightColors,
  setMode: () => {},
};

const ThemeContext = React.createContext<ThemeContextValue>(defaultValue);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme(); // 'light' | 'dark' | null
  // Default to 'light' so dark mode is strictly opt-in (some surfaces still
  // use hardcoded rgba(255,255,255,*) glass backgrounds that don't adapt yet).
  const [mode, setModeState] = React.useState<ThemeMode>('light');

  React.useEffect(() => {
    let cancelled = false;
    loadThemeMode().then((loaded) => {
      if (!cancelled) setModeState(loaded);
    });
    return () => { cancelled = true; };
  }, []);

  const resolved: ResolvedMode =
    mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const colors = resolved === 'dark' ? darkColors : lightColors;

  // On web, paint the resolved background onto <html> / <body> so areas
  // outside the 600px ScreenContainer column (and the browser-native canvas
  // visible during overscroll) match the active palette. Without this, users
  // with `prefers-color-scheme: dark` see the browser's dark canvas bleed
  // through the transparent root and the light-mode app looks like white
  // islands on a dark page.
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = colors.background;
    document.body.style.backgroundColor = colors.background;
  }, [colors.background]);

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    void saveThemeMode(next);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ mode, resolved, colors, setMode }),
    [mode, resolved, colors, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => React.useContext(ThemeContext);
export const useThemeColors = () => React.useContext(ThemeContext).colors;
