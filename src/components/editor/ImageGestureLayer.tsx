/* eslint-disable react-hooks/immutability -- SharedValue do Reanimated é mutável por design (escrita na UI thread) */
import type { RefObject } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
  /** ref do ScrollView da tela: o gesto da foto tem prioridade sobre a rolagem */
  scrollRef?: RefObject<React.ComponentType<object> | null | undefined>;
}

/**
 * Pinça + arraste sobre o slot da foto, na UI thread. O clamp roda em worklet a cada quadro,
 * então a foto nunca deixa área vazia; no fim do gesto o valor final vai para o store.
 *
 * Todos os callbacks são inline e marcados com 'worklet': o Gesture Handler exige que o
 * conjunto seja homogêneo (passar uma referência de função quebra isso).
 */
export function ImageGestureLayer({
  slot,
  image,
  canvasScale,
  scale,
  offsetX,
  offsetY,
  onCommit,
  enabled = true,
  scrollRef,
}: Props) {
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const cover = Math.max(slot.width / image.width, slot.height / image.height);
  const slotWidth = slot.width;
  const slotHeight = slot.height;
  const imageWidth = image.width;
  const imageHeight = image.height;

  const apply = (s: number, x: number, y: number) => {
    'worklet';
    const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));
    const w = imageWidth * cover * nextScale;
    const h = imageHeight * cover * nextScale;
    const maxX = Math.max(0, (w - slotWidth) / 2);
    const maxY = Math.max(0, (h - slotHeight) / 2);
    scale.value = nextScale;
    offsetX.value = Math.min(maxX, Math.max(-maxX, x));
    offsetY.value = Math.min(maxY, Math.max(-maxY, y));
  };

  let pan = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      'worklet';
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      'worklet';
      apply(scale.value, startX.value + e.translationX / canvasScale, startY.value + e.translationY / canvasScale);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(onCommit)({ scale: scale.value, offsetX: offsetX.value, offsetY: offsetY.value });
    });

  let pinch = Gesture.Pinch()
    .enabled(enabled)
    .onStart(() => {
      'worklet';
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      'worklet';
      apply(startScale.value * e.scale, offsetX.value, offsetY.value);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(onCommit)({ scale: scale.value, offsetX: offsetX.value, offsetY: offsetY.value });
    });

  const doubleTap = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      apply(1, 0, 0);
      runOnJS(onCommit)({ scale: 1, offsetX: 0, offsetY: 0 });
    });

  if (scrollRef) {
    // Sem isto o ScrollView da tela vence o arraste vertical e a foto nunca se move.
    pan = pan.blocksExternalGesture(scrollRef);
    pinch = pinch.blocksExternalGesture(scrollRef);
  }

  const gesture = Gesture.Simultaneous(Gesture.Exclusive(doubleTap, pan), pinch);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={StyleSheet.absoluteFill} collapsable={false} />
    </GestureDetector>
  );
}
