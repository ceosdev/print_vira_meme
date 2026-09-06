import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { strings } from '@/i18n/strings';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

interface Props {
  children: ReactNode;
  width: number;
  height: number;
  busy?: boolean;
}

/**
 * Moldura do preview. Nada de controles por cima: o que aparece aqui é exatamente o que
 * vai para o arquivo exportado (os botões ficam abaixo do canvas).
 */
export function CanvasFrame({ children, width, height, busy }: Props) {
  return (
    <View style={[styles.frame, { width, height }]}>
      {children}
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[typography.label, { color: colors.text }]}>{strings.editor.generating}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.canvas,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignSelf: 'center',
  },
  busy: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
