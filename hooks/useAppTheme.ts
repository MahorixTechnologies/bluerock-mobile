import { useColorScheme } from '@/components/useColorScheme';
import { getPalette, type AppPalette } from '@/constants/theme';

/**
 * Returns the active design-system palette plus an `isDark` flag.
 * Use this in every screen instead of hand-rolling colors so the app stays
 * visually consistent in light and dark mode.
 */
export function useAppTheme(): { palette: AppPalette; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { palette: getPalette(isDark), isDark };
}
