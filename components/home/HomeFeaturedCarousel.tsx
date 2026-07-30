import { Href } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

import { ListingCard } from '@/components/ListingCard';
import type { HomePalette } from '@/components/home/types';
import type { Listing } from '@/lib/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 16;
const GAP = 14;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const SNAP = CARD_WIDTH + GAP;

type HomeFeaturedCarouselProps = {
  listings: Listing[];
  palette: HomePalette;
};

export function HomeFeaturedCarousel({ listings, palette }: HomeFeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = useRef(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP);
    if (index !== lastIndex.current) {
      lastIndex.current = index;
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ListingCard item={item} href={`/listing/${item.id}` as Href} variant="featured" />
          </View>
        )}
      />

      {listings.length > 1 ? (
        <View style={styles.dots}>
          {listings.map((item, index) => {
            const active = index === activeIndex;
            return (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  {
                    width: active ? 22 : 7,
                    backgroundColor: active ? palette.text : palette.soft,
                    opacity: active ? 1 : 0.9,
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  content: { gap: GAP },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 7, borderRadius: 999 },
});
