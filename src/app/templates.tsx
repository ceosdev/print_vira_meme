import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PhotoSheet } from '@/components/PhotoSheet';
import { TemplateCard } from '@/components/TemplateCard';
import { Chip } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { catalog } from '@/content';
import { useEntitlements } from '@/hooks/useEntitlements';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useCreationStore } from '@/store/creationStore';
import { usePrefsStore } from '@/store/prefsStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { CategoryId, Preset } from '@/types/catalog';

type Filter = 'all' | 'popular' | 'new' | CategoryId;

export default function TemplatesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; filter?: string }>();
  const { width } = useWindowDimensions();
  const { isUnlocked } = useEntitlements();
  const image = useCreationStore((s) => s.image);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>(() => {
    if (params.filter === 'popular' || params.filter === 'new') return params.filter;
    const cat = catalog.categories.find((c) => c.id === params.category);
    return cat ? cat.id : 'all';
  });

  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

  const presets = useMemo(() => {
    if (filter === 'all') return catalog.presets;
    if (filter === 'popular') return catalog.popularPresets();
    if (filter === 'new') return catalog.newPresets();
    return catalog.presetsForCategory(filter);
  }, [filter]);

  const cardImage = image ? { uri: image.thumbUri, width: image.width, height: image.height } : null;
  const newIds = useMemo(() => new Set(catalog.newPresets().map((p) => p.id)), []);

  const selectPreset = useCallback(
    (preset: Preset) => {
      useCreationStore.getState().setPreset(preset.id);
      services.analytics.track({
        name: 'preset_selected',
        presetId: preset.id,
        layoutId: preset.layoutId,
        category: preset.category,
        premium: preset.premium,
      });
      if (image) router.push('/editor');
      else setSheetOpen(true);
    },
    [image, router],
  );

  const selectFilter = (f: Filter) => {
    setFilter(f);
    if (f !== 'all' && f !== 'popular' && f !== 'new') usePrefsStore.getState().setLastCategory(f);
  };

  return (
    <Screen>
      <Header
        title={strings.templates.title}
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => setSheetOpen(true)} accessibilityRole="button" accessibilityLabel={strings.editor.changePhoto} testID="header-photo">
            {image ? (
              <Image source={{ uri: image.thumbUri }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>+</Text>
              </View>
            )}
          </Pressable>
        }
      />

      <FlatList
        data={presets}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: 'all' as Filter, label: strings.templates.all, emoji: undefined },
              { id: 'popular' as Filter, label: 'Populares', emoji: '🔥' },
              { id: 'new' as Filter, label: 'Novos', emoji: '✨' },
              ...catalog.categories.map((c) => ({ id: c.id as Filter, label: c.name, emoji: c.emoji })),
            ]}
            keyExtractor={(f) => f.id}
            contentContainerStyle={styles.chips}
            renderItem={({ item }) => (
              <Chip label={item.label} emoji={item.emoji} selected={filter === item.id} onPress={() => selectFilter(item.id)} testID={`filter-${item.id}`} />
            )}
          />
        }
        renderItem={({ item }) => (
          <TemplateCard
            preset={item}
            image={cardImage}
            width={cardWidth}
            onPress={selectPreset}
            locked={!isUnlocked(item)}
            isNew={newIds.has(item.id)}
          />
        )}
      />

      <PhotoSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onPicked={() => { setSheetOpen(false); if (useCreationStore.getState().presetId) router.push('/editor'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 36, height: 36, borderRadius: radius.field, borderWidth: 1, borderColor: colors.primary },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderColor: colors.border },
  grid: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  chips: { gap: spacing.sm, paddingBottom: spacing.md },
});

