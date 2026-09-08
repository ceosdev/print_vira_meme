/**
 * Gera os assets de marca (ícone, adaptive icon, monochrome, favicon, splash).
 *
 *   node tools/make-brand-assets.mjs --variant=a          grava assets/brand/*.svg e os PNGs
 *   node tools/make-brand-assets.mjs --preview --out=DIR  renderiza as 3 variantes para revisão
 *   node tools/make-brand-assets.mjs --report             imprime as margens de tinta medidas
 *
 * Cada variante é descrita por uma estrutura (`card`, `bubbles`, `word`), não por SVG solto: a
 * versão colorida e a silhueta monochrome saem da mesma geometria, sem números duplicados.
 *
 * Duas coisas que o renderizador não resolve sozinho e por isso são feitas na mão aqui:
 * - **contorno do texto**: não se usa paint-order (nem todo renderizador honra); desenha-se o texto
 *   duas vezes, a cópia com stroke por baixo e o preenchimento por cima;
 * - **enquadramento**: a arte é medida pelos pixels opacos e reescalada para a margem pedida, em vez
 *   de posicionada por métrica de fonte — em display faces como a Anton a métrica tem folga demais.
 *
 * Rasterizador: @resvg/resvg-js (binário pré-compilado, carrega os TTFs de assets/fonts).
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const FONT_FILES = ['assets/fonts/Anton-Regular.ttf', 'assets/fonts/Rubik-Black.ttf'].map((p) =>
  join(ROOT, p),
);

const C = {
  yellow: '#FFD60A',
  ink: '#0F0F14',
  white: '#FFFFFF',
  screen: '#1A1A22',
  bubbleLight: '#D8D8E0',
  bubbleDark: '#B4B4C2',
};

const SIZE = 1024; // lado do viewBox de todas as composições de ícone

/** Margem de tinta, em unidades do viewBox de 1024. */
const MARGIN = {
  icon: 74,
  /** Adaptive icon: o Android só garante os 72dp centrais de 108dp (66,7%), e a máscara é redonda. */
  adaptive: 186,
};

// --------------------------------------------------------------------------------------------
// Rasterização e medição

/** Renderiza um SVG. `width` define a largura de saída (a altura sai da proporção do viewBox). */
function render(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Anton' },
  });
  return resvg.render();
}

/** Caixa dos pixels não transparentes de uma imagem já renderizada. */
function inkBounds(image) {
  const { width, height, pixels } = image;
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

const svgDoc = (body, width = SIZE, height = SIZE) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;

const metricsCache = new Map();

/**
 * Caixa de tinta de um texto, normalizada para `font-size: 1` e relativa ao ponto
 * (âncora horizontal, linha de base).
 */
function textMetrics(label, family, weight, letterSpacing) {
  const key = `${label}|${family}|${weight}|${letterSpacing}`;
  const cached = metricsCache.get(key);
  if (cached) return cached;

  const F = 500;
  const box = 4000;
  const probe = `<text x="${box / 2}" y="${box / 2}" font-family="${family}" font-weight="${weight}" font-size="${F}" letter-spacing="${letterSpacing * F}" text-anchor="middle">${label}</text>`;
  const b = inkBounds(render(svgDoc(probe, box, box), box));
  const m = {
    left: (b.x0 - box / 2) / F,
    right: (b.x1 + 1 - box / 2) / F,
    top: (b.y0 - box / 2) / F,
    bottom: (b.y1 + 1 - box / 2) / F,
    width: b.width / F,
    height: b.height / F,
  };
  metricsCache.set(key, m);
  return m;
}

/** `font-size` e linha de base que põem a tinta do texto com a largura pedida, centrada em (cx, cy). */
function fitText(label, { family = 'Anton', weight = 400, letterSpacing = 0, inkWidth, cx, cy }) {
  const m = textMetrics(label, family, weight, letterSpacing);
  const fontSize = inkWidth / m.width;
  return {
    label,
    family,
    weight,
    fontSize,
    letterSpacing: letterSpacing * fontSize,
    x: cx - ((m.left + m.right) / 2) * fontSize,
    y: cy - ((m.top + m.bottom) / 2) * fontSize,
    inkHeight: m.height * fontSize,
  };
}

// --------------------------------------------------------------------------------------------
// Peças de desenho

const rrect = (x, y, w, h, r, attrs) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${attrs}/>`;

const rotate = (deg, cx, cy, body) => (deg ? `<g transform="rotate(${deg} ${cx} ${cy})">${body}</g>` : body);

/** Texto opcionalmente contornado: cópia com stroke por baixo, preenchimento por cima. */
function text(fit, { fill, stroke, strokeWidth = 0 }) {
  const common = `x="${fit.x}" y="${fit.y}" font-family="${fit.family}" font-weight="${fit.weight}" font-size="${fit.fontSize}" letter-spacing="${fit.letterSpacing}" text-anchor="middle"`;
  const outline = strokeWidth
    ? `<text ${common} fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">${fit.label}</text>`
    : '';
  return `${outline}<text ${common} fill="${fill}">${fit.label}</text>`;
}

// --------------------------------------------------------------------------------------------
// As três variantes, descritas como estrutura

const cardCenter = (card) => [card.x + card.w / 2, card.y + card.h / 2];

/** A — Sticker: print inclinado com conversa dentro e o MEME estourando as bordas laterais. */
const A = {
  card: { x: 202, y: 130, w: 620, h: 670, r: 46, rot: -8, shadow: [22, 24] },
  bubbles: [
    { x: 262, y: 206, w: 330, h: 68 },
    { x: 462, y: 296, w: 300, h: 68, dark: true },
    { x: 262, y: 386, w: 252, h: 68 },
  ],
  word: { inkWidth: 830, cx: 512, cy: 636, outline: 34, followsCard: true },
};

/** B — Legenda clássica: print com faixa branca embaixo e o MEME dentro dela, como meme antigo. */
const B = {
  card: { x: 182, y: 150, w: 660, h: 700, r: 46, rot: -8, shadow: [22, 24] },
  screen: { x: 230, y: 198, w: 564, h: 330, r: 22 },
  bubbles: [
    { x: 266, y: 240, w: 296, h: 60 },
    { x: 462, y: 318, w: 296, h: 60, dark: true },
    { x: 266, y: 396, w: 224, h: 60 },
  ],
  word: { inkWidth: 542, cx: 512, cy: 676, outline: 0, followsCard: true },
};

/** C — Só a palavra: o print recua para cima e o MEME toma a largura toda, tipo adesivo. */
const Cv = {
  card: { x: 272, y: 120, w: 480, h: 430, r: 38, rot: -8, shadow: [18, 20] },
  bubbles: [
    { x: 318, y: 178, w: 258, h: 56 },
    { x: 404, y: 252, w: 250, h: 56, dark: true },
    { x: 318, y: 326, w: 192, h: 56 },
  ],
  word: { inkWidth: 900, cx: 512, cy: 620, rot: -4, outline: 36, dropShadow: [14, 16] },
};

const VARIANTS = { a: A, b: B, c: Cv };

/** Onde o texto da variante fica, já com a rotação que ele herda (do card) ou tem própria. */
function wordPlacement(spec) {
  const fit = fitText('MEME', { inkWidth: spec.word.inkWidth, cx: spec.word.cx, cy: spec.word.cy });
  const [ccx, ccy] = cardCenter(spec.card);
  const rot = spec.word.followsCard
    ? { deg: spec.card.rot, cx: ccx, cy: ccy }
    : { deg: spec.word.rot ?? 0, cx: spec.word.cx, cy: spec.word.cy };
  return { fit, rot };
}

/** Composição colorida da variante. */
function paint(spec) {
  const { card } = spec;
  const [ccx, ccy] = cardCenter(card);
  const { fit, rot } = wordPlacement(spec);

  const printCard =
    rrect(card.x + card.shadow[0], card.y + card.shadow[1], card.w, card.h, card.r, `fill="${C.ink}"`) +
    rrect(card.x, card.y, card.w, card.h, card.r, `fill="${C.white}" stroke="${C.ink}" stroke-width="14"`);

  const screen = spec.screen
    ? rrect(spec.screen.x, spec.screen.y, spec.screen.w, spec.screen.h, spec.screen.r, `fill="${C.screen}"`)
    : '';

  const bubbles = spec.bubbles
    .map((b) => rrect(b.x, b.y, b.w, b.h, b.h / 2, `fill="${b.dark ? C.bubbleDark : C.bubbleLight}"`))
    .join('');

  const shadowFit = spec.word.dropShadow
    ? { ...fit, x: fit.x + spec.word.dropShadow[0], y: fit.y + spec.word.dropShadow[1] }
    : null;
  const word =
    (shadowFit ? text(shadowFit, { fill: C.ink, stroke: C.ink, strokeWidth: spec.word.outline }) : '') +
    text(fit, { fill: C.ink, stroke: C.white, strokeWidth: spec.word.outline });

  return rotate(card.rot, ccx, ccy, printCard + screen + bubbles) + rotate(rot.deg, rot.cx, rot.cy, word);
}

/**
 * Silhueta para o monochrome do Android 13: o print sólido com o MEME vazado.
 *
 * O contorno branco do texto entra na máscara como área **cheia** antes do vazado. Sem ele, nas
 * variantes em que a palavra estoura o card (A e C) só sobraria vazado o pedacinho que cai dentro
 * do retângulo — e o enquadramento, que se guia pela tinta, ainda por cima ampliaria o card.
 */
function silhouette(spec) {
  const { card } = spec;
  const [ccx, ccy] = cardCenter(card);
  const { fit, rot } = wordPlacement(spec);

  const halo = spec.word.outline
    ? rotate(
        rot.deg,
        rot.cx,
        rot.cy,
        text(fit, { fill: 'white', stroke: 'white', strokeWidth: spec.word.outline }),
      )
    : '';
  const knockout = rotate(rot.deg, rot.cx, rot.cy, text(fit, { fill: 'black' }));

  return `<defs>
      <mask id="knockout" maskUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}">
        <rect width="${SIZE}" height="${SIZE}" fill="black"/>
        ${rotate(card.rot, ccx, ccy, rrect(card.x, card.y, card.w, card.h, card.r, 'fill="white"'))}
        ${halo}
        ${knockout}
      </mask>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" fill="${C.white}" mask="url(#knockout)"/>`;
}

// --------------------------------------------------------------------------------------------
// Enquadramento e montagem

/**
 * Mede a tinta da arte e a reescala/centraliza para deixar `margin` de folga no viewBox.
 * É o que garante que o "MEME" não encoste na borda nem seja comido pela máscara do Android.
 */
function frame(art, margin) {
  const b = inkBounds(render(svgDoc(art), SIZE));
  const available = SIZE - 2 * margin;
  const k = Math.min(available / b.width, available / b.height);
  const tx = SIZE / 2 - ((b.x0 + b.x1 + 1) / 2) * k;
  const ty = SIZE / 2 - ((b.y0 + b.y1 + 1) / 2) * k;
  return `<g transform="translate(${tx} ${ty}) scale(${k})">${art}</g>`;
}

function iconSvg(variant, { background = C.yellow, margin = MARGIN.icon, mono = false } = {}) {
  const spec = VARIANTS[variant];
  const art = frame(mono ? silhouette(spec) : paint(spec), margin);
  const bg = background ? `<rect width="${SIZE}" height="${SIZE}" fill="${background}"/>` : '';
  return svgDoc(bg + art);
}

/** Wordmark empilhado do splash: PRINT / VIRA / MEME, "VIRA" em amarelo, fundo transparente. */
function wordmarkSvg() {
  const W = 1024;
  const H = 640;
  const INK_WIDTH = 700; // mesma largura de tinta nas três linhas: o bloco fica um retângulo sólido
  const GAP = 26;
  const lines = [
    { label: 'PRINT', fill: C.white },
    { label: 'VIRA', fill: C.yellow },
    { label: 'MEME', fill: C.white },
  ];

  const opts = { family: 'Rubik', weight: 900, letterSpacing: -0.02, inkWidth: INK_WIDTH, cx: W / 2 };
  const heights = lines.map((l) => fitText(l.label, { ...opts, cy: 0 }).inkHeight);
  const total = heights.reduce((a, b) => a + b, 0) + GAP * (lines.length - 1);

  let top = (H - total) / 2;
  const body = lines
    .map((line, i) => {
      const fit = fitText(line.label, { ...opts, cy: top + heights[i] / 2 });
      top += heights[i] + GAP;
      return text(fit, { fill: line.fill });
    })
    .join('');

  return svgDoc(body, W, H);
}

// --------------------------------------------------------------------------------------------
// Saída

function outputs(variant) {
  return [
    { file: 'assets/icon.png', width: 1024, svg: iconSvg(variant) },
    {
      file: 'assets/android-icon-foreground.png',
      width: 512,
      svg: iconSvg(variant, { background: null, margin: MARGIN.adaptive }),
    },
    {
      file: 'assets/android-icon-background.png',
      width: 512,
      svg: svgDoc(`<rect width="${SIZE}" height="${SIZE}" fill="${C.yellow}"/>`),
    },
    {
      file: 'assets/android-icon-monochrome.png',
      width: 432,
      svg: iconSvg(variant, { background: null, margin: MARGIN.adaptive, mono: true }),
    },
    { file: 'assets/favicon.png', width: 48, svg: iconSvg(variant), svgName: 'icon' },
    { file: 'assets/splash-icon.png', width: 1024, svg: wordmarkSvg() },
  ];
}

function writePng(svg, width, absPath) {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, render(svg, width).asPng());
}

function build(variant) {
  for (const { file, width, svg, svgName } of outputs(variant)) {
    const name =
      svgName ??
      file
        .split('/')
        .pop()
        .replace(/\.png$/, '');
    const svgPath = join(ROOT, 'assets/brand', `${name}.svg`);
    mkdirSync(dirname(svgPath), { recursive: true });
    writeFileSync(svgPath, `${svg}\n`);
    writePng(svg, width, join(ROOT, file));
    console.log(`${file} (${width}px)  <-  assets/brand/${name}.svg`);
  }
}

function preview(outDir) {
  for (const variant of Object.keys(VARIANTS)) {
    for (const size of [48, 108, 192, 512])
      writePng(iconSvg(variant), size, join(outDir, `${variant}-${size}.png`));
    // Como o Android compõe: fundo amarelo + foreground recuado para a safe zone.
    writePng(iconSvg(variant, { margin: MARGIN.adaptive }), 256, join(outDir, `${variant}-adaptive.png`));
    writePng(
      iconSvg(variant, { background: C.ink, margin: MARGIN.adaptive, mono: true }),
      256,
      join(outDir, `${variant}-mono.png`),
    );
  }
  writePng(wordmarkSvg(), 1024, join(outDir, 'wordmark.png'));
  console.log(`preview em ${outDir}`);
}

function report() {
  for (const variant of Object.keys(VARIANTS)) {
    const b = inkBounds(render(iconSvg(variant, { background: null }), SIZE));
    console.log(
      `${variant}  esq ${b.x0}  dir ${SIZE - 1 - b.x1}  topo ${b.y0}  base ${SIZE - 1 - b.y1}  (${b.width}x${b.height})`,
    );
  }
  const w = inkBounds(render(wordmarkSvg(), 1024));
  console.log(`wordmark  esq ${w.x0}  topo ${w.y0}  (${w.width}x${w.height})`);
}

export { VARIANTS, iconSvg, wordmarkSvg, render, inkBounds, MARGIN };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const arg = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

  if (args.includes('--preview')) {
    preview(resolve(arg('out') ?? join(ROOT, '.brand-preview')));
  } else if (args.includes('--report')) {
    report();
  } else {
    const variant = (arg('variant') ?? '').toLowerCase();
    if (!VARIANTS[variant]) {
      console.error(`uso: node tools/make-brand-assets.mjs --variant=${Object.keys(VARIANTS).join('|')}`);
      process.exit(1);
    }
    build(variant);
  }
}
