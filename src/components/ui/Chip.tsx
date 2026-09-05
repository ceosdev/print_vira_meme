import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, sizes } from '@/theme/tokens';
import { typography } from '@/theme/typography';

interface Props {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
}

export function Chip({ label, emoji, selected, onPress, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      hitSlop={6}
      style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.surface2 }]}
    >
      <Text style={[typography.label, { color: selected ? colors.onPrimary : colors.text }]}>
        {emoji ? `${emoji} ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: sizes.chip, paddingHorizontal: 14, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
