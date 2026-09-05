import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MemeCanvas, type CanvasImageSource } from '@/components/canvas/MemeCanvas';
import { PremiumBadge } from '@/components/PremiumBadge';
import { catalog } from '@/content';
import { strings } from '@/i18n/strings';
import { SAMPLE_IMAGE } from '@/theme/sampleImage';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Preset } from '@/types/catalog';
import { identityTransform } from '@/utils/imageTransform';
import { defaultValues, imageElementOf, resolveLayout } from '@/utils/templateEngine';

/** Proporção do card (03-ui §2.3): 4:5, que encaixa exatamente um canvas 1080×1350. */
export const CARD_RATIO = 1.25;

interface Props {
  preset: Preset;
  /** foto do usuário (miniatura); sem ela usa a foto-exemplo */
  image?: CanvasImageSource | null;
  width: number;
  onPress: (preset: Preset) => void;
  /** mostra o badge PRO (preset premium ainda não liberado) */
  locked?: boolean;
  isNew?: boolean;
}

export const TemplateCard = memo(function TemplateCard({ preset, image, width, onPress, locked, isNew }: Props) {
  const layout = catalog.layoutOf(preset);
  const resolved = resolveLayout({
    layout,
    values: defaultValues(preset, layout),
    style: { caps: false },
    showBrand: true,
  });
  const height = width * CARD_RATIO;
  const scale = Math.min(width / resolved.width, height / resolved.height);

  return (
    <Pressable
      onPress={() => onPress(preset)}
      accessibilityRole="button"
      accessibilityLabel={preset.name}
      style={({ pressed }) => [styles.card, { width, height }, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <View style={styles.canvasBox}>
        <MemeCanvas resolved={resolved} image={image ?? SAMPLE_IMAGE} imageTransform={identityTransform(imageElementOf(layout).defaultFit)} scale={scale} />
      </View>
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.footer} pointerEvents="none">
        <Text style={[typography.label, styles.name]} numberOfLines={1}>
          {preset.name}
        </Text>
      </LinearGradient>
      {locked ? (
        <View style={styles.badgePro}>
          <PremiumBadge />
        </View>
      ) : null}
      {isNew ? (
        <View style={styles.badgeNew}>
          <Text style={[typography.caption, styles.badgeNewText]}>{strings.templates.newBadge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  canvasBox: { alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: spacing.xl, paddingBottom: spacing.sm, paddingHorizontal: spacing.md },
  name: { color: colors.text },
  badgePro: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  badgeNew: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.badge,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeNewText: { color: colors.onPrimary, fontFamily: 'Rubik-Black' },
});
