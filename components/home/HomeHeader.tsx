import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HomePalette } from '@/components/home/types';

type HomeHeaderProps = {
  greetingLabel: string;
  greeting: string;
  profileSummary: string;
  avatarInitials: string;
  palette: HomePalette;
  isDark: boolean;
};

export function HomeHeader({
  greetingLabel,
  greeting,
  profileSummary,
  avatarInitials,
  palette,
  isDark,
}: HomeHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#2d3342' : '#dfe5f2' }]}>
          <Text style={[styles.avatarText, { color: palette.text }]}>
            {avatarInitials || greeting[0]?.toUpperCase() || 'G'}
          </Text>
        </View>
        <View style={styles.headerTextBlock}>
          <Text style={[styles.kicker, { color: palette.muted }]}>{greetingLabel}</Text>
          <Text style={[styles.headerName, { color: palette.text }]} numberOfLines={1}>
            {greeting}
          </Text>
          <Text style={[styles.headerMeta, { color: palette.muted }]} numberOfLines={1}>
            {profileSummary}
          </Text>
        </View>
      </View>
      <Link href={'/(tabs)/profile' as Href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            { backgroundColor: palette.iconBubble, opacity: pressed ? 0.88 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' } as any}
            size={18}
            tintColor={palette.text}
            weight="medium"
          />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  headerTextBlock: { flex: 1, gap: 2 },
  kicker: { fontSize: 14, fontWeight: '500' },
  headerName: { fontSize: 20, lineHeight: 26, fontWeight: '800' },
  headerMeta: { fontSize: 13, fontWeight: '500' },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
