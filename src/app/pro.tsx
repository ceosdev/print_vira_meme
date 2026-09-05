import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { PRO_SKU } from '@/config/app';
import { useEntitlements } from '@/hooks/useEntitlements';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePaywallStore } from '@/store/paywallStore';
import { useToastStore } from '@/store/toastStore';
import { colors, proGradient, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { paywallContext } from '@/utils/paywallRules';

export default function ProScreen() {
  const router = useRouter();
  const { isPro } = useEntitlements();
  const trigger = usePaywallStore((s) => s.trigger);
  const presetName = usePaywallStore((s) => s.presetName);

  const [price, setPrice] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    services.purchase
      .getProPrice()
      .then((p) => alive && setPrice(p))
      .catch(() => alive && setPrice(null))
      .finally(() => alive && setLoadingPrice(false));
    return () => {
      alive = false;
    };
  }, []);

  const close = useCallback(() => {
    usePaywallStore.getState().clear();
    router.back();
  }, [router]);

  const finish = useCallback(
    (event: 'purchase_completed' | 'purchase_restored', toast: string) => {
      useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
      services.analytics.track({ name: event, sku: PRO_SKU });
      useToastStore.getState().show(toast, 'success');
      const continuation = usePaywallStore.getState().takeContinuation();
      usePaywallStore.getState().clear();
      continuation?.();
      router.back();
    },
    [router],
  );

  const buy = useCallback(async () => {
    setBusy('buy');
    setMessage(null);
    services.analytics.track({ name: 'purchase_started', sku: PRO_SKU });
    const outcome = await services.purchase.purchasePro();
    setBusy(null);
    if (outcome.status === 'purchased') finish('purchase_completed', strings.paywall.success);
    else if (outcome.status === 'offline') setMessage(strings.paywall.offline);
    else if (outcome.status === 'error') setMessage(strings.paywall.error);
  }, [finish]);

  const restore = useCallback(async () => {
    setBusy('restore');
    setMessage(null);
    const outcome = await services.purchase.restore();
    setBusy(null);
    if (outcome.status === 'restored') finish('purchase_restored', strings.paywall.restored);
    else if (outcome.status === 'none') setMessage(strings.paywall.restoreNone);
    else if (outcome.status === 'offline') setMessage(strings.paywall.offline);
    else if (outcome.status === 'error') setMessage(strings.paywall.error);
  }, [finish]);

  const context = trigger ? paywallContext(trigger, presetName) : null;

  return (
    <Screen>
      <LinearGradient colors={['rgba(124,58,237,0.25)', 'transparent']} style={styles.glow} pointerEvents="none" />
      <View style={styles.closeRow}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar" testID="close">
          <X size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {isPro ? <Text style={[typography.bodyMedium, { color: colors.success }]}>{strings.paywall.alreadyPro}</Text> : null}
        {context ? <Text style={[typography.label, styles.context]}>{context}</Text> : null}

        <Text style={[typography.display, styles.title]}>
          {strings.paywall.title} <Text style={{ color: colors.proSolid }}>{strings.paywall.titlePro}</Text>
        </Text>
        <Text style={[typography.h2, styles.tagline]}>{strings.paywall.tagline}</Text>

        <View style={styles.checklist}>
          {strings.paywall.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <LinearGradient colors={[...proGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.check}>
                <Check size={14} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{benefit}</Text>
            </View>
          ))}
        </View>

        {message ? <Text style={[typography.label, { color: colors.danger }]}>{message}</Text> : null}

        {loadingPrice ? (
          <Skeleton width="100%" height={56} round={radius.button} />
        ) : (
          <Button
            label={price ? `${strings.paywall.cta} · ${price}` : strings.paywall.cta}
            sublabel={strings.paywall.ctaOneTime}
            variant="pro"
            loading={busy === 'buy'}
            onPress={() => void buy()}
            testID="buy"
          />
        )}

        <Button label={strings.paywall.restore} variant="ghost" loading={busy === 'restore'} onPress={() => void restore()} testID="restore" />
        <Text style={[typography.caption, styles.legal]}>{strings.paywall.legal}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', left: 0, right: 0, top: 0, height: 320 },
  closeRow: { alignItems: 'flex-end', paddingHorizontal: spacing.lg, height: 40, justifyContent: 'center' },
  body: { paddingHorizontal: spacing.xxxl, paddingBottom: spacing.xxxl, gap: spacing.md, alignItems: 'center' },
  context: { color: colors.textMuted, textAlign: 'center' },
  title: { color: colors.text, textAlign: 'center' },
  tagline: { color: colors.text, textAlign: 'center' },
  checklist: { alignSelf: 'stretch', gap: spacing.sm, marginVertical: spacing.lg },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  legal: { color: colors.textMuted, textAlign: 'center' },
});
