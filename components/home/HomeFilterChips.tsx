import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { HomePalette } from '@/components/home/types';

type HomeFilterChipsProps = {
  chips: string[];
  palette: HomePalette;
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
        const iconColor = active ? palette.bg : palette.muted;
        return (
          <Pressable
            key={`${chip}-${index}`}
            onPress={() => onSelect?.(chip, index)}
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor: active ? palette.text : palette.card,
                borderColor: active ? palette.text : palette.soft,
                opacity: pressed ? 0.9 : 1,
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
              tintColor={iconColor}
              weight="medium"
            />
            <Text style={[styles.filterChipText, { color: active ? palette.bg : palette.text }]}>
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
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontWeight: '700' },
});
