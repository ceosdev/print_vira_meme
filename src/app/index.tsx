import { Settings as SettingsIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PhotoSheet } from '@/components/PhotoSheet';
import { ProPill } from '@/components/ProPill';
import { PresetCarousel } from '@/components/home/PresetCarousel';
import { HeroButton } from '@/components/home/HeroButton';
import { ProCard } from '@/components/home/ProCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { catalog } from '@/content';
import { useEntitlements } from '@/hooks/useEntitlements';
import { strings } from '@/i18n/strings';
import { useCreationStore } from '@/store/creationStore';
import { useUiIntentStore } from '@/store/uiIntentStore';
import { colors, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';
import type { CategoryId, Preset } from '@/types/catalog';

export default function HomeScreen() {
  const router = useRouter();
  const { isPro, isUnlocked } = useEntitlements();
  const image = useCreationStore((s) => s.image);
  const [sheetOpen, setSheetOpen] = useState(false);
  // "Criar outro meme" pede o seletor de foto ao voltar para a Home.
  const wantsPhoto = useUiIntentStore((s) => s.wantsPhoto);
  const [pendingRoute, setPendingRoute] = useState<'/templates' | '/editor'>('/templates');

  const popular = useMemo(() => catalog.popularPresets(), []);
  const news = useMemo(() => catalog.newPresets(), []);
  const [wordA, wordB, wordC] = strings.app.wordmark;

  const openPhoto = useCallback((route: '/templates' | '/editor') => {
    setPendingRoute(route);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    useUiIntentStore.getState().clearPhoto();
  }, []);

  const onPicked = useCallback(() => {
    closeSheet();
    router.push(pendingRoute);
  }, [closeSheet, pendingRoute, router]);

  const selectPreset = useCallback(
    (preset: Preset) => {
      useCreationStore.getState().setPreset(preset.id);
      if (image) router.push('/editor');
      else openPhoto('/editor');
    },
    [image, openPhoto, router],
  );

  const openCategory = (id: CategoryId) => router.push({ pathname: '/templates', params: { category: id } });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.title} accessibilityLabel={strings.app.name}>
          <Text style={{ color: colors.text }}>{wordA} </Text>
          <Text style={{ color: colors.primary }}>{wordB} </Text>
          <Text style={{ color: colors.text }}>{wordC}</Text>
        </Text>
        <View style={styles.headerRight}>
          <ProPill isPro={isPro} onPress={() => router.push(isPro ? '/settings' : '/pro')} />
          <Pressable onPress={() => router.push('/settings')} hitSlop={10} accessibilityRole="button" accessibilityLabel={strings.settings.title}>
            <SettingsIcon size={24} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.padded}>
          <HeroButton onPress={() => openPhoto('/templates')} />
        </View>

        {__DEV__ ? (
          <View style={[styles.padded, styles.devRow]}>
            <Pressable onPress={() => router.push('/dev-canvas')} accessibilityRole="button" testID="dev-canvas">
              <Text style={[typography.label, styles.devLink]}>QA dos layouts →</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/dev-doctor')} accessibilityRole="button" testID="dev-doctor">
              <Text style={[typography.label, styles.devLink]}>🩺 Diagnóstico →</Text>
            </Pressable>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {catalog.categories.map((c) => (
            <Chip key={c.id} label={c.name} emoji={c.emoji} onPress={() => openCategory(c.id)} testID={`chip-${c.id}`} />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <SectionHeader title={strings.home.popular} onSeeAll={() => router.push({ pathname: '/templates', params: { filter: 'popular' } })} />
          <PresetCarousel presets={popular} image={image ? { uri: image.thumbUri, width: image.width, height: image.height } : null} onSelect={selectPreset} isLocked={(p) => !isUnlocked(p)} />
        </View>

        {news.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={strings.home.news} onSeeAll={() => router.push({ pathname: '/templates', params: { filter: 'new' } })} />
            <PresetCarousel presets={news.slice(0, 12)} image={image ? { uri: image.thumbUri, width: image.width, height: image.height } : null} onSelect={selectPreset} isLocked={(p) => !isUnlocked(p)} />
          </View>
        ) : null}

        {!isPro ? (
          <View style={styles.padded}>
            <ProCard onPress={() => router.push('/pro')} />
          </View>
        ) : null}

      </ScrollView>

      <PhotoSheet open={sheetOpen || wantsPhoto} onClose={closeSheet} onPicked={onPicked} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.xxl },
  padded: { paddingHorizontal: spacing.lg },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  section: { gap: spacing.md },
  devLink: { color: colors.primary },
  devRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
