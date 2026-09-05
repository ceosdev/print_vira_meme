import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { strings } from '@/i18n/strings';
import { colors, proGradient, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function ProCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
      <LinearGradient colors={[...proGradient]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.stripe} />
      <Text style={[typography.body, styles.text]}>{strings.home.proCard}</Text>
      <ChevronRight size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  text: { flex: 1, color: colors.text },
});
