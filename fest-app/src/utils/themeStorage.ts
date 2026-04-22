// Persistent user override for the theme mode.
//
// Mirrors `onboardingStorage.ts`:
// - Web: `localStorage`, sync, survives reloads.
// - Native: `AsyncStorage`, survives app kills.
// - In-memory mirror so the first-session read after `setThemeMode` is instant.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { ThemeMode } from '../theme/palettes';

const KEY = 'fest_theme_mode_v1';
let inMemoryMode: ThemeMode | null = null;

const hasLocalStorage = () =>
  Platform.OS === 'web' && typeof localStorage !== 'undefined';

const parse = (v: string | null): ThemeMode => {
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
};

export async function loadThemeMode(): Promise<ThemeMode> {
  if (inMemoryMode !== null) return inMemoryMode;
  try {
    if (hasLocalStorage()) {
      inMemoryMode = parse(localStorage.getItem(KEY));
      return inMemoryMode;
    }
    const v = await AsyncStorage.getItem(KEY);
    inMemoryMode = parse(v);
    return inMemoryMode;
  } catch {
    inMemoryMode = 'system';
    return inMemoryMode;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  inMemoryMode = mode;
  try {
    if (hasLocalStorage()) {
      localStorage.setItem(KEY, mode);
      return;
    }
    await AsyncStorage.setItem(KEY, mode);
  } catch {
    // Best-effort — in-memory mirror still holds the override for this session.
  }
}
