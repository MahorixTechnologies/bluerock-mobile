import { forwardRef, useCallback, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

import { useAppTheme } from '@/hooks/useAppTheme';
import { symbol } from '@/components/inputs/symbols';

const AnimatedView = Animated.createAnimatedComponent(View);

export type InputSize = 'md' | 'lg';

export type InputProps = TextInputProps & {
  /** Field label rendered above the input. */
  label?: string;
  /** Marks the field visually as required (adds a subtle asterisk). */
  required?: boolean;
  /** Neutral hint shown under the field when there is no error. */
  helperText?: string;
  /** Error message; when set, the field switches to its error styling. */
  error?: string | null;
  /** SF Symbol name shown on the leading edge (e.g. `envelope`). */
  leftIcon?: string;
  /** SF Symbol name shown on the trailing edge (e.g. `checkmark`). */
  rightIcon?: string;
  /** Called when the right icon is pressed; turns it into a button. */
  onRightIconPress?: () => void;
  /** Fully custom leading adornment (overrides `leftIcon`). */
  leftAdornment?: ReactNode;
  /** Fully custom trailing adornment (overrides `rightIcon`). */
  rightAdornment?: ReactNode;
  /** Vertical density. `lg` is comfortable for auth/onboarding forms. */
  size?: InputSize;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const SIZES: Record<InputSize, { minHeight: number; fontSize: number; paddingH: number }> = {
  md: { minHeight: 50, fontSize: 15, paddingH: 14 },
  lg: { minHeight: 56, fontSize: 16, paddingH: 16 },
};

/**
 * The base input for the whole app: a themed, accessible text field with an
 * animated focus border, optional label, helper/error text, and leading/
 * trailing adornments. `PasswordInput`, `SearchInput`, and `Textarea` are all
 * thin wrappers around this component.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    required = false,
    helperText,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    leftAdornment,
    rightAdornment,
    size = 'md',
    containerStyle,
    inputStyle,
    editable = true,
    multiline = false,
    onFocus,
    onBlur,
    style,
    ...inputProps
  },
  ref,
) {
  const { palette } = useAppTheme();
  const dims = SIZES[size];
  const focus = useSharedValue(0);
  const [focused, setFocused] = useState(false);

  type FocusHandler = NonNullable<TextInputProps['onFocus']>;
  type BlurHandler = NonNullable<TextInputProps['onBlur']>;

  const hasError = Boolean(error);
  const restColor = hasError ? palette.danger : palette.border;
  const activeColor = hasError ? palette.danger : palette.primary;

  const handleFocus = useCallback<FocusHandler>(
    (event) => {
      focus.value = withTiming(1, { duration: 160 });
      setFocused(true);
      onFocus?.(event);
    },
    [focus, onFocus],
  );

  const handleBlur = useCallback<BlurHandler>(
    (event) => {
      focus.value = withTiming(0, { duration: 160 });
      setFocused(false);
      onBlur?.(event);
    },
    [focus, onBlur],
  );

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [restColor, activeColor]),
  }));

  const iconTint = hasError ? palette.danger : focused ? palette.primary : palette.muted;

  const renderedLeft =
    leftAdornment ??
    (leftIcon ? (
      <SymbolView name={symbol(leftIcon)} size={18} tintColor={iconTint} />
    ) : null);

  const renderedRight =
    rightAdornment ??
    (rightIcon ? (
      <Pressable
        onPress={onRightIconPress}
        disabled={!onRightIconPress}
        hitSlop={8}
        accessibilityRole={onRightIconPress ? 'button' : undefined}
        style={({ pressed }) => ({ opacity: pressed && onRightIconPress ? 0.6 : 1 })}>
        <SymbolView name={symbol(rightIcon)} size={18} tintColor={iconTint} />
      </Pressable>
    ) : null);

  return (
    <View style={[styles.block, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: palette.text }]}>
          {label}
          {required ? <Text style={{ color: palette.danger }}> *</Text> : null}
        </Text>
      ) : null}

      <AnimatedView
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          {
            minHeight: multiline ? dims.minHeight * 2 : dims.minHeight,
            paddingHorizontal: dims.paddingH,
            backgroundColor: palette.field,
            opacity: editable ? 1 : 0.55,
          },
          animatedBorder,
        ]}>
        {renderedLeft ? <View style={styles.adornment}>{renderedLeft}</View> : null}

        <TextInput
          ref={ref}
          editable={editable}
          multiline={multiline}
          placeholderTextColor={palette.placeholder}
          selectionColor={palette.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: palette.text,
              fontSize: dims.fontSize,
              paddingVertical: multiline ? 12 : 0,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
            inputStyle,
          ]}
          {...inputProps}
        />

        {renderedRight ? <View style={styles.adornment}>{renderedRight}</View> : null}
      </AnimatedView>

      {error ? (
        <Text style={[styles.helper, { color: palette.danger }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helper, { color: palette.muted }]}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  block: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  fieldMultiline: { alignItems: 'flex-start' },
  input: { flex: 1, paddingHorizontal: 0 },
  adornment: { alignItems: 'center', justifyContent: 'center' },
  helper: { fontSize: 13, lineHeight: 18 },
});
