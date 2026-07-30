import { SymbolView } from 'expo-symbols';
import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export default function NotFoundScreen() {
  const { palette } = useAppTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={[styles.iconWrap, { backgroundColor: palette.primarySoft }]}>
          <SymbolView
            name={{ ios: 'map', android: 'explore', web: 'explore' } as any}
            size={44}
            tintColor={palette.primary}
          />
        </View>
        <Text style={[styles.code, { color: palette.muted }]}>404</Text>
        <Text style={[styles.title, { color: palette.text }]}>This screen doesn’t exist</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          The page you’re looking for may have moved or is no longer available.
        </Text>

        <Link href="/" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
            ]}>
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' } as any}
              size={17}
              tintColor={palette.onPrimary}
            />
            <Text style={[styles.buttonText, { color: palette.onPrimary }]}>Go to home</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  iconWrap: { width: 96, height: 96, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  code: { fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 300 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: { fontSize: 16, fontWeight: '800' },
});
