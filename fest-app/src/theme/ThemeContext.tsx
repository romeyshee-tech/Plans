import React from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ThemeColors, type ThemeMode, type ResolvedMode } from './palettes';
import { loadThemeMode, saveThemeMode } from '../utils/themeStorage';

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const defaultValue: ThemeContextValue = {
  mode: 'system',
  resolved: 'light',
  colors: lightColors,
  setMode: () => {},
};

const ThemeContext = React.createContext<ThemeContextValue>(defaultValue);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = React.useState<ThemeMode>('system');

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
