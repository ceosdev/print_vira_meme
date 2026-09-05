import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { usePaywallStore } from '@/store/paywallStore';
import { useProLiteStore } from '@/store/proLiteStore';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

/** Convite curto ao PRO (3º compartilhamento e a cada 5 anúncios). Montado no layout raiz. */
export function ProLiteSheet() {
  const router = useRouter();
  const trigger = useProLiteStore((s) => s.trigger);
  const hide = useProLiteStore((s) => s.hide);

  const message = trigger === 'ad_close' ? strings.proLite.adClose : strings.proLite.shareMilestone;

  return (
    <Sheet open={trigger !== null} onClose={hide}>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{message}</Text>
      <View style={styles.row}>
        <Button label={strings.proLite.notNow} variant="ghost" onPress={hide} style={styles.button} testID="prolite-later" />
        <Button
          label={strings.proLite.seePro}
          variant="pro"
          style={styles.button}
          testID="prolite-see"
          onPress={() => {
            const t = trigger ?? 'share_milestone';
            hide();
            usePaywallStore.getState().open(t);
            services.analytics.track({ name: 'paywall_shown', trigger: t });
            router.push('/pro');
          }}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  button: { flex: 1 },
});
