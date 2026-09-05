import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PremiumBadge } from '@/components/PremiumBadge';
import { strings } from '@/i18n/strings';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { StyleChoice } from '@/types/creation';

/** Cores premium do texto (03-ui §2.12). */
export const TEXT_COLORS = ['#FFFFFF', '#000000', '#FFD60A', '#EF4444', '#3B82F6', '#22C55E'] as const;

interface Props {
  style: StyleChoice;
  isPro: boolean;
  onToggleCaps: () => void;
  onPickColor: (color: string) => void;
  onToggleOutline: () => void;
}

export function StyleControls({ style, isPro, onToggleCaps, onPickColor, onToggleOutline }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={onToggleCaps}
          testID="style-caps"
          accessibilityRole="button"
          accessibilityLabel={strings.editor.caps}
          accessibilityState={{ selected: style.caps }}
          style={[styles.square, { backgroundColor: style.caps ? colors.primary : colors.surface2 }]}
        >
          <Text style={[typography.label, { color: style.caps ? colors.onPrimary : colors.text, fontFamily: 'Rubik-Black' }]}>
            {strings.editor.caps}
          </Text>
        </Pressable>

        <Pressable onPress={onToggleOutline} testID="style-outline" accessibilityRole="button" accessibilityLabel={strings.editor.outline} style={styles.square}>
          <Text style={[typography.label, { color: colors.text, fontFamily: 'Rubik-Black' }]}>T</Text>
          {!isPro ? (
            <View style={styles.lock}>
              <PremiumBadge variant="lock" />
            </View>
          ) : null}
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colors}>
          {TEXT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => onPickColor(c)}
              testID={`style-color-${c}`}
              accessibilityRole="button"
              accessibilityLabel={`${strings.editor.color} ${c}`}
              style={[styles.color, { backgroundColor: c }, style.color === c && { borderColor: colors.primary, borderWidth: 3 }]}
            />
          ))}
          {!isPro ? (
            <View style={styles.colorLock}>
              <PremiumBadge variant="lock" />
            </View>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  square: { width: 40, height: 40, borderRadius: radius.field, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  colors: { gap: spacing.sm, alignItems: 'center', paddingRight: spacing.lg },
  color: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  lock: { position: 'absolute', top: -6, right: -6 },
  colorLock: { marginLeft: spacing.xs },
});
