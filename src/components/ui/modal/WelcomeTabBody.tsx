import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { formatMoney } from '@/lib/format';
import { Card, Eyebrow, Row2, cardStyles, welcomeStyles, type PaletteLike } from './presentational';
import type { TabKey, Listing } from './types';

export function WelcomeTabBody(props: {
  tab: TabKey;
  palette: PaletteLike;
  featuredListing: Listing | null;
  onBrowse: () => void;
  onLogin: () => void;
}) {
  const { tab, palette, featuredListing, onBrowse, onLogin } = props;

  const items = [
    {
      ios: 'sparkles',
      android: 'auto_awesome',
      title: 'Curated stays',
      body: 'Handpicked homes across Nigeria and beyond.',
    },
    {
      ios: 'lock.shield.fill',
      android: 'security',
      title: 'Secure bookings',
      body: 'Your payments and data stay protected.',
    },
    {
      ios: 'bell.badge.fill',
      android: 'notifications',
      title: 'Stay updated',
      body: 'Get notified about new listings and requests.',
    },
  ];

  if (tab === 'info') {
    return (
      <View style={{ gap: 12, alignItems: 'center' }}>
        <View style={[welcomeStyles.iconWrap, { backgroundColor: palette.primarySoft }]}>
          <SymbolView
            name={{ ios: 'house.lodge.fill', android: 'home', web: 'home' } as any}
            size={40}
            tintColor={palette.primary}
          />
        </View>
        <Text style={[welcomeStyles.title, { color: palette.text }]}>Welcome to BlueRock</Text>
        <Text style={[welcomeStyles.subtitle, { color: palette.muted }]}>
          The simple way to find, book, and manage stays.
        </Text>
        <View style={{ alignSelf: 'stretch', gap: 12 }}>
          {items.map((item) => (
            <Card key={item.title} palette={palette}>
              <View style={welcomeStyles.row}>
                <View style={[welcomeStyles.rowIcon, { backgroundColor: palette.primarySoft }]}>
                  <SymbolView
                    name={{ ios: item.ios, android: item.android, web: item.android } as any}
                    size={18}
                    tintColor={palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[cardStyles.title, { color: palette.text, fontSize: 15 }]}>
                    {item.title}
                  </Text>
                  <Text style={[cardStyles.meta, { color: palette.muted }]}>{item.body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  if (tab === 'actions') {
    return (
      <View style={{ gap: 12 }}>
        <Card palette={palette}>
          <Eyebrow palette={palette} color={palette.primary}>GET STARTED</Eyebrow>
          <Text style={[cardStyles.title, { color: palette.text }]}>Let's go</Text>
          <Text style={[cardStyles.meta, { color: palette.muted }]}>
            Browse homes as a guest or publish your first property as a host.
          </Text>
          <View style={{ gap: 10, marginTop: 6 }}>
            <Button onPress={onBrowse}>Browse stays</Button>
            <Button variant="secondary" onPress={onLogin}>
              Log in or register
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Card palette={palette}>
        <Eyebrow palette={palette} color={palette.warning}>FEATURED THIS MONTH</Eyebrow>
        <Text style={[cardStyles.title, { color: palette.text }]}>
          {featuredListing?.title ?? 'Featured home'}
        </Text>
        <Text style={[cardStyles.meta, { color: palette.muted }]}>
          {featuredListing?.location ?? ''}
        </Text>
        <View style={cardStyles.divider} />
        <Row2
          palette={palette}
          label="From"
          value={featuredListing ? formatMoney(featuredListing.pricePerNight, featuredListing.currency) + ' / night' : '—'}
          strong
        />
      </Card>
    </View>
  );
}
