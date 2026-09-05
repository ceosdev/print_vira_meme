import { ChevronRight } from 'lucide-react-native';
import type { ComponentType, ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

interface Props {
  title: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  testID?: string;
}

export function ListItem({ title, icon: Icon, right, onPress, chevron = true, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface2 }]}
    >
      {Icon ? <Icon size={22} color={colors.textMuted} /> : null}
      <Text style={[typography.bodyMedium, styles.title]}>{title}</Text>
      {right ?? (onPress && chevron ? <ChevronRight size={20} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.listItem,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { flex: 1, color: colors.text },
});
