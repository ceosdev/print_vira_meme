import { View, type DimensionValue } from 'react-native';
import { colors, radius } from '@/theme/tokens';

export function Skeleton({ width, height, round }: { width: DimensionValue; height: number; round?: number }) {
  return <View style={{ width, height, borderRadius: round ?? radius.field, backgroundColor: colors.surface2 }} />;
}
