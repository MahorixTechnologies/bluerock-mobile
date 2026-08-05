import type { HomePalette } from '@/components/home/types';

/**
 * App-wide design tokens. This is the single source of truth for colors used
 * across every screen so the whole app reads as one design system.
 *
 * `AppPalette` is a superset of `HomePalette`, so anything that accepts a
 * `HomePalette` (the home components) also accepts an `AppPalette`.
 */
export type AppPalette = HomePalette & {
  /** Hairline borders around cards, inputs, dividers. */
  border: string;
  /** Brand accent used for primary actions and active states. */
  primary: string;
  /** Text/icon color that sits on top of `primary`. */
  onPrimary: string;
  /** Tinted background for selected chips / subtle primary surfaces. */
  primarySoft: string;
  /** Field (input) background. */
  field: string;
  /** Placeholder / disabled text. */
  placeholder: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  /** Shadow color for elevation. */
  shadow: string;
};

const light: AppPalette = {
  bg: '#F8FAFF',
  card: '#ffffff',
  text: '#141414',
  muted: '#7e7e86',
  search: '#ffffff',
  soft: 'rgba(37,99,235,0.06)',
  iconBubble: '#ffffff',
  border: 'rgba(30,27,75,0.08)',
  primary: '#2563eb',
  onPrimary: '#ffffff',
  primarySoft: 'rgba(37,99,235,0.12)',
  field: '#ffffff',
  placeholder: 'rgba(100,116,139,0.72)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.12)',
  success: '#16a34a',
  successSoft: 'rgba(22,163,74,0.12)',
  warning: '#d97706',
  warningSoft: 'rgba(217,119,6,0.14)',
  shadow: '#1e1b4b',
};

const dark: AppPalette = {
  bg: '#0b0d14',
  card: '#161a24',
  text: '#f4f6fa',
  muted: '#aeb4c2',
  search: '#1c202b',
  soft: 'rgba(99,102,241,0.10)',
  iconBubble: '#222633',
  border: 'rgba(129,140,248,0.14)',
  primary: '#6366f1',
  onPrimary: '#ffffff',
  primarySoft: 'rgba(99,102,241,0.22)',
  field: '#10131a',
  placeholder: 'rgba(203,213,225,0.42)',
  danger: '#f87171',
  dangerSoft: 'rgba(248,113,113,0.16)',
  success: '#4ade80',
  successSoft: 'rgba(74,222,128,0.16)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251,191,36,0.18)',
  shadow: '#000000',
};

export function getPalette(isDark: boolean): AppPalette {
  return isDark ? dark : light;
}
