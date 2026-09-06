import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { MemeCanvas, fitScale } from '@/components/canvas/MemeCanvas';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { catalog } from '@/content';
import { SAMPLE_IMAGE } from '@/theme/sampleImage';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import { identityTransform } from '@/utils/imageTransform';
import { defaultValues, imageElementOf, resolveLayout } from '@/utils/templateEngine';

/** Rota de QA (__DEV__): todos os layouts com o primeiro preset de cada um e a foto-exemplo. */
function DevCanvasContent() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = fitScale(width - spacing.lg * 2);
  const items = useMemo(
    () =>
      catalog.layouts.map((layout) => {
        const preset = catalog.presets.find((p) => p.layoutId === layout.id);
        const values = preset ? defaultValues(preset, layout) : {};
        return {
          layout,
          preset,
          resolved: resolveLayout({ layout, values, style: { caps: false }, showBrand: true }),
          transform: identityTransform(imageElementOf(layout).defaultFit),
        };
      }),
    [],
  );
  return (
    <Screen>
      <Header title="QA dos layouts" onBack={() => router.back()} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.layout.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xxl }}
        renderItem={({ item }) => (
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.label, { color: colors.textMuted }]}>
              {item.layout.name} · {item.preset?.name ?? '—'} · {item.layout.premium ? 'PRO' : 'Free'}
            </Text>
            <MemeCanvas resolved={item.resolved} image={SAMPLE_IMAGE} imageTransform={item.transform} scale={scale} />
          </View>
        )}
      />
    </Screen>
  );
}

/** Fora de __DEV__ a rota não existe para o usuário: manda de volta para a Home. */
export default function DevCanvasScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevCanvasContent />;
}
