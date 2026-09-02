import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

const DIGIT_COUNT = 6;

export function OtpInput({
  value,
  onChange,
  disabled = false,
  autoFocus = true,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const { palette } = useAppTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length: DIGIT_COUNT }, (_, i) => value[i] ?? '');

  function setDigit(index: number, raw: string) {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }

    const chars = clean.split('');
    if (chars.length > 1) {
      onChange(chars.join('').slice(0, DIGIT_COUNT));
      const target = Math.min(chars.length - 1, DIGIT_COUNT - 1);
      inputRefs.current[target]?.focus();
      return;
    }

    const next = (value.slice(0, index).padEnd(index, ' ') + chars[0]).slice(0, DIGIT_COUNT);
    onChange(next.replace(/ /g, ''));

    if (index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={digit}
          editable={!disabled}
          autoFocus={autoFocus && index === 0}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={2}
          onChangeText={(text) => setDigit(index, text)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
          style={[
            styles.box,
            {
              backgroundColor: palette.field,
              borderColor: palette.border,
              color: palette.text,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
});
