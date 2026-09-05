import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, proGradient, radius, sizes, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'pro';

interface IconProps {
  size?: number;
  color?: string;
}

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ComponentType<IconProps>;
  loading?: boolean;
  disabled?: boolean;
  /** ícone em cima do rótulo, altura 88 (sheet de foto) */
  tile?: boolean;
  /** segunda linha pequena (ex.: "compra única") */
  sublabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEIGHT: Record<ButtonVariant, number> = {
  primary: sizes.buttonPrimary,
  secondary: sizes.buttonSecondary,
  ghost: sizes.buttonGhost,
  pro: sizes.buttonPrimary,
};

export function Button({ label, onPress, variant = 'primary', icon: Icon, loading, disabled, tile, sublabel, style, testID }: Props) {
  const inactive = Boolean(disabled || loading);
  const textColor = variant === 'primary' ? colors.onPrimary : variant === 'ghost' ? colors.textMuted : colors.text;
  const textStyle = variant === 'ghost' ? typography.bodyMedium : typography.title;

  const content = loading ? (
    <ActivityIndicator testID={testID ? `${testID}-spinner` : undefined} color={textColor} />
  ) : (
    <View style={[styles.content, tile && styles.tileContent]}>
      {Icon ? <Icon size={tile ? 28 : 20} color={textColor} /> : null}
      <View style={styles.labels}>
        <Text style={[textStyle, { color: textColor }]}>{label}</Text>
        {sublabel ? <Text style={[typography.caption, { color: textColor, opacity: 0.85 }]}>{sublabel}</Text> : null}
      </View>
    </View>
  );

  const handlePress = () => {
    if (inactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: Boolean(loading) }}
      style={({ pressed }) => [
        styles.base,
        { height: tile ? 88 : HEIGHT[variant] },
        variant === 'primary' && { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
        variant === 'secondary' && { backgroundColor: colors.surface2 },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        pressed && !inactive && { transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {variant === 'pro' ? (
        <LinearGradient colors={[...proGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.gradient]}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', alignSelf: 'stretch' },
  gradient: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  tileContent: { flexDirection: 'column', gap: spacing.sm },
  labels: { alignItems: 'center' },
});
