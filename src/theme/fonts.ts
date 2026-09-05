// Fonte de verdade da lista de fontes; app.config.ts repete a lista inline (validado por src/__tests__/appConfig.test.ts).
import { FONTS, FONT_FACES, type FontFace } from '../types/catalog';

/** Caminhos relativos à raiz do projeto, para o plugin do expo-font. */
export const FONT_FILES: string[] = FONT_FACES.map((face) => `./assets/fonts/${FONTS[face].family}.ttf`);

/** Nome de família registrado no Android (= nome do arquivo sem extensão). */
export function fontFamilyFor(face: FontFace): string {
  return FONTS[face].family;
}

export const BRAND_FOOTER_FONT = FONTS.bebas.family;
export const BRAND_PILL_FONT = FONTS['rubik-bold'].family;
