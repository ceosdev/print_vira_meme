import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { strings } from '@/i18n/strings';
import { colors, proGradient, radius } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function ProPill({ isPro, onPress }: { isPro: boolean; onPress: () => void }) {
  if (isPro) {
    return (
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" style={styles.active}>
        <Text style={[typography.caption, { color: colors.proSolid, fontFamily: 'Rubik-Black' }]}>{strings.home.proPillActive}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={strings.home.proPill}>
      <LinearGradient colors={[...proGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill}>
        <Text style={[typography.caption, { color: '#FFFFFF', fontFamily: 'Rubik-Black' }]}>{strings.home.proPill}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { height: 28, paddingHorizontal: 12, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  active: { height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
});
