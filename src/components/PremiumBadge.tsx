import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';
import { strings } from '@/i18n/strings';
import { proGradient, radius } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export function PremiumBadge({ variant = 'pro', testID }: { variant?: 'pro' | 'lock'; testID?: string }) {
  if (variant === 'lock') {
    return (
      <LinearGradient testID={testID} colors={[...proGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.lock}>
        <Lock size={12} color="#FFFFFF" />
      </LinearGradient>
    );
  }
  return (
    <LinearGradient testID={testID} colors={[...proGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill}>
      <Text style={[typography.caption, styles.text]}>{strings.templates.proBadge}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pill: { height: 20, paddingHorizontal: 8, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  lock: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontFamily: 'Rubik-Black', letterSpacing: 0.5 },
});
