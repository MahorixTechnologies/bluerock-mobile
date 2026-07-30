import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export default function ModalScreen() {
  const { palette } = useAppTheme();

  const items = [
    { ios: 'sparkles', android: 'auto-awesome', title: 'Curated stays', body: 'Handpicked homes across Nigeria and beyond.' },
    { ios: 'lock.shield.fill', android: 'security', title: 'Secure bookings', body: 'Your payments and data stay protected.' },
    { ios: 'bell.badge.fill', android: 'notifications', title: 'Stay updated', body: 'Get notified about new listings and requests.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: palette.primarySoft }]}>
        <SymbolView
          name={{ ios: 'house.lodge.fill', android: 'home', web: 'home' } as any}
          size={40}
          tintColor={palette.primary}
        />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>Welcome to BlueRock</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        The simple way to find, book, and manage stays.
      </Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View
            key={item.title}
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: palette.primarySoft }]}>
              <SymbolView
                name={{ ios: item.ios, android: item.android, web: item.android } as any}
                size={18}
                tintColor={palette.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: palette.text }]}>{item.title}</Text>
              <Text style={[styles.rowBody, { color: palette.muted }]}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 28, gap: 10, alignItems: 'center' },
  iconWrap: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 300 },
  list: { alignSelf: 'stretch', gap: 12, marginTop: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '800' },
  rowBody: { fontSize: 13, lineHeight: 19, marginTop: 2 },
});
