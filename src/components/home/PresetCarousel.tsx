import { FlatList } from 'react-native';
import { TemplateCard } from '@/components/TemplateCard';
import type { CanvasImageSource } from '@/components/canvas/MemeCanvas';
import { sizes, spacing } from '@/theme/tokens';
import type { Preset } from '@/types/catalog';

interface Props {
  presets: Preset[];
  image?: CanvasImageSource | null;
  onSelect: (preset: Preset) => void;
  isLocked?: (preset: Preset) => boolean;
}

export function PresetCarousel({ presets, image, onSelect, isLocked }: Props) {
  return (
    <FlatList
      horizontal
      data={presets}
      keyExtractor={(p) => p.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      renderItem={({ item }) => (
        <TemplateCard
          preset={item}
          image={image}
          width={sizes.cardCarouselWidth}
          onPress={onSelect}
          locked={isLocked ? isLocked(item) : item.premium}
        />
      )}
    />
  );
}
