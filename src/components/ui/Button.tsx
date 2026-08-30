import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = {
  children: ReactNode;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const { palette } = useAppTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = isDisabled
    ? palette.primarySoft
    : variant === 'secondary'
      ? 'transparent'
      : variant === 'danger'
        ? palette.danger
        : palette.primary;

  const textColor = variant === 'secondary' ? palette.text : palette.onPrimary;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor },
        variant === 'secondary' ? { borderWidth: 1, borderColor: palette.border } : null,
        style,
        { opacity: pressed ? 0.9 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontWeight: '800',
    fontSize: 16,
  },
});
