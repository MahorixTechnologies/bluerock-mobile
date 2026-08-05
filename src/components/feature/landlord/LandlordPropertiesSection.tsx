import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import { LandlordPropertyItemCard } from './LandlordPropertyItemCard';
import type { LandlordPropertyItem } from './types';

type LandlordPropertiesSectionProps = {
  palette: AppPalette;
  properties: LandlordPropertyItem[];
  onViewAll: () => void;
  onPropertyPress: (id: string) => void;
};

export function LandlordPropertiesSection({
  palette,
  properties,
  onViewAll,
  onPropertyPress,
}: LandlordPropertiesSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          Your properties
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.viewAllRow,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={onViewAll}
        >
          <Text style={[styles.viewAllText, { color: palette.primary }]}>
            View all
          </Text>
          <SymbolView
            name={{
              ios: 'chevron.right',
              android: 'chevron-right',
              web: 'chevron-right',
            } as any}
            size={15}
            tintColor={palette.primary}
            weight="semibold"
          />
        </Pressable>
      </View>

      <View style={styles.listGap}>
        {properties.map((property, index) => (
          <View key={property.id} style={index > 0 ? styles.itemGap : undefined}>
            <LandlordPropertyItemCard
              property={property}
              palette={palette}
              onPress={() => onPropertyPress(property.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingLeft: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  listGap: {
    gap: 0,
  },
  itemGap: {
    marginTop: 10,
  },
});
