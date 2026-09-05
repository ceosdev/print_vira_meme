import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
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
}

export function CanvasText({ el, scale, onPress }: Props) {
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
