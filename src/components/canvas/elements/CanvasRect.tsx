import { View } from 'react-native';
import type { ResolvedRect } from '@/utils/templateEngine';

export function CanvasRect({ el, scale }: { el: ResolvedRect; scale: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: el.x * scale,
        top: el.y * scale,
        width: el.width * scale,
        height: el.height * scale,
        backgroundColor: el.fill,
        borderRadius: el.radius * scale,
        borderWidth: el.border ? el.border.width * scale : 0,
        borderColor: el.border?.color,
        opacity: el.opacity ?? 1,
        transform: el.rotation ? [{ rotate: `${el.rotation}deg` }] : undefined,
      }}
    />
  );
}
