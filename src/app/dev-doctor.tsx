import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Font from 'expo-font';
import { Redirect, useRouter } from 'expo-router';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { PixelRatio, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { PhotoSheet } from '@/components/PhotoSheet';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { catalog } from '@/content';
import { services } from '@/services';
import { canForceEntitlements, forceEntitlements } from '@/services/devEntitlements';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlements } from '@/hooks/useEntitlements';
import { EXPORTS_DIR } from '@/services/exportService';
import { IMAGES_DIR } from '@/services/imageService';
import { FONTS, FONT_FACES } from '@/types/catalog';
import type { ImportedImage } from '@/types/creation';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { identityTransform } from '@/utils/imageTransform';
import { defaultValues } from '@/utils/templateEngine';

interface Step {
  name: string;
  ok: boolean;
  detail: string;
}

const describe = (e: unknown): string => {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  if (typeof e === 'object' && e !== null) {
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  return String(e);
};

/**
 * Diagnóstico de ambiente (__DEV__): roda cada passo nativo do fluxo em ordem e mostra o erro
 * cru de cada um. Serve para descobrir onde o aparelho difere dos testes.
 */
function DevDoctorContent() {
  const router = useRouter();
  const { isPro } = useEntitlements();
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetLog, setSheetLog] = useState('sheet nunca aberta');

  const push = (step: Step) => setSteps((prev) => [...prev, step]);

  const run = async (name: string, fn: () => Promise<string>) => {
    try {
      const detail = await fn();
      push({ name, ok: true, detail });
      return true;
    } catch (e) {
      push({ name, ok: false, detail: describe(e) });
      return false;
    }
  };

  const runAll = async () => {
    setSteps([]);
    setRunning(true);
    let image: ImportedImage | null = null;

    await run('1. Ambiente', async () => {
      return [
        `execution=${Constants.executionEnvironment}`,
        `android=${Platform.Version}`,
        `pixelRatio=${PixelRatio.get()}`,
        `appOwnership=${String(Constants.appOwnership)}`,
      ].join(' · ');
    });

    await run('2. Fontes carregadas', async () => {
      const missing = FONT_FACES.filter((f) => !Font.isLoaded(FONTS[f].family));
      if (missing.length) throw new Error(`faltando: ${missing.map((m) => FONTS[m].family).join(', ')}`);
      return `${FONT_FACES.length} fontes OK`;
    });

    await run('3. Sistema de arquivos', async () => {
      if (!FileSystem.cacheDirectory) throw new Error('cacheDirectory é null');
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true }).catch(() => {});
      await FileSystem.makeDirectoryAsync(EXPORTS_DIR, { intermediates: true }).catch(() => {});
      const probe = `${IMAGES_DIR}probe.txt`;
      await FileSystem.writeAsStringAsync(probe, 'ok');
      const info = await FileSystem.getInfoAsync(probe);
      await FileSystem.deleteAsync(probe, { idempotent: true });
      return `cache=${FileSystem.cacheDirectory} · escrita=${info.exists ? 'ok' : 'falhou'}`;
    });

    let assetUri: string | null = null;
    let assetSize = { width: 0, height: 0 };

    // Passos 4-6 chamam as APIs nativas cruas: o erro real aparece, sem a mensagem genérica do serviço.
    const picked = await run('4. Picker (launchImageLibraryAsync)', async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsMultipleSelection: false,
        exif: false,
      });
      if (result.canceled) throw new Error('cancelado pelo usuário');
      const asset = result.assets[0];
      if (!asset) throw new Error('sem asset no resultado');
      assetUri = asset.uri;
      assetSize = { width: asset.width, height: asset.height };
      return `${asset.width}×${asset.height} · ${asset.uri.slice(0, 60)}`;
    });

    let savedUri: string | null = null;
    if (picked && assetUri) {
      await run('5. Manipulator (resize + save)', async () => {
        const ctx = ImageManipulator.manipulate(assetUri!);
        const longest = Math.max(assetSize.width, assetSize.height);
        if (longest > 1600) {
          ctx.resize(assetSize.width >= assetSize.height ? { width: 1600 } : { height: 1600 });
        }
        const ref = await ctx.renderAsync();
        try {
          const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
          savedUri = out.uri;
          return `${out.width}×${out.height} · ${out.uri.slice(0, 60)}`;
        } finally {
          ref.release();
        }
      });

      if (savedUri) {
        await run('6. Mover para o cache do app', async () => {
          const dest = `${IMAGES_DIR}doctor-${Date.now()}.jpg`;
          await FileSystem.moveAsync({ from: savedUri!, to: dest });
          const info = await FileSystem.getInfoAsync(dest);
          if (!info.exists) throw new Error('arquivo não existe no destino');
          return `${'size' in info ? Math.round(info.size / 1024) : '?'}KB · ${dest.slice(-40)}`;
        });
      }

      await run('7. Serviço de imagem completo (pick)', async () => {
        const result = await services.image.pick('gallery');
        if (result.status !== 'ok') throw new Error(`status=${result.status}`);
        image = result.image;
        return `${result.image.width}×${result.image.height}`;
      });

      if (image) {
        await run('8. Exportar meme (captureRef)', async () => {
          const layout = catalog.layoutById.get('classic');
          const preset = catalog.presets.find((p) => p.layoutId === 'classic');
          if (!layout || !preset) throw new Error('catálogo sem layout classic');
          const started = Date.now();
          const result = await services.export.exportMeme({
            layout,
            values: defaultValues(preset, layout),
            positions: {},
            extraTexts: [],
            image: image!,
            imageTransform: identityTransform('cover'),
            style: { caps: false },
            showBrand: true,
            quality: 'standard',
          });
          const info = await FileSystem.getInfoAsync(result.uri);
          if (!info.exists) throw new Error('arquivo exportado não existe');
          const size = 'size' in info ? info.size : 0;
          if (size < 1000) throw new Error(`arquivo muito pequeno (${size}B) — captura vazia`);
          return `${result.width}×${result.height} · ${Math.round(size / 1024)}KB · ${Date.now() - started}ms`;
        });
      }
    }

    await run('9. Compartilhamento disponível', async () => {
      const available = await Sharing.isAvailableAsync();
      if (!available) throw new Error('Sharing.isAvailableAsync = false');
      return 'ok';
    });

    await run('10. Permissão de galeria (escrita)', async () => {
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      return `granted=${perm.granted} · status=${perm.status}`;
    });

    setRunning(false);
  };

  const log = steps.map((s) => `${s.ok ? 'OK ' : 'ERRO '} ${s.name}: ${s.detail}`).join('\n');

  return (
    <Screen>
      <Header title="Diagnóstico" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Button label={running ? 'Rodando…' : 'Rodar diagnóstico'} loading={running} onPress={() => void runAll()} testID="run-doctor" />
        {canForceEntitlements() ? (
          <View style={styles.step}>
            <Text style={[typography.label, { color: colors.text }]}>Entitlement · PRO {isPro ? 'ligado' : 'desligado'}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Vira o PRO na mão para testar sem passar pelo paywall. Mexe nos dois lados (loja e store); só existe
              enquanto a compra for o mock.
            </Text>
            <Button
              label={isPro ? 'Voltar para free' : 'Virar PRO'}
              variant="secondary"
              testID="toggle-pro"
              onPress={() => forceEntitlements({ isPro: !isPro, packIds: [] })}
            />
          </View>
        ) : null}
        <Button
          label="Teste: abrir sheet de foto"
          variant="secondary"
          testID="open-sheet"
          onPress={() => {
            setSheetLog('sheet aberta (open=true) — ela apareceu na tela?');
            setSheetOpen(true);
          }}
        />
        <View style={styles.step}>
          <Text style={[typography.label, { color: colors.text }]}>Sheet de foto</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]} selectable>
            {sheetLog}
          </Text>
        </View>
        {steps.map((step) => (
          <View key={step.name} style={styles.step}>
            <Text style={[typography.label, { color: step.ok ? colors.success : colors.danger }]}>
              {step.ok ? '✓' : '✕'} {step.name}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]} selectable>
              {step.detail}
            </Text>
          </View>
        ))}
        {steps.length > 0 && !running ? (
          <Button label="Compartilhar log" variant="secondary" onPress={() => void Share.share({ message: log })} />
        ) : null}
      </ScrollView>

      <PhotoSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSheetLog((prev) => `${prev} · fechada sem foto`);
        }}
        onPicked={() => {
          setSheetOpen(false);
          const picked = useCreationStore.getState().image;
          setSheetLog(picked ? `foto escolhida: ${picked.width}×${picked.height}` : 'onPicked sem imagem no store (!)');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  step: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, gap: 4 },
});

/** Fora de __DEV__ a rota não existe para o usuário: manda de volta para a Home. */
export default function DevDoctorScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevDoctorContent />;
}
