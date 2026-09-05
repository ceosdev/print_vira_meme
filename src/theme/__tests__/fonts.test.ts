/**
 * @jest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';
import { FONTS, FONT_FACES } from '@/types/catalog';
import { FONT_FILES } from '@/theme/fonts';

const fontsDir = path.join(__dirname, '../../../assets/fonts');

describe('fontes embarcadas', () => {
  it.each(FONT_FACES)('%s tem arquivo TrueType em assets/fonts', (face) => {
    const file = path.join(fontsDir, `${FONTS[face].family}.ttf`);
    expect(fs.existsSync(file)).toBe(true);
    const magic = fs.readFileSync(file).subarray(0, 4).toString('hex');
    expect(['00010000', '74727565']).toContain(magic); // 0x00010000 ou 'true'
  });

  it('FONT_FILES cobre todas as faces, sem repetição', () => {
    expect(new Set(FONT_FILES).size).toBe(FONT_FACES.length);
    for (const face of FONT_FACES) expect(FONT_FILES).toContain(`./assets/fonts/${FONTS[face].family}.ttf`);
  });
});
