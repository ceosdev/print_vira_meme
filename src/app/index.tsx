import { Text, View } from 'react-native';
import { catalog } from '@/content';
import { strings } from '@/i18n/strings';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export default function HomeScreen() {
  const [a, b, c] = strings.app.wordmark;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.lg }}>
      <Text style={typography.h1} accessibilityLabel={strings.app.name}>
        <Text style={{ color: colors.text }}>{a} </Text>
        <Text style={{ color: colors.primary }}>{b} </Text>
        <Text style={{ color: colors.text }}>{c}</Text>
      </Text>
      <Text style={[typography.label, { color: colors.textMuted, marginTop: spacing.md }]}>
        {`${catalog.layouts.length} layouts · ${catalog.presets.length} templates · ${catalog.phrases.length} frases`}
      </Text>
    </View>
  );
}
