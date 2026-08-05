import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';

type LandlordDashboardHeaderProps = {
  greetingName: string;
  avatarInitials: string;
  palette: AppPalette;
  hasNotifications?: boolean;
  onAddProperty: () => void;
  onNotifications: () => void;
};

const NAVY_DEEP = '#0b2466';
const NAVY_AVATAR_BG = 'rgba(255,255,255,0.12)';
const NAVY_PILL_BG = 'rgba(255,255,255,0.10)';
const TEXT_ON_NAVY = '#ffffff';
const TEXT_SUBTLE_ON_NAVY = 'rgba(255,255,255,0.74)';
const CTA_BLUE = '#2563eb';

export function LandlordDashboardHeader({
  greetingName,
  avatarInitials,
  hasNotifications = true,
  onAddProperty,
  onNotifications,
}: LandlordDashboardHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: NAVY_DEEP }]}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: NAVY_AVATAR_BG }]}>
          <Text style={[styles.avatarText, { color: TEXT_ON_NAVY }]}>
            {avatarInitials}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            { opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={onNotifications}
        >
          <SymbolView
            name={
              {
                ios: 'bell.fill',
                android: 'notifications',
                web: 'notifications',
              } as any
            }
            size={22}
            tintColor={TEXT_ON_NAVY}
            weight="semibold"
          />
          {hasNotifications ? (
            <View style={styles.notifBadge}>
              <View style={styles.notifBadgeInner} />
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.textBlock}>
        <View style={[styles.rolePill, { backgroundColor: NAVY_PILL_BG }]}>
          <SymbolView
            name={
              {
                ios: 'building.2.fill',
                android: 'apartment',
                web: 'apartment',
              } as any
            }
            size={11}
            tintColor={TEXT_ON_NAVY}
            weight="semibold"
          />
          <Text style={[styles.rolePillText, { color: TEXT_ON_NAVY }]}>LANDLORD</Text>
        </View>
        <Text style={[styles.welcomeTitle, { color: TEXT_ON_NAVY }]}>
          Welcome back, {greetingName}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: TEXT_SUBTLE_ON_NAVY }]}>
          Here&apos;s how your properties are doing.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor: CTA_BLUE, opacity: pressed ? 0.92 : 1 },
        ]}
        onPress={onAddProperty}
      >
        <View style={styles.ctaIconWrap}>
          <SymbolView
            name={
              {
                ios: 'plus.square',
                android: 'add-box',
                web: 'add-box',
              } as any
            }
            size={22}
            tintColor={TEXT_ON_NAVY}
            weight="semibold"
          />
        </View>
        <Text style={[styles.ctaLabel, { color: TEXT_ON_NAVY }]}>
          Add a new property
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0b2466',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  textBlock: {
    gap: 6,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});
