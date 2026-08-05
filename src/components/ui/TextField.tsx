import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput as DefaultTextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Text, useThemeColor, View } from '@/components/Themed';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelColor?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  errorColor?: string;
  editableOpacity?: number;
};

const TextField = forwardRef<DefaultTextInput, TextFieldProps>(function TextField(
  {
    label,
    error,
    containerStyle,
    inputStyle,
    labelColor,
    textColor,
    borderColor,
    backgroundColor,
    errorColor,
    editableOpacity = 0.6,
    editable = true,
    placeholderTextColor,
    ...inputProps
  },
  ref,
) {
  const resolvedTextColor = useThemeColor({ light: '#1f2937', dark: '#f8fafc' }, 'text');
  const resolvedLabelColor = useThemeColor({ light: '#1f2937', dark: '#f8fafc' }, 'text');
  const resolvedBorderColor = useThemeColor(
    { light: 'rgba(15,23,42,0.08)', dark: 'rgba(255,255,255,0.12)' },
    'text',
  );
  const resolvedBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#111827' }, 'background');
  const resolvedPlaceholderColor = useThemeColor(
    { light: 'rgba(100,116,139,0.72)', dark: 'rgba(203,213,225,0.42)' },
    'text',
  );
  const resolvedErrorColor = errorColor ?? '#ef4444';

  return (
    <View style={[styles.fieldBlock, containerStyle]} lightColor="transparent" darkColor="transparent">
      {label ? <Text style={[styles.label, { color: labelColor ?? resolvedLabelColor }]}>{label}</Text> : null}
      <DefaultTextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={placeholderTextColor ?? resolvedPlaceholderColor}
        style={[
          styles.input,
          {
            color: textColor ?? resolvedTextColor,
            borderColor: borderColor ?? resolvedBorderColor,
            backgroundColor: backgroundColor ?? resolvedBackgroundColor,
            opacity: editable ? 1 : editableOpacity,
          },
          inputStyle,
        ]}
        {...inputProps}
      />
      {error ? <Text style={[styles.errorText, { color: resolvedErrorColor }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fieldBlock: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TextField;
