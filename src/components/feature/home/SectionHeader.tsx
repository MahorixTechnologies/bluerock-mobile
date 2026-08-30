import { SymbolView } from 'expo-symbols';
import { Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  href: Href;
  textColor: string;
  mutedColor: string;
  palette: AppPalette;
  eyebrow?: string;
  subtitle?: string;
  linkLabel?: string;
};

export function SectionHeader({
  title,
  href,
  textColor,
  mutedColor,
  palette,
  eyebrow,
  subtitle,
  linkLabel = 'See all',
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.headerLeft}>
        {eyebrow ? (
          <View style={[styles.eyebrowRow, { backgroundColor: palette.primarySoft }]}>
            <SymbolView
              name={{ ios: 'sparkles', android: 'auto-awesome', web: 'auto-awesome' } as any}
              size={10}
              tintColor={palette.primary}
              weight="bold"
            />
            <Text style={[styles.eyebrowText, { color: palette.primary }]}>{eyebrow}</Text>
          </View>
        ) : null}
        <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.sectionSubtitle, { color: mutedColor }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Link href={href} asChild>
        <Pressable
          style={({ pressed }) => [
            styles.sectionLinkRow,
            { backgroundColor: palette.soft, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={[styles.sectionLink, { color: mutedColor }]}>{linkLabel}</Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' } as any}
            size={13}
            tintColor={mutedColor}
            weight="semibold"
          />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { gap: 6, flex: 1, paddingRight: 12 },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  eyebrowText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3, lineHeight: 26 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18 },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  sectionLink: { fontSize: 13, fontWeight: '700' },
});
