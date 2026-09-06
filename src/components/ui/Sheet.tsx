import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** fração da altura da tela que o painel pode ocupar (padrão: pelo conteúdo) */
  maxHeightRatio?: number;
}

/**
 * Bottom sheet do app sobre o `Modal` do React Native: sobe de baixo, fundo escurecido,
 * fecha no toque fora e no botão voltar do Android. Os filhos só existem quando aberta.
 *
 * Não usamos biblioteca de sheet: a do gorhom não renderizava no aparelho e o comportamento
 * que precisamos (subir, fundo, fechar) é nativo do Modal.
 */
export function Sheet({ open, onClose, children, maxHeightRatio }: Props) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" testID="sheet-backdrop" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, maxHeightRatio ? { maxHeight: `${Math.round(maxHeightRatio * 100)}%` } : null]}>
            <View style={styles.handle} />
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.sm },
});
