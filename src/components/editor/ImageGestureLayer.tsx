/* eslint-disable react-hooks/immutability -- SharedValue do Reanimated é mutável por design (escrita na UI thread) */
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import Animated, { runOnJS, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { MAX_ZOOM, MIN_ZOOM } from '@/utils/imageTransform';

interface Size {
  width: number;
  height: number;
}

interface Props {
  /** slot da imagem, em px de canvas */
  slot: Size;
  image: Size;
  /** px lógicos por px de canvas (para converter a translação do dedo) */
  canvasScale: number;
  scale: SharedValue<number>;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  /** chamado no fim do gesto, com os valores já limitados */
  onCommit: (t: { scale: number; offsetX: number; offsetY: number }) => void;
  enabled?: boolean;
}

/**
 * Pinça + arraste sobre o slot da foto, na UI thread. O clamp roda em worklet a cada quadro,
 * então a foto nunca deixa área vazia; no fim do gesto o valor final vai para o store.
 */
export function ImageGestureLayer({ slot, image, canvasScale, scale, offsetX, offsetY, onCommit, enabled = true }: Props) {
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const cover = Math.max(slot.width / image.width, slot.height / image.height);

  const clamp = (s: number, x: number, y: number) => {
    'worklet';
    const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));
    const w = image.width * cover * nextScale;
    const h = image.height * cover * nextScale;
    const maxX = Math.max(0, (w - slot.width) / 2);
    const maxY = Math.max(0, (h - slot.height) / 2);
    scale.value = nextScale;
    offsetX.value = Math.min(maxX, Math.max(-maxX, x));
    offsetY.value = Math.min(maxY, Math.max(-maxY, y));
  };

  const commit = () => {
    'worklet';
    runOnJS(onCommit)({ scale: scale.value, offsetX: offsetX.value, offsetY: offsetY.value });
  };

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      clamp(scale.value, startX.value + e.translationX / canvasScale, startY.value + e.translationY / canvasScale);
    })
    .onEnd(commit);

  const pinch = Gesture.Pinch()
    .enabled(enabled)
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      clamp(startScale.value * e.scale, offsetX.value, offsetY.value);
    })
    .onEnd(commit);

  const doubleTap = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(2)
    .onEnd(() => {
      clamp(1, 0, 0);
      commit();
    });

  const gesture = Gesture.Simultaneous(Gesture.Exclusive(doubleTap, pan), pinch);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={StyleSheet.absoluteFill} collapsable={false} />
    </GestureDetector>
  );
}
