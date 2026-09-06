import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { colors } from '@/theme/tokens';
import type { ImageTransform } from '@/types/creation';
import { identityTransform, imageRect } from '@/utils/imageTransform';
import type { ResolvedImage } from '@/utils/templateEngine';

export interface CanvasImageSource {
  uri: string;
  width: number;
  height: number;
}

/** Valores compartilhados dos gestos do editor (px de canvas). */
export interface AnimatedImageTransform {
  scale: SharedValue<number>;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
}

interface Props {
  el: ResolvedImage;
  scale: number;
  image?: CanvasImageSource | null;
  transform: ImageTransform;
  onLoad?: () => void;
  onError?: () => void;
  overlay?: ReactNode;
  /** quando presente, a foto segue os gestos em tempo real (só no editor) */
  animated?: AnimatedImageTransform;
  testID?: string;
}

const BLUR_RADIUS = 20;

export function CanvasImage({ el, scale, image, transform, onLoad, onError, overlay, animated, testID }: Props) {
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
    transform: el.rotation ? [{ rotate: `${el.rotation}deg` }] : undefined,
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
      {animated && transform.fit === 'cover' ? (
        <AnimatedImage el={el} scale={scale} image={image} animated={animated} onLoad={onLoad} onError={onError} testID={testID} />
      ) : (
        <Image
          source={{ uri: image.uri }}
          style={rectStyle(main)}
          contentFit="fill"
          cachePolicy="memory-disk"
          onLoad={onLoad}
          onError={onError}
          testID={testID ? `${testID}-main` : undefined}
        />
      )}
      {overlay}
    </View>
  );
}

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

/** Foto acompanhando os gestos na UI thread: o mesmo cálculo de imageRect, em worklet. */
function AnimatedImage({
  el,
  scale,
  image,
  animated,
  onLoad,
  onError,
  testID,
}: {
  el: ResolvedImage;
  scale: number;
  image: CanvasImageSource;
  animated: AnimatedImageTransform;
  onLoad?: () => void;
  onError?: () => void;
  testID?: string;
}) {
  const cover = Math.max(el.width / image.width, el.height / image.height);
  const style = useAnimatedStyle(() => {
    const s = cover * animated.scale.value;
    const w = image.width * s;
    const h = image.height * s;
    return {
      position: 'absolute',
      left: ((el.width - w) / 2 + animated.offsetX.value) * scale,
      top: ((el.height - h) / 2 + animated.offsetY.value) * scale,
      width: w * scale,
      height: h * scale,
    };
  });
  return (
    <AnimatedExpoImage
      source={{ uri: image.uri }}
      style={style}
      contentFit="fill"
      cachePolicy="memory-disk"
      onLoad={onLoad}
      onError={onError}
      testID={testID ? `${testID}-main` : undefined}
    />
  );
}
