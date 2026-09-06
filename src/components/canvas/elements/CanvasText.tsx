/* eslint-disable react-hooks/immutability -- SharedValue do Reanimated é mutável por design */
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { ResolvedText } from '@/utils/templateEngine';

const OUTLINE_OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
] as const;

const VALIGN = { top: 'flex-start', middle: 'center', bottom: 'flex-end' } as const;

interface Props {
  el: ResolvedText;
  scale: number;
  onPress?: (id: string) => void;
  /** PRO: permite arrastar este texto dentro do canvas */
  dragEnabled?: boolean;
  /** limites do canvas em px de canvas, para o texto não sair da arte */
  bounds?: { width: number; height: number };
  onDragEnd?: (id: string, pos: { x: number; y: number }) => void;
}

export function CanvasText({ el, scale, onPress, dragEnabled, bounds, onDragEnd }: Props) {
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const fontSize = el.fontSize * scale;
  const base: TextStyle = {
    fontFamily: el.fontFamily,
    fontSize,
    lineHeight: fontSize * el.lineHeight,
    letterSpacing: el.letterSpacing !== undefined ? el.letterSpacing * scale : undefined,
    textAlign: el.align,
    includeFontPadding: false,
    width: '100%',
  };
  const textProps = {
    numberOfLines: el.maxLines,
    adjustsFontSizeToFit: true,
    minimumFontScale: el.minFontSize / el.fontSize,
    allowFontScaling: false,
  } as const;
  const shadow: TextStyle = el.shadow
    ? { textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 4 * scale }, textShadowRadius: 12 * scale }
    : {};
  const outline = el.outline;

  const body = (
    <View style={styles.stack}>
      {outline
        ? OUTLINE_OFFSETS.map(([dx, dy]) => (
            <Text
              key={`${dx},${dy}`}
              {...textProps}
              style={[base, styles.copy, { color: outline.color, left: dx * outline.width * scale, top: dy * outline.width * scale }]}
            >
              {el.text}
            </Text>
          ))
        : null}
      <Text {...textProps} style={[base, shadow, { color: el.color }]}>
        {el.text}
      </Text>
    </View>
  );

  const box = {
    position: 'absolute' as const,
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    height: el.height * scale,
    justifyContent: VALIGN[el.valign],
    opacity: el.opacity ?? 1,
    transform: el.rotation ? [{ rotate: `${el.rotation}deg` }] : undefined,
  };

  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateX: dragX.value }, { translateY: dragY.value }] }));

  const commitDrag = (translationX: number, translationY: number) => {
    if (!onDragEnd) return;
    const maxX = Math.max(0, (bounds?.width ?? el.width) - el.width);
    const maxY = Math.max(0, (bounds?.height ?? el.height) - el.height);
    const x = Math.min(maxX, Math.max(0, el.x + translationX / scale));
    const y = Math.min(maxY, Math.max(0, el.y + translationY / scale));
    onDragEnd(el.id, { x: Math.round(x), y: Math.round(y) });
  };

  if (dragEnabled && el.draggable) {
    const pan = Gesture.Pan()
      .onUpdate((e) => {
        dragX.value = e.translationX;
        dragY.value = e.translationY;
      })
      .onEnd((e) => {
        runOnJS(commitDrag)(e.translationX, e.translationY);
        dragX.value = 0;
        dragY.value = 0;
      });
    const tap = Gesture.Tap().onEnd(() => {
      if (onPress) runOnJS(onPress)(el.id);
    });
    return (
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View style={[box, dragStyle]} accessibilityRole="adjustable" accessibilityLabel={`Mover ${el.id}`}>
          {body}
        </Animated.View>
      </GestureDetector>
    );
  }

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(el.id)} style={box} accessibilityRole="button" accessibilityLabel={`Editar ${el.id}`}>
        {body}
      </Pressable>
    );
  }
  return (
    <View pointerEvents="none" style={box}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { width: '100%' },
  copy: { position: 'absolute' },
});
