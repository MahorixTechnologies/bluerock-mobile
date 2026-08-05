import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteConfirmDialog({
  visible,
  title = 'Delete listing?',
  message = 'This permanently removes this property and all associated data. The action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}: Props) {
  const { palette } = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[styles.modalIconBubble, { backgroundColor: palette.dangerSoft }]}>
            <SymbolView
              name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
              size={22}
              tintColor={palette.danger}
              weight="semibold"
            />
          </View>
          <Text style={[styles.modalTitle, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.modalBody, { color: palette.muted }]}>{message}</Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonSecondary,
                { borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
              ]}>
              <Text style={[styles.modalButtonText, { color: palette.text }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalButtonPrimary,
                { backgroundColor: palette.danger, opacity: pressed ? 0.85 : 1 },
              ]}>
              <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  modalIconBubble: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.2 },
  modalBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: { borderWidth: 1 },
  modalButtonPrimary: {},
  modalButtonText: { fontWeight: '800', fontSize: 15 },
  modalButtonPrimaryText: { color: '#ffffff' },
});
