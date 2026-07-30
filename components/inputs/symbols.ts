import type { SymbolViewProps } from 'expo-symbols';

/**
 * Build a cross-platform icon name for `expo-symbols`' `SymbolView`.
 *
 * `SymbolView` is driven by SF Symbols on iOS; on Android/web it falls back to
 * the material-ish name. Passing the `{ ios, android, web }` map keeps a single
 * call site working everywhere, matching the convention used elsewhere in the app.
 */
export function symbol(ios: string, fallback?: string): SymbolViewProps['name'] {
  const other = fallback ?? ios;
  return { ios, android: other, web: other } as unknown as SymbolViewProps['name'];
}
