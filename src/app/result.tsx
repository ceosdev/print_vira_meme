import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Download, RefreshCw, Share2 } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useAdGate } from '@/hooks/useAdGate';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useExport } from '@/hooks/useExport';
import { usePaywall } from '@/hooks/usePaywall';
import { useShareFlow } from '@/hooks/useShareFlow';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useCreationStore } from '@/store/creationStore';
import { useUiIntentStore } from '@/store/uiIntentStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export default function ResultScreen() {
  const router = useRouter();
  const window = useWindowDimensions();
  const { isPro } = useEntitlements();
  const { run } = useExport();
  const { share, save, saved, busy } = useShareFlow();
  const { runGuarded } = useAdGate();
  const paywall = usePaywall();

  const lastExport = useCreationStore((s) => s.lastExport);
  const hasCreation = useCreationStore((s) => Boolean(s.image && s.presetId));

  // O arquivo pode ter sumido do cache (ou a criação mudou): re-exporta em silêncio.
  useEffect(() => {
    if (lastExport) return;
    if (!hasCreation) {
      router.replace('/');
      return;
    }
    void run().then((result) => {
      if (!result) router.replace('/');
    });
  }, [hasCreation, lastExport, router, run]);

  const onAnotherTemplate = useCallback(() => {
    services.analytics.track({ name: 'remake_same_photo' });
    router.replace('/templates');
  }, [router]);

  const onCreateAnother = useCallback(() => {
    void runGuarded(() => {
      useCreationStore.getState().reset();
      useUiIntentStore.getState().requestPhoto();
      router.replace('/');
    });
  }, [router, runGuarded]);

  const onRemoveWatermark = useCallback(() => {
    paywall.require('remove_watermark', () => void run());
  }, [paywall, run]);

  if (!lastExport) return <Screen />;

  const maxWidth = window.width - spacing.lg * 2;
  const ratio = lastExport.height / lastExport.width;
  const height = Math.min(maxWidth * ratio, window.height * 0.6);
  const width = height / ratio;

  return (
    <Screen>
      <Header title={strings.result.title} onBack={() => router.back()} large />

      <View style={styles.body}>
        <Image source={{ uri: lastExport.uri }} style={[styles.meme, { width, height }]} contentFit="contain" testID="result-image" />

        {isPro ? (
          <Text style={[typography.caption, { color: colors.success }]}>{strings.result.hd}</Text>
        ) : (
          <Pressable onPress={onRemoveWatermark} hitSlop={12} accessibilityRole="button" testID="remove-watermark">
            <Text style={[typography.label, { color: colors.proSolid }]}>{strings.result.removeWatermark}</Text>
          </Pressable>
        )}

        <View style={styles.actions}>
          <Button label={strings.result.share} icon={Share2} onPress={() => void share()} loading={busy === 'share'} testID="share" />
          <View style={styles.row}>
            <Button
              label={saved ? strings.result.saved : strings.result.save}
              icon={Download}
              variant="secondary"
              onPress={() => void save()}
              loading={busy === 'save'}
              style={styles.half}
              testID="save"
            />
            <Button label={strings.result.anotherTemplate} icon={RefreshCw} variant="secondary" onPress={onAnotherTemplate} style={styles.half} testID="another-template" />
          </View>
          <Button label={strings.result.createAnother} variant="ghost" onPress={onCreateAnother} testID="create-another" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm },
  meme: { borderRadius: radius.canvas, backgroundColor: colors.surface },
  actions: { alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
