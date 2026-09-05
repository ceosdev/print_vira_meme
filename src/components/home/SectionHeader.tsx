import { Pressable, StyleSheet, Text, View } from 'react-native';
import { strings } from '@/i18n/strings';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={[typography.h2, { color: colors.text }]}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={12} accessibilityRole="button">
          <Text style={[typography.label, { color: colors.textMuted }]}>{strings.home.seeAll}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
});
