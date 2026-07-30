import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Themed';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
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
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'danger' ? styles.danger : null,
        isDisabled ? styles.disabled : null,
        style,
        { opacity: pressed ? 0.9 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#111827' : '#ffffff'} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'secondary' ? styles.secondaryLabel : null,
          ]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    marginTop: 6,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.25)',
  },
  danger: {
    backgroundColor: '#ef4444',
  },
  disabled: {
    backgroundColor: 'rgba(37,99,235,0.35)',
  },
  label: {
    fontWeight: '800',
    fontSize: 16,
    color: '#ffffff',
  },
  secondaryLabel: {
    color: '#111827',
  },
});
