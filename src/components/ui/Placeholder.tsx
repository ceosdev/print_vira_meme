import { Text, View } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function Placeholder({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.lg }}>
      <Text style={[typography.h2, { color: colors.text }]}>{title}</Text>
      <Text style={[typography.label, { color: colors.textMuted, marginTop: spacing.sm }]}>em construção (Plano 1b)</Text>
    </View>
  );
}
