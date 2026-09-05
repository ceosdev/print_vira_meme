import { Pencil } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { Slot } from '@/types/catalog';

interface Props {
  slot: Slot;
  value: string;
  active?: boolean;
  onPress: (slotId: string) => void;
}

export function SlotField({ slot, value, active, onPress }: Props) {
  const empty = value.trim().length === 0;
  return (
    <Pressable
      onPress={() => onPress(slot.id)}
      accessibilityRole="button"
      accessibilityLabel={slot.label}
      testID={`slot-${slot.id}`}
      style={[styles.card, active && { borderColor: colors.primary, borderWidth: 1.5 }]}
    >
      <View style={styles.texts}>
        <Text style={[typography.label, { color: colors.textMuted }]}>{slot.label}</Text>
        <Text style={[typography.body, { color: empty ? colors.textDisabled : colors.text }]} numberOfLines={1}>
          {empty ? (slot.placeholder ?? '—') : value}
        </Text>
      </View>
      <Pencil size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  texts: { flex: 1, gap: 2 },
});
