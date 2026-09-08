/**
 * @jest-environment node
 *
 * Guarda os assets de marca gerados por `npm run assets:brand` a partir de assets/brand/*.svg.
 * Pega dois estragos comuns: alguém devolver os placeholders do template Expo (dimensões e cor
 * batem sozinhas com o gerador quebrado, mas o pixel de canto não) e o gerador mudar de enquadramento.
 */
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');

type Png = { width: number; height: number; bitDepth: number; colorType: number; topLeft: number[] };

/** Lê o IHDR e o primeiro pixel de um PNG RGBA de 8 bits, sem dependência externa. */
function readPng(relPath: string): Png {
  const buf = readFileSync(join(ROOT, relPath));
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];

  const idat: Buffer[] = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len));
    if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  // No primeiro pixel da primeira linha todos os filtros do PNG são identidade (a=b=c=0),
  // então o byte cru é o próprio valor — não precisa desfazer o filtro.
  const topLeft = [raw[1], raw[2], raw[3], raw[4]];

  return { width, height, bitDepth, colorType, topLeft };
}

const YELLOW = [0xff, 0xd6, 0x0a, 0xff];
const TRANSPARENT_ALPHA = 0;

describe('assets de marca', () => {
  it.each([
    ['assets/icon.png', 1024, 1024],
    ['assets/android-icon-foreground.png', 512, 512],
    ['assets/android-icon-background.png', 512, 512],
    ['assets/android-icon-monochrome.png', 432, 432],
    ['assets/favicon.png', 48, 48],
    ['assets/splash-icon.png', 1024, 640],
  ])('%s tem %i×%i px, RGBA de 8 bits', (path, width, height) => {
    const png = readPng(path as string);
    expect({ width: png.width, height: png.height }).toEqual({ width, height });
    expect({ bitDepth: png.bitDepth, colorType: png.colorType }).toEqual({ bitDepth: 8, colorType: 6 });
  });

  it.each(['assets/icon.png', 'assets/android-icon-background.png', 'assets/favicon.png'])(
    '%s começa no amarelo da marca (#FFD60A opaco)',
    (path) => {
      expect(readPng(path).topLeft).toEqual(YELLOW);
    },
  );

  it.each(['assets/android-icon-monochrome.png', 'assets/splash-icon.png'])(
    '%s tem fundo transparente',
    (path) => {
      expect(readPng(path).topLeft[3]).toBe(TRANSPARENT_ALPHA);
    },
  );
});
