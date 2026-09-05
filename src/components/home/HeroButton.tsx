import { Camera } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { strings } from '@/i18n/strings';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function HeroButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strings.home.hero}
      style={({ pressed }) => [styles.card, { backgroundColor: pressed ? colors.primaryPressed : colors.primary }]}
    >
      <View style={styles.icon}>
        <Camera size={32} color={colors.onPrimary} />
      </View>
      <View style={styles.texts}>
        <Text style={[typography.h1, { color: colors.onPrimary }]}>{strings.home.hero}</Text>
        <Text style={[typography.label, { color: colors.onPrimary, opacity: 0.7 }]}>{strings.home.heroSubtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.hero,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 112,
  },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
