import { forwardRef, type ReactNode } from 'react';
import { View } from 'react-native';
import type { ImageTransform } from '@/types/creation';
import type { ResolvedLayout } from '@/utils/templateEngine';
import { CanvasBrand } from './elements/CanvasBrand';
import { CanvasImage, type AnimatedImageTransform, type CanvasImageSource } from './elements/CanvasImage';
import { CanvasRect } from './elements/CanvasRect';
import { CanvasText } from './elements/CanvasText';

export { RENDER_SCALE, fitScale } from './canvasScale';
export type { AnimatedImageTransform, CanvasImageSource };

export interface MemeCanvasProps {
  resolved: ResolvedLayout;
  image?: CanvasImageSource | null;
  imageTransform: ImageTransform;
  scale: number;
  onImageLoad?: () => void;
  onImageError?: () => void;
  onTextPress?: (elementId: string) => void;
  /** conteúdo sobreposto ao slot de imagem (camada de gestos do editor) */
  imageOverlay?: ReactNode;
  /** valores compartilhados dos gestos (editor) */
  imageAnimated?: AnimatedImageTransform;
  testID?: string;
}

/**
 * Desenha um layout resolvido. Puro: nada de store aqui. O mesmo componente serve card, editor e exportação;
 * só muda `scale`. `ref` aponta para o nó que o view-shot captura.
 */
export const MemeCanvas = forwardRef<View, MemeCanvasProps>(function MemeCanvas(
  { resolved, image, imageTransform, scale, onImageLoad, onImageError, onTextPress, imageOverlay, imageAnimated, testID },
  ref,
) {
  return (
    <View
      ref={ref}
      collapsable={false}
      testID={testID}
      style={{ width: resolved.width * scale, height: resolved.height * scale, backgroundColor: resolved.background, overflow: 'hidden' }}
    >
      {resolved.elements.map((el) => {
        switch (el.kind) {
          case 'image':
            return (
              <CanvasImage
                key={el.id}
                el={el}
                scale={scale}
                image={image}
                transform={imageTransform}
                onLoad={onImageLoad}
                onError={onImageError}
                overlay={imageOverlay}
                animated={imageAnimated}
                testID={testID ? `${testID}-image` : undefined}
              />
            );
          case 'text':
            return <CanvasText key={el.id} el={el} scale={scale} onPress={el.slotIds.length > 0 ? onTextPress : undefined} />;
          case 'rect':
            return <CanvasRect key={el.id} el={el} scale={scale} />;
          case 'brand':
            return <CanvasBrand key={el.id} el={el} scale={scale} />;
        }
      })}
    </View>
  );
});
