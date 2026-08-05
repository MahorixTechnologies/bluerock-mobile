import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';

type HomeFilterChipsProps = {
  chips: string[];
  palette: AppPalette;
  onSelect?: (chip: string, index: number) => void;
};

export function HomeFilterChips({ chips, palette, onSelect }: HomeFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}>
      {chips.map((chip, index) => {
        const active = index === 0;
        return (
          <Pressable
            key={`${chip}-${index}`}
            onPress={() => onSelect?.(chip, index)}
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor: active ? palette.primary : palette.card,
                borderColor: active ? palette.primary : palette.border,
                shadowColor: palette.shadow,
                shadowOpacity: active ? 0.18 : 0.03,
                opacity: pressed ? 0.92 : 1,
              },
            ]}>
            <View
              style={[
                styles.chipIconWrap,
                {
                  backgroundColor: active ? 'rgba(255,255,255,0.22)' : palette.soft,
                },
              ]}>
              <SymbolView
                name={
                  {
                    ios: active ? 'flame.fill' : 'mappin',
                    android: active ? 'local-fire-department' : 'place',
                    web: active ? 'local-fire-department' : 'place',
                  } as any
                }
                size={14}
                tintColor={active ? palette.onPrimary : palette.muted}
                weight="semibold"
              />
            </View>
            <Text
              style={[
                styles.filterChipText,
                { color: active ? palette.onPrimary : palette.text },
              ]}>
              {chip}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipRow: { paddingRight: 16, gap: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  chipIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: { fontSize: 13, fontWeight: '800', letterSpacing: -0.1 },
});
