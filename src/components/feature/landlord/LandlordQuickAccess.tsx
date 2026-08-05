import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '@/constants/theme';
import type { QuickAction, QuickActionKey } from './types';

type LandlordQuickAccessProps = {
  palette: AppPalette;
  onAction: (key: QuickActionKey) => void;
};

const ACTIONS: QuickAction[] = [
  {
    key: 'tenants',
    label: 'Tenants',
    tintBg: 'rgba(59,130,246,0.14)',
    tintIcon: '#2563eb',
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    tintBg: 'rgba(22,163,74,0.14)',
    tintIcon: '#16a34a',
  },
  {
    key: 'payments',
    label: 'Payments',
    tintBg: 'rgba(217,119,6,0.14)',
    tintIcon: '#d97706',
  },
  {
    key: 'messages',
    label: 'Messages',
    tintBg: 'rgba(99,102,241,0.14)',
    tintIcon: '#4f46e5',
  },
];

function iconFor(key: QuickActionKey) {
  switch (key) {
    case 'tenants':
      return { ios: 'person.2.fill', android: 'group', web: 'group' };
    case 'maintenance':
      return { ios: 'wrench.fill', android: 'build', web: 'build' };
    case 'payments':
      return { ios: 'doc.text.fill', android: 'receipt', web: 'receipt' };
    case 'messages':
      return { ios: 'envelope.fill', android: 'mail', web: 'mail' };
  }
}

export function LandlordQuickAccess({ palette, onAction }: LandlordQuickAccessProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>
        Quick access
      </Text>
      <View style={styles.actionsRow}>
        {ACTIONS.map((action) => {
          const icons = iconFor(action.key);
          return (
            <Pressable
              key={action.key}
              style={({ pressed }) => [
                styles.actionItem,
                { opacity: pressed ? 0.92 : 1 },
              ]}
              onPress={() => onAction(action.key)}
            >
              <View
                style={[
                  styles.actionIconBubble,
                  { backgroundColor: action.tintBg },
                ]}
              >
                <SymbolView
                  name={icons as any}
                  size={26}
                  tintColor={action.tintIcon}
                  weight="semibold"
                />
              </View>
              <Text style={[styles.actionLabel, { color: palette.text }]}>
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIconBubble: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
    textAlign: 'center',
  },
});
