// Light + dark palettes for the runtime theme switch.
//
// Structure is identical — any token added to one MUST be added to the other.
// All non-color tokens (spacing, typography, radii, shadows) live in
// `src/theme/index.ts` and are shared across modes.

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;

  background: string;
  surface: string;
  surfaceAlt: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  border: string;
  borderLight: string;

  going: string;
  thinking: string;
  cant: string;
  invited: string;

  shadow: string;
  overlay: string;
  auroraVeil: string;
};

export const lightColors: ThemeColors = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',
  accent: '#FD79A8',
  accentLight: '#FDCB6E',

  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F3FE',

  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textTertiary: '#B2BEC3',
  textInverse: '#FFFFFF',

  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',
  info: '#74B9FF',

  border: '#DFE6E9',
  borderLight: '#F0F0F0',

  going: '#00B894',
  thinking: '#FDCB6E',
  cant: '#E17055',
  invited: '#74B9FF',

  shadow: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.4)',
  auroraVeil: 'rgba(255,255,255,0.55)',
};

export const darkColors: ThemeColors = {
  primary: '#8B7CF6',
  primaryLight: '#B7AEFD',
  primaryDark: '#6C5CE7',
  accent: '#FD79A8',
  accentLight: '#FDCB6E',

  background: '#0F1115',
  surface: '#181B22',
  surfaceAlt: '#222632',

  textPrimary: '#F5F6F8',
  textSecondary: '#D1D5DB',
  textTertiary: '#8A93A3',
  textInverse: '#FFFFFF',

  success: '#2DD4A6',
  warning: '#FFD36C',
  error: '#FF7A63',
  info: '#74B9FF',

  border: '#2A2F3A',
  borderLight: '#232732',

  going: '#2DD4A6',
  thinking: '#FFD36C',
  cant: '#FF7A63',
  invited: '#74B9FF',

  shadow: 'rgba(0,0,0,0.35)',
  overlay: 'rgba(0,0,0,0.6)',
  auroraVeil: 'rgba(15,17,21,0.55)',
};

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedMode = 'light' | 'dark';
