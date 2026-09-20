// config/themes.ts
/**
 * Palettes de thèmes du dashboard — alignées sur celles du mobile.
 * 4 modes : darkBlue (défaut), orangeRed, light, blueDark
 */

export type ThemeName = 'darkBlue' | 'orangeRed' | 'light' | 'blueDark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  sidebarBg: string;
  sidebarBorder: string;
  headerBg: string;
}

export const Themes: Record<ThemeName, ThemeColors> = {
  darkBlue: {
    background: '#0A0E1A',
    surface: '#111827',
    surfaceAlt: '#1B2438',
    border: '#1F2A44',
    primary: '#2563EB',
    primarySoft: '#3B82F6',
    onPrimary: '#FFFFFF',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
    sidebarBg: '#0D1322',
    sidebarBorder: '#1F2A44',
    headerBg: '#111827',
  },
  orangeRed: {
    background: '#14100E',
    surface: '#1F1815',
    surfaceAlt: '#2A201C',
    border: '#3A2B24',
    primary: '#FF4500',
    primarySoft: '#FF6A33',
    onPrimary: '#FFFFFF',
    text: '#FDF6F3',
    textSecondary: '#C9B8B0',
    textMuted: '#8A756C',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
    sidebarBg: '#18120F',
    sidebarBorder: '#3A2B24',
    headerBg: '#1F1815',
  },
  light: {
    background: '#FFFFFF',
    surface: '#F7F8FA',
    surfaceAlt: '#EEF1F5',
    border: '#E2E8F0',
    primary: '#2563EB',
    primarySoft: '#3B82F6',
    onPrimary: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',
    sidebarBg: '#F7F8FA',
    sidebarBorder: '#E2E8F0',
    headerBg: '#FFFFFF',
  },
  blueDark: {
    background: '#0B1626',
    surface: '#122036',
    surfaceAlt: '#1A2C48',
    border: '#22385A',
    primary: '#38BDF8',
    primarySoft: '#7DD3FC',
    onPrimary: '#0B1626',
    text: '#F0F9FF',
    textSecondary: '#93B4D0',
    textMuted: '#5A7896',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
    sidebarBg: '#0E1B2E',
    sidebarBorder: '#22385A',
    headerBg: '#122036',
  },
};

export const ThemeMeta: Record<
  ThemeName,
  { label: string; preview: string; accent: string; isLight: boolean }
> = {
  darkBlue:  { label: 'Nuit bleue',  preview: '#0A0E1A', accent: '#2563EB', isLight: false },
  orangeRed: { label: 'Orange feu',  preview: '#14100E', accent: '#FF4500', isLight: false },
  light:     { label: 'Clair',       preview: '#FFFFFF', accent: '#2563EB', isLight: true },
  blueDark:  { label: 'Bleu océan',  preview: '#0B1626', accent: '#38BDF8', isLight: false },
};

export const DEFAULT_THEME: ThemeName = 'darkBlue';
export const THEME_STORAGE_KEY = 'ssi-dashboard-theme';