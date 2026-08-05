import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  loading?: boolean;
  message?: string;
};

export function HostListingsEmptyState({ loading, message }: Props) {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.cardTitle, { color: palette.text }]}>
        {loading ? 'Loading…' : 'No listings yet'}
      </Text>
      <Text style={[styles.cardSubtitle, { color: palette.muted }]}>
        {message ?? 'Create your first property listing above.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 6,
    marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 13 },
});
