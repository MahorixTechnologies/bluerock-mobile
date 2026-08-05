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
import type { AppPalette } from '@/constants/theme';
import type { Listing } from '@/lib/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_H_PADDING = 16;
const GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - CAROUSEL_H_PADDING * 2;
const SNAP = CARD_WIDTH + GAP;

type HomeFeaturedCarouselProps = {
  listings: Listing[];
  palette: AppPalette;
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
            <ListingCard item={item} href={`/modal?mode=listing&id=${item.id}` as Href} variant="featured" />
          </View>
        )}
      />

      {listings.length > 1 ? (
        <View style={styles.dotsWrap}>
          <View style={styles.dotsTrack}>
            {listings.map((item, index) => {
              const active = index === activeIndex;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.dot,
                    {
                      width: active ? 26 : 6,
                      height: 6,
                      backgroundColor: active ? palette.primary : palette.soft,
                      borderRadius: 3,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -16,
    gap: 16,
  },
  content: {
    paddingHorizontal: 16,
    gap: GAP,
  },
  dotsWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 2 },
  dotsTrack: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: { height: 6, borderRadius: 3 },
});
