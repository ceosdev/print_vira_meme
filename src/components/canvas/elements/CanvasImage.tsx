import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/tokens';
import type { ImageTransform } from '@/types/creation';
import { identityTransform, imageRect } from '@/utils/imageTransform';
import type { ResolvedImage } from '@/utils/templateEngine';

export interface CanvasImageSource {
  uri: string;
  width: number;
  height: number;
}

interface Props {
  el: ResolvedImage;
  scale: number;
  image?: CanvasImageSource | null;
  transform: ImageTransform;
  onLoad?: () => void;
  onError?: () => void;
  overlay?: ReactNode;
  testID?: string;
}

const BLUR_RADIUS = 20;

export function CanvasImage({ el, scale, image, transform, onLoad, onError, overlay, testID }: Props) {
  const slot = { width: el.width, height: el.height };
  const box = {
    position: 'absolute' as const,
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    height: el.height * scale,
    borderRadius: el.radius * scale,
    overflow: 'hidden' as const,
    opacity: el.opacity ?? 1,
  };

  if (!image) {
    return (
      <View style={[box, { backgroundColor: colors.surface2 }]} testID={testID ? `${testID}-placeholder` : undefined}>
        {overlay}
      </View>
    );
  }

  const main = imageRect(image, slot, transform);
  const rectStyle = (r: { left: number; top: number; width: number; height: number }) => ({
    position: 'absolute' as const,
    left: r.left * scale,
    top: r.top * scale,
    width: r.width * scale,
    height: r.height * scale,
  });

  return (
    <View style={[box, { backgroundColor: '#000000' }]} testID={testID}>
      {transform.fit === 'contain-blur' ? (
        <>
          <Image
            source={{ uri: image.uri }}
            style={rectStyle(imageRect(image, slot, identityTransform('cover')))}
            contentFit="fill"
            blurRadius={BLUR_RADIUS}
            cachePolicy="memory-disk"
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        </>
      ) : null}
      <Image
        source={{ uri: image.uri }}
        style={rectStyle(main)}
        contentFit="fill"
        cachePolicy="memory-disk"
        onLoad={onLoad}
        onError={onError}
        testID={testID ? `${testID}-main` : undefined}
      />
      {overlay}
    </View>
  );
}
