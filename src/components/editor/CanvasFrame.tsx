import { Maximize2, RefreshCw } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { strings } from '@/i18n/strings';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { ImageFit } from '@/types/creation';

interface Props {
  children: ReactNode;
  width: number;
  height: number;
  fit: ImageFit;
  onChangePhoto: () => void;
  onToggleFit: () => void;
  busy?: boolean;
}

/** Moldura do preview: canvas + pills de "Trocar foto" e "Preencher/Encaixar" + overlay de exportação. */
export function CanvasFrame({ children, width, height, fit, onChangePhoto, onToggleFit, busy }: Props) {
  return (
    <View style={[styles.frame, { width, height }]}>
      {children}
      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[typography.label, { color: colors.text }]}>{strings.editor.generating}</Text>
        </View>
      ) : (
        <>
          <Pill onPress={onChangePhoto} icon={<RefreshCw size={16} color={colors.text} />} label={strings.editor.changePhoto} style={styles.left} testID="change-photo" />
          <Pill
            onPress={onToggleFit}
            icon={<Maximize2 size={16} color={colors.text} />}
            label={fit === 'cover' ? strings.editor.fitContain : strings.editor.fitCover}
            style={styles.right}
            testID="toggle-fit"
          />
        </>
      )}
    </View>
  );
}

function Pill({ onPress, icon, label, style, testID }: { onPress: () => void; icon: ReactNode; label: string; style: object; testID: string }) {
  return (
    <Pressable onPress={onPress} testID={testID} accessibilityRole="button" style={[styles.pill, style]}>
      {icon}
      <Text style={[typography.caption, { color: colors.text }]}>{label}</Text>
    </Pressable>
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
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(38,38,47,0.9)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  left: { left: spacing.md, bottom: spacing.md },
  right: { right: spacing.md, bottom: spacing.md },
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
