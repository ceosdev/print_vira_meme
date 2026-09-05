import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PremiumBadge } from '@/components/PremiumBadge';
import { colors, radius, sizes } from '@/theme/tokens';
import { FONTS, type FontFace } from '@/types/catalog';

interface Props {
  face: FontFace;
  selected: boolean;
  locked: boolean;
  onPress: (face: FontFace) => void;
}

export function FontChip({ face, selected, locked, onPress }: Props) {
  const font = FONTS[face];
  return (
    <Pressable
      onPress={() => onPress(face)}
      accessibilityRole="button"
      accessibilityLabel={font.label}
      accessibilityState={{ selected }}
      testID={`font-${face}`}
      style={[styles.chip, selected && { borderColor: colors.primary, borderWidth: 2 }]}
    >
      <Text
        allowFontScaling={false}
        style={{ fontFamily: font.family, fontSize: 20, color: selected ? colors.primary : colors.text, opacity: locked ? 0.6 : 1 }}
      >
        Aa
      </Text>
      {locked ? (
        <View style={styles.lock}>
          <PremiumBadge variant="lock" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: sizes.fontChip,
    height: sizes.fontChip,
    borderRadius: radius.field,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: { position: 'absolute', top: -6, right: -6 },
});
