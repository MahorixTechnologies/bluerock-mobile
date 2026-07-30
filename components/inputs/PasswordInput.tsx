import { forwardRef, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Input, type InputProps } from '@/components/inputs/Input';
import { symbol } from '@/components/inputs/symbols';
import { useAppTheme } from '@/hooks/useAppTheme';

export type PasswordInputProps = Omit<
  InputProps,
  'secureTextEntry' | 'rightIcon' | 'rightAdornment' | 'onRightIconPress'
>;

/**
 * A password field with a built-in show/hide toggle. Everything else behaves
 * exactly like {@link Input} (label, error, sizing, etc.).
 */
export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(function PasswordInput(
  { autoCapitalize = 'none', autoCorrect = false, textContentType = 'password', ...props },
  ref,
) {
  const { palette } = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      secureTextEntry={!visible}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      textContentType={textContentType}
      rightAdornment={
        <Pressable
          onPress={() => setVisible((value) => !value)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <SymbolView
            name={symbol(visible ? 'eye.slash' : 'eye', visible ? 'visibility-off' : 'visibility')}
            size={18}
            tintColor={palette.muted}
          />
        </Pressable>
      }
      {...props}
    />
  );
});
