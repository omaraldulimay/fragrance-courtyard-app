import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1714',
    textSecondary: '#6E645B',
    background: '#F8F4EE',
    surface: '#FFFFFF',
    surfaceMuted: '#EFE8DE',
    border: '#E4DACC',
    accent: '#8E6230',
    accentText: '#FFFFFF',
    hero: '#241C16',
    heroText: '#F4ECE1',
    danger: '#B4402E',
  },
  dark: {
    text: '#F1EBE3',
    textSecondary: '#A99E92',
    background: '#13100D',
    surface: '#1D1915',
    surfaceMuted: '#2A241E',
    border: '#3A322A',
    accent: '#D2A464',
    accentText: '#1A140E',
    hero: '#2C231B',
    heroText: '#F4ECE1',
    danger: '#E27A66',
  },
} as const;

export type ThemeColors = (typeof Colors)['light' | 'dark'];

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)' },
  default: { sans: 'normal', serif: 'serif' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const MaxContentWidth = 560;
