import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { formatMoney } from '@/lib/format';
import { Card, Eyebrow, Row2, cardStyles, type PaletteLike } from './presentational';
import type { TabKey, Listing } from './types';
import { toTitleCase } from './types';

export function ListingTabBody(props: {
  tab: TabKey;
  listing: Listing | null;
  fallbackListing: Listing | null;
  palette: PaletteLike;
  onClose: () => void;
  onOpenFull: (id: string) => void;
  onBook: (id: string) => void;
}) {
  const { tab, listing, fallbackListing, palette, onClose, onOpenFull, onBook } = props;
  const display = listing ?? fallbackListing;
  if (!display) {
    return (
      <Card palette={palette}>
        <Text style={[cardStyles.title, { color: palette.text }]}>No property data</Text>
      </Card>
    );
  }

  if (tab === 'info') {
    return (
      <View style={{ gap: 12 }}>
        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.primary}>PROPERTY</Eyebrow>
          <Text style={[cardStyles.title, { color: palette.text }]}>{display.title}</Text>
          <Text style={[cardStyles.meta, { color: palette.muted }]}>{display.location}</Text>
          <View style={cardStyles.divider} />
          <Row2 palette={palette} label="Type" value={toTitleCase(display.type)} />
          <Row2 palette={palette} label="Bedrooms" value={`${display.rooms}`} />
          <Row2 palette={palette} label="Bathrooms" value={`${display.bathrooms}`} />
          <Row2 palette={palette} label="Price" value={formatMoney(display.pricePerNight, display.currency) + ' / night'} strong />
        </Card>

        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.success}>HIGHLIGHTS</Eyebrow>
          <Text style={[cardStyles.meta, { color: palette.text }]}>{display.description}</Text>
        </Card>
      </View>
    );
  }

  if (tab === 'actions') {
    return (
      <View style={{ gap: 12 }}>
        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.primary}>QUICK ACTIONS</Eyebrow>
          <View style={{ gap: 10 }}>
            <Button onPress={() => onBook(display.id)}>Book this stay</Button>
            <Button variant="secondary" onPress={() => onOpenFull(display.id)}>
              Open full listing
            </Button>
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  const highlights = [
    { label: 'Featured', value: display.featured ? 'Yes' : 'No' },
    { label: 'Max guests', value: '—' },
    { label: 'Amenities', value: (display.amenities?.length ?? 0) + ' featured' },
    { label: 'Currency', value: display.currency },
  ];
  return (
    <View style={{ gap: 12 }}>
      <Card palette={palette}>
        <Eyebrow palette={palette} color={palette.warning}>SNAPSHOT</Eyebrow>
        <Text style={[cardStyles.title, { color: palette.text }]}>What you need to know</Text>
        <View style={cardStyles.divider} />
        {highlights.map((h) => (
          <Row2 key={h.label} palette={palette} label={h.label} value={h.value} />
        ))}
      </Card>
    </View>
  );
}
