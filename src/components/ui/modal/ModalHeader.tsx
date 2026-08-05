import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { ModalMode, TabKey } from './types';

type TabDef = { key: TabKey; label: string; subtitle: string };

export function resolveTabs(mode: ModalMode): TabDef[] {
  switch (mode) {
    case 'booking':
      return [
        { key: 'info', label: 'Info', subtitle: 'Summary' },
        { key: 'actions', label: 'Actions', subtitle: 'Pay / Approve' },
        { key: 'history', label: 'History', subtitle: 'Status log' },
      ];
    case 'listing':
      return [
        { key: 'info', label: 'Info', subtitle: 'Property details' },
        { key: 'actions', label: 'Actions', subtitle: 'Save / Share / Book' },
        { key: 'history', label: 'Highlights', subtitle: 'Showcase' },
      ];
    case 'welcome':
    default:
      return [
        { key: 'info', label: 'Overview', subtitle: 'Welcome' },
        { key: 'actions', label: 'Get started', subtitle: 'Actions' },
        { key: 'history', label: 'Coming up', subtitle: 'Roadmap' },
      ];
  }
}

export function ModalHeader(props: {
  mode: ModalMode;
  title: string;
  subtitle: string;
  onClose: () => void;
  tabs: TabDef[];
  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;
}) {
  const { mode, title, subtitle, onClose, tabs, activeTab, setActiveTab } = props;
  const { palette } = useAppTheme();

  return (
    <>
      <View style={styles.handleWrap} pointerEvents="none">
        <View style={[styles.handle, { backgroundColor: palette.border }]} />
      </View>

      <View style={[styles.headerRow, { borderBottomColor: palette.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerBadge, { backgroundColor: palette.primarySoft }]}>
            <SymbolView
              name={
                {
                  ios: mode === 'booking' ? 'calendar.badge.clock' : mode === 'listing' ? 'house.lodge.fill' : 'sparkles',
                  android: mode === 'booking' ? 'event' : mode === 'listing' ? 'home' : 'auto_awesome',
                  web: 'info',
                } as any
              }
              size={16}
              tintColor={palette.primary}
              weight="semibold"
            />
            <Text style={[styles.headerBadgeText, { color: palette.primary }]}>
              {mode === 'booking' ? 'BOOKING' : mode === 'listing' ? 'LISTING' : 'BLUEROCK'}
            </Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.headerSubtitle, { color: palette.muted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>
        <Pressable
          hitSlop={10}
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' } as any}
            size={18}
            tintColor={palette.text}
            weight="semibold"
          />
        </Pressable>
      </View>

      <View style={[styles.tabsTrack, { borderBottomColor: palette.border }]}>
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={({ pressed }) => [
                styles.tabItem,
                {
                  borderBottomColor: active ? palette.primary : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Text style={[styles.tabLabel, { color: active ? palette.primary : palette.muted }]}>
                {t.label}
              </Text>
              <Text style={[styles.tabSubtitle, { color: palette.muted }]}>{t.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export const headerStyles = {
  container: { flex: 1, paddingTop: 14 },
  scrollBody: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80, gap: 12 },
};

const styles = StyleSheet.create({
  handleWrap: { alignItems: 'center', paddingTop: 6, paddingBottom: 8 },
  handle: { width: 44, height: 5, borderRadius: 999 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flex: 1, gap: 8, flexDirection: 'row', alignItems: 'flex-start' },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 2,
  },
  headerBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  headerTitle: { fontSize: 16, fontWeight: '900' },
  headerSubtitle: { fontSize: 12 },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tabsTrack: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    gap: 2,
  },
  tabLabel: { fontSize: 13, fontWeight: '800' },
  tabSubtitle: { fontSize: 10, opacity: 0.85 },
});
