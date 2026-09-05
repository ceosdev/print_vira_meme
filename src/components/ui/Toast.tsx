import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/** Monte uma vez no layout raiz, acima do Stack. */
export function ToastHost() {
  const message = useToastStore((s) => s.message);
  const icon = useToastStore((s) => s.icon);
  if (!message) return null;
  return (
    <View pointerEvents="none" style={styles.host}>
      <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutDown.duration(200)} style={styles.toast}>
        {icon === 'success' ? <Check size={18} color={colors.success} /> : null}
        <Text style={[typography.label, { color: colors.text }]}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});
