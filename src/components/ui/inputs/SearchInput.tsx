import { forwardRef } from 'react';
import { Pressable, TextInput } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Input, type InputProps } from './Input';
import { symbol } from './symbols';
import { useAppTheme } from '@/hooks/useAppTheme';

export type SearchInputProps = Omit<InputProps, 'leftIcon' | 'leftAdornment' | 'rightAdornment'> & {
  /** Called when the clear (✕) button is pressed. Shown only when there's a value. */
  onClear?: () => void;
};

/**
 * A search field with a leading magnifying glass and an optional clear button
 * that appears once the user has typed something.
 */
export const SearchInput = forwardRef<TextInput, SearchInputProps>(function SearchInput(
  { value, onClear, returnKeyType = 'search', placeholder = 'Search', ...props },
  ref,
) {
  const { palette } = useAppTheme();
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <Input
      ref={ref}
      value={value}
      placeholder={placeholder}
      returnKeyType={returnKeyType}
      autoCapitalize="none"
      autoCorrect={false}
      leftAdornment={
        <SymbolView name={symbol('magnifyingglass', 'search')} size={18} tintColor={palette.muted} />
      }
      rightAdornment={
        hasValue && onClear ? (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <SymbolView
              name={symbol('xmark.circle.fill', 'cancel')}
              size={18}
              tintColor={palette.muted}
            />
          </Pressable>
        ) : undefined
      }
      {...props}
    />
  );
});
