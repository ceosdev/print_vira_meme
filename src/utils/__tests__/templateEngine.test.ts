import { catalog } from '@/content';
import type { Layout } from '@/types/catalog';
import {
  canvasHeight, defaultValues, effectiveFont, isVisible, migrateValues, resolveLayout, substitute,
} from '@/utils/templateEngine';

const layout = (id: string): Layout => {
  const l = catalog.layoutById.get(id);
  if (!l) throw new Error(id);
  return l;
};
const preset = (id: string) => {
  const p = catalog.presetById.get(id);
  if (!p) throw new Error(id);
  return p;
};
const baseStyle = { caps: false };

describe('substitute', () => {
  it('troca tokens pelos valores e vazio quando não há valor', () => {
    expect(substitute('POV: {{pov}}', { pov: 'x' })).toBe('POV: x');
    expect(substitute('{{score-a}} × {{score-b}}', { 'score-a': '3' })).toBe('3 × ');
    expect(substitute('🚨 URGENTE', {})).toBe('🚨 URGENTE');
  });
});

describe('isVisible', () => {
  const conversa = layout('conversa');
  const b3bg = conversa.elements.find((e) => e.id === 'b3-bg')!;
  const b3text = conversa.elements.find((e) => e.id === 'b3-text')!;
  const topbar = conversa.elements.find((e) => e.id === 'topbar')!;

  it('showIf esconde o fundo quando o slot está vazio', () => {
    expect(isVisible(b3bg, { m3: '' })).toBe(false);
    expect(isVisible(b3bg, { m3: '  ' })).toBe(false);
    expect(isVisible(b3bg, { m3: 'oi' })).toBe(true);
  });
  it('hideWhenEmpty esconde o texto sem valor', () => {
    expect(isVisible(b3text, {})).toBe(false);
    expect(isVisible(b3text, { m3: 'oi' })).toBe(true);
  });
  it('elemento sem regra sempre aparece', () => {
    expect(isVisible(topbar, {})).toBe(true);
  });
});

describe('canvasHeight', () => {
  it('encolhe no PRO só quando há heightWithoutBrand', () => {
    expect(canvasHeight(layout('noticia'), true)).toBe(1350);
    expect(canvasHeight(layout('noticia'), false)).toBe(1286);
    expect(canvasHeight(layout('classic'), false)).toBe(1080);
  });
});

describe('effectiveFont', () => {
  it('display recebe a fonte do usuário; fixed não', () => {
    const classic = layout('classic');
    const top = classic.elements.find((e) => e.id === 'top-text')!;
    const noticia = layout('noticia');
    const header = noticia.elements.find((e) => e.id === 'header-text')!;
    if (top.type !== 'text' || header.type !== 'text') throw new Error();
    expect(effectiveFont(top, { caps: false, font: 'bangers' })).toBe('bangers');
    expect(effectiveFont(top, { caps: false })).toBe('anton');
    expect(effectiveFont(header, { caps: false, font: 'bangers' })).toBe('bebas');
  });
});

describe('defaultValues', () => {
  it('preenche todos os slots, vazio para os sem valor no preset', () => {
    const v = defaultValues(preset('humor-fingindo-ouvindo'), layout('legenda'));
    expect(v).toEqual({ caption: 'Eu fingindo que estou ouvindo enquanto penso no que vou comer' });
    const v2 = defaultValues(preset('rel-respondeu-ok'), layout('alerta'));
    expect(Object.keys(v2)).toEqual(['title', 'description']);
  });
});

describe('resolveLayout', () => {
  it('classic com brand: imagem + texto + brand; bottom vazio some', () => {
    const r = resolveLayout({ layout: layout('classic'), values: { top: 'oi', bottom: '' }, style: baseStyle, showBrand: true });
    expect(r.width).toBe(1080);
    expect(r.height).toBe(1080);
    expect(r.elements.map((e) => e.kind)).toEqual(['image', 'text', 'brand']);
  });
  it('sem brand no PRO e canvas encolhe na notícia', () => {
    const r = resolveLayout({ layout: layout('noticia'), values: { title: 't' }, style: baseStyle, showBrand: false });
    expect(r.height).toBe(1286);
    expect(r.elements.some((e) => e.kind === 'brand')).toBe(false);
  });
  it('aplica uppercase do layout e caps do usuário só em display', () => {
    const r = resolveLayout({ layout: layout('classic'), values: { top: 'oi' }, style: { caps: false }, showBrand: false });
    const top = r.elements.find((e) => e.kind === 'text' && e.id === 'top-text');
    expect(top && top.kind === 'text' && top.text).toBe('OI');

    const r2 = resolveLayout({ layout: layout('legenda'), values: { caption: 'oi' }, style: { caps: true }, showBrand: false });
    const cap = r2.elements.find((e) => e.kind === 'text' && e.id === 'caption-text');
    expect(cap && cap.kind === 'text' && cap.text).toBe('OI');

    const r3 = resolveLayout({ layout: layout('noticia'), values: { title: 'x', description: 'desc' }, style: { caps: true }, showBrand: false });
    const desc = r3.elements.find((e) => e.kind === 'text' && e.id === 'description-text');
    expect(desc && desc.kind === 'text' && desc.text).toBe('desc');
  });
  it('resolve fontFamily, minFontSize padrão (60%) e maxLines do slot', () => {
    const r = resolveLayout({ layout: layout('pov'), values: { pov: 'x' }, style: { caps: false, font: 'lilita' }, showBrand: false });
    const t = r.elements.find((e) => e.kind === 'text');
    if (!t || t.kind !== 'text') throw new Error();
    expect(t.fontFamily).toBe('LilitaOne-Regular');
    expect(t.minFontSize).toBe(48);
    expect(t.maxLines).toBe(3);
    expect(t.text).toBe('POV: x');
  });
  it('texto fixo sem token usa maxLines pela altura da caixa', () => {
    const r = resolveLayout({ layout: layout('noticia'), values: { title: 'x' }, style: baseStyle, showBrand: true });
    const header = r.elements.find((e) => e.kind === 'text' && e.id === 'header-text');
    if (!header || header.kind !== 'text') throw new Error();
    expect(header.maxLines).toBe(1);
  });
  it('cor e contorno do usuário valem para display/body, não para fixed', () => {
    const r = resolveLayout({ layout: layout('noticia'), values: { title: 't', description: 'd' }, style: { caps: false, color: '#FF0000', outline: true }, showBrand: false });
    const byId = (id: string) => r.elements.find((e) => e.kind === 'text' && e.id === id);
    const title = byId('title-text'), desc = byId('description-text'), header = byId('header-text');
    if (!title || title.kind !== 'text' || !desc || desc.kind !== 'text' || !header || header.kind !== 'text') throw new Error();
    expect(title.color).toBe('#FF0000');
    expect(desc.color).toBe('#FF0000');
    expect(header.color).toBe('#FFFFFF');
    expect(title.outline).toEqual({ color: '#000000', width: 6 });
    expect(desc.outline).toBeUndefined();
  });
  it('positions do PRO substituem x/y e extraTexts entram no fim', () => {
    const r = resolveLayout({
      layout: layout('classic'), values: { top: 'a' }, style: baseStyle, showBrand: false,
      positions: { 'top-text': { x: 100, y: 200 } }, extraTexts: [{ id: 'extra-1', content: 'mais', x: 40, y: 400 }],
    });
    const top = r.elements.find((e) => e.kind === 'text' && e.id === 'top-text');
    if (!top || top.kind !== 'text') throw new Error();
    expect([top.x, top.y]).toEqual([100, 200]);
    const last = r.elements[r.elements.length - 1];
    expect(last.kind === 'text' && last.id === 'extra-1' && last.text === 'mais').toBe(true);
  });
});

describe('migrateValues', () => {
  it('title editado migra da notícia para a manchete; slots sem par usam o padrão do novo preset', () => {
    const from = layout('noticia'), to = layout('manchete');
    const fromDefaults = defaultValues(preset('humor-academia-segunda'), from);
    const toDefaults = defaultValues(preset('fam-manchete-tia'), to);
    const values = { ...fromDefaults, title: 'MEU TÍTULO' };
    const out = migrateValues({ from, to, values, fromDefaults, toDefaults });
    expect(out.title).toBe('MEU TÍTULO');
    expect(out.kicker).toBe(toDefaults.kicker);
    expect(out.description).toBe(toDefaults.description);
  });
  it('valores não editados não migram; tipos diferentes não se misturam', () => {
    const from = layout('classic'), to = layout('placar');
    const fromDefaults = defaultValues(preset('humor-dormir-cedo'), from);
    const toDefaults = defaultValues(preset('humor-placar-segunda'), to);
    const out = migrateValues({ from, to, values: { ...fromDefaults, top: 'EDITADO' }, fromDefaults, toDefaults });
    expect(out).toEqual(toDefaults);
  });
  it('respeita maxChars do slot de destino', () => {
    const from = layout('legenda'), to = layout('balao');
    const fromDefaults = { caption: 'x' };
    const toDefaults = defaultValues(preset('humor-balao-celular'), to);
    const longCaption = 'a'.repeat(120);
    const out = migrateValues({ from, to, values: { caption: longCaption }, fromDefaults, toDefaults });
    expect(out.caption).toBe(toDefaults.caption); // balao.caption tem maxChars 40
  });
});
