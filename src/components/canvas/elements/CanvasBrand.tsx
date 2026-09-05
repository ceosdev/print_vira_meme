import { StyleSheet, Text, View } from 'react-native';
import { strings } from '@/i18n/strings';
import { BRAND_FOOTER_FONT, BRAND_PILL_FONT } from '@/theme/fonts';
import type { ResolvedBrand } from '@/utils/templateEngine';

/** Tamanhos em px de canvas (03-ui §4.6): texto ≥ 30 px para ler numa miniatura de 360 px. */
const FOOTER = { text: 36, square: 20, paddingLeft: 40, gap: 16, tracking: 0.08 } as const;
const PILL = { text: 30, padV: 10, padH: 18 } as const;

export function CanvasBrand({ el, scale }: { el: ResolvedBrand; scale: number }) {
  const box = { position: 'absolute' as const, left: el.x * scale, top: el.y * scale, width: el.width * scale, height: el.height * scale };

  if (el.variant === 'footer') {
    return (
      <View pointerEvents="none" style={[box, styles.footer, { paddingLeft: FOOTER.paddingLeft * scale, gap: FOOTER.gap * scale }]}>
        <View style={{ width: FOOTER.square * scale, height: FOOTER.square * scale, backgroundColor: '#FFD60A' }} />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: BRAND_FOOTER_FONT,
            fontSize: FOOTER.text * scale,
            letterSpacing: FOOTER.text * FOOTER.tracking * scale,
            color: '#FFFFFF',
            includeFontPadding: false,
          }}
        >
          {strings.brand.footer}
        </Text>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[box, styles.pillBox]}>
      <View style={[styles.pill, { paddingVertical: PILL.padV * scale, paddingHorizontal: PILL.padH * scale }]}>
        <Text allowFontScaling={false} style={{ fontFamily: BRAND_PILL_FONT, fontSize: PILL.text * scale, color: '#FFFFFF', includeFontPadding: false }}>
          {strings.brand.pill}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: '#111111', flexDirection: 'row', alignItems: 'center' },
  pillBox: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  pill: { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 999 },
});
