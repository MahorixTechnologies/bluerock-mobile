import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Input, type InputProps } from './Input';
import { useAppTheme } from '@/hooks/useAppTheme';

export type TextareaProps = Omit<InputProps, 'multiline'> & {
  /** Number of visible text lines (drives the initial height). */
  rows?: number;
  /** When set alongside `maxLength`, shows a live character counter. */
  showCount?: boolean;
};

/**
 * A multi-line text area built on {@link Input}, with an optional character
 * counter that turns red as it approaches `maxLength`.
 */
export const Textarea = forwardRef<TextInput, TextareaProps>(function Textarea(
  { rows = 4, showCount = false, maxLength, value, size = 'lg', ...props },
  ref,
) {
  const { palette } = useAppTheme();
  const length = typeof value === 'string' ? value.length : 0;
  const nearLimit = maxLength != null && length >= maxLength * 0.9;

  return (
    <View>
      <Input
        ref={ref}
        multiline
        size={size}
        value={value}
        maxLength={maxLength}
        inputStyle={{ minHeight: rows * 22 }}
        {...props}
      />
      {showCount && maxLength != null ? (
        <Text style={[styles.count, { color: nearLimit ? palette.danger : palette.muted }]}>
          {length} / {maxLength}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  count: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
