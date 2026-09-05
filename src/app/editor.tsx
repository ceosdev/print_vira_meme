import { Sparkles, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { PhotoSheet } from '@/components/PhotoSheet';
import { PremiumBadge } from '@/components/PremiumBadge';
import { MemeCanvas } from '@/components/canvas/MemeCanvas';
import { CanvasFrame } from '@/components/editor/CanvasFrame';
import { FontChip } from '@/components/editor/FontChip';
import { ImageGestureLayer } from '@/components/editor/ImageGestureLayer';
import { SlotField } from '@/components/editor/SlotField';
import { StyleControls } from '@/components/editor/StyleControls';
import { TextSheet } from '@/components/editor/TextSheet';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useExport } from '@/hooks/useExport';
import { usePaywall } from '@/hooks/usePaywall';
import { strings } from '@/i18n/strings';
import { selectLayout, selectPreset, useCreationStore } from '@/store/creationStore';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { SELECTABLE_FONTS, type FontFace } from '@/types/catalog';
import { clampTransform, toggleFit } from '@/utils/imageTransform';
import { imageElementOf, resolveLayout } from '@/utils/templateEngine';
import { isFontUnlocked } from '@/utils/paywallRules';

/** Proporção máxima da altura útil ocupada pelo canvas (03-ui §3.4). */
const CANVAS_MAX_HEIGHT = 0.55;

export default function EditorScreen() {
  const router = useRouter();
  const window = useWindowDimensions();
  const { isPro, isUnlocked } = useEntitlements();
  const { run, exporting } = useExport();
  const paywall = usePaywall();

  const image = useCreationStore((s) => s.image);
  const values = useCreationStore((s) => s.values);
  const style = useCreationStore((s) => s.style);
  const transform = useCreationStore((s) => s.imageTransform);
  const positions = useCreationStore((s) => s.positions);
  const extraTexts = useCreationStore((s) => s.extraTexts);
  const layout = useCreationStore(selectLayout);
  const preset = useCreationStore(selectPreset);

  const [photoSheet, setPhotoSheet] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);

  const gScale = useSharedValue(transform.scale);
  const gX = useSharedValue(transform.offsetX);
  const gY = useSharedValue(transform.offsetY);

  useEffect(() => {
    gScale.value = transform.scale;
    gX.value = transform.offsetX;
    gY.value = transform.offsetY;
  }, [transform, gScale, gX, gY]);

  useEffect(() => {
    if (!image || !layout || !preset) router.replace('/');
  }, [image, layout, preset, router]);

  const resolved = useMemo(
    () => (layout ? resolveLayout({ layout, values, style, positions, extraTexts, showBrand: !isPro }) : null),
    [layout, values, style, positions, extraTexts, isPro],
  );

  const canvasWidth = window.width - spacing.lg * 2;
  const scale = resolved ? Math.min(canvasWidth / resolved.width, (window.height * CANVAS_MAX_HEIGHT) / resolved.height) : 0;

  const locked = preset ? !isUnlocked(preset) : false;

  const doExport = useCallback(async () => {
    const result = await run();
    if (result) router.push('/result');
  }, [router, run]);

  const onGenerate = useCallback(() => {
    if (locked && preset) paywall.require('premium_template', () => void doExport(), preset.name);
    else void doExport();
  }, [doExport, locked, paywall, preset]);

  const onFont = useCallback(
    (face: FontFace) => {
      const apply = () => useCreationStore.getState().setStyle({ font: face });
      if (isFontUnlocked(face, isPro)) apply();
      else paywall.require('premium_font', apply);
    },
    [isPro, paywall],
  );

  const onStyle = useCallback(
    (patch: Parameters<ReturnType<typeof useCreationStore.getState>['setStyle']>[0]) => {
      const apply = () => useCreationStore.getState().setStyle(patch);
      if (isPro) apply();
      else paywall.require('premium_style', apply);
    },
    [isPro, paywall],
  );

  if (!layout || !resolved || !image || !preset) return <Screen />;

  const imageEl = imageElementOf(layout);
  const slot = editingSlot ? (layout.slots.find((s) => s.id === editingSlot) ?? null) : null;

  return (
    <Screen edges={['top']}>
      <Header
        title={preset.name}
        onBack={() => router.back()}
        right={locked ? <PremiumBadge /> : undefined}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <CanvasFrame
          width={resolved.width * scale}
          height={resolved.height * scale}
          fit={transform.fit}
          busy={exporting}
          onChangePhoto={() => setPhotoSheet(true)}
          onToggleFit={() => useCreationStore.getState().setImageTransform(toggleFit(transform))}
        >
          <MemeCanvas
            testID="editor-canvas"
            resolved={resolved}
            image={image}
            imageTransform={transform}
            scale={scale}
            onTextPress={(elementId) => {
              const el = resolved.elements.find((e) => e.kind === 'text' && e.id === elementId);
              if (el && el.kind === 'text' && el.slotIds[0]) setEditingSlot(el.slotIds[0]);
            }}
            imageAnimated={{ scale: gScale, offsetX: gX, offsetY: gY }}
            imageOverlay={
              <ImageGestureLayer
                slot={{ width: imageEl.width, height: imageEl.height }}
                image={image}
                canvasScale={scale}
                scale={gScale}
                offsetX={gX}
                offsetY={gY}
                enabled={transform.fit === 'cover'}
                onCommit={(t) =>
                  useCreationStore
                    .getState()
                    .setImageTransform(clampTransform(image, { width: imageEl.width, height: imageEl.height }, { ...t, fit: 'cover' }))
                }
              />
            }
          />
        </CanvasFrame>

        <View style={styles.block}>
          <Text style={[typography.label, styles.sectionLabel]}>{strings.editor.texts}</Text>
          {layout.slots.map((s) => (
            <SlotField key={s.id} slot={s} value={values[s.id] ?? ''} active={editingSlot === s.id} onPress={setEditingSlot} />
          ))}
        </View>

        <View style={styles.block}>
          <Text style={[typography.label, styles.sectionLabel]}>{strings.editor.font}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fonts}>
            {SELECTABLE_FONTS.map((face) => (
              <FontChip
                key={face}
                face={face}
                selected={(style.font ?? null) === face}
                locked={!isFontUnlocked(face, isPro)}
                onPress={onFont}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.block}>
          <Text style={[typography.label, styles.sectionLabel]}>{strings.editor.style}</Text>
          <StyleControls
            style={style}
            isPro={isPro}
            onToggleCaps={() => useCreationStore.getState().setStyle({ caps: !style.caps })}
            onPickColor={(color) => onStyle({ color })}
            onToggleOutline={() => onStyle({ outline: !style.outline })}
          />
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button
          label={locked ? strings.editor.generatePro : strings.editor.generate}
          variant={locked ? 'pro' : 'primary'}
          icon={locked ? Lock : Sparkles}
          loading={exporting}
          onPress={onGenerate}
          testID="generate"
        />
      </View>

      <PhotoSheet open={photoSheet} onClose={() => setPhotoSheet(false)} onPicked={() => setPhotoSheet(false)} />
      <TextSheet open={editingSlot !== null} slot={slot} onClose={() => setEditingSlot(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.xl, paddingBottom: 120 },
  block: { gap: spacing.sm },
  sectionLabel: { color: colors.textMuted },
  fonts: { gap: spacing.sm },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.lg, backgroundColor: colors.bg },
});
