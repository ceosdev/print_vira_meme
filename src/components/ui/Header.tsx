import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, sizes, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

interface Props {
  title?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  large?: boolean;
}

export function Header({ title, onBack, right, large }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.back}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.title}>
        {typeof title === 'string' ? (
          <Text style={[large ? typography.display : typography.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: sizes.header, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  title: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
