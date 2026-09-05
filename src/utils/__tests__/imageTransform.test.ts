import {
  MAX_ZOOM, clampTransform, containScale, coverScale, identityTransform, imageRect, toggleFit,
} from '@/utils/imageTransform';

const landscape = { width: 1600, height: 900 };
const print = { width: 900, height: 1600 }; // print de celular
const slotWide = { width: 1000, height: 560 };
const slotSquare = { width: 1080, height: 1080 };

describe('escalas', () => {
  it('coverScale cobre o slot; containScale cabe no slot', () => {
    expect(coverScale(landscape, slotWide)).toBeCloseTo(0.625);
    expect(containScale(landscape, slotWide)).toBeCloseTo(0.6222, 3);
    expect(coverScale(print, slotSquare)).toBeCloseTo(1.2);
    expect(containScale(print, slotSquare)).toBeCloseTo(0.675);
  });
});

describe('imageRect', () => {
  it('cover centralizado com scale 1', () => {
    const r = imageRect(landscape, slotWide, identityTransform('cover'));
    expect(r.width).toBeCloseTo(1000);
    expect(r.height).toBeCloseTo(562.5);
    expect(r.left).toBeCloseTo(0);
    expect(r.top).toBeCloseTo(-1.25);
  });
  it('cover aplica zoom e offsets', () => {
    const r = imageRect(print, slotSquare, { fit: 'cover', scale: 2, offsetX: 10, offsetY: -20 });
    expect(r.width).toBeCloseTo(2160);
    expect(r.height).toBeCloseTo(3840);
    expect(r.left).toBeCloseTo((1080 - 2160) / 2 + 10);
    expect(r.top).toBeCloseTo((1080 - 3840) / 2 - 20);
  });
  it('contain-blur ignora zoom/offset e mostra a foto inteira', () => {
    const r = imageRect(print, slotSquare, { fit: 'contain-blur', scale: 2, offsetX: 50, offsetY: 50 });
    expect(r.width).toBeCloseTo(607.5);
    expect(r.height).toBeCloseTo(1080);
    expect(r.left).toBeCloseTo((1080 - 607.5) / 2);
    expect(r.top).toBeCloseTo(0);
  });
});

describe('clampTransform', () => {
  it('limita o zoom entre 1 e 3', () => {
    expect(clampTransform(print, slotSquare, { fit: 'cover', scale: 5, offsetX: 0, offsetY: 0 }).scale).toBe(MAX_ZOOM);
    expect(clampTransform(print, slotSquare, { fit: 'cover', scale: 0.2, offsetX: 0, offsetY: 0 }).scale).toBe(1);
  });
  it('não deixa área vazia: print alto num slot quadrado só desliza na vertical', () => {
    const t = clampTransform(print, slotSquare, { fit: 'cover', scale: 1, offsetX: 300, offsetY: 1000 });
    expect(t.offsetX).toBe(0);
    expect(t.offsetY).toBeCloseTo(420);
    const t2 = clampTransform(print, slotSquare, { fit: 'cover', scale: 1, offsetX: 0, offsetY: -1000 });
    expect(t2.offsetY).toBeCloseTo(-420);
  });
  it('com zoom, sobra margem para deslizar nos dois eixos', () => {
    const t = clampTransform(print, slotSquare, { fit: 'cover', scale: 2, offsetX: 9999, offsetY: 0 });
    expect(t.offsetX).toBeCloseTo(540);
  });
  it('contain-blur volta para a identidade', () => {
    expect(clampTransform(print, slotSquare, { fit: 'contain-blur', scale: 2, offsetX: 5, offsetY: 5 })).toEqual({
      fit: 'contain-blur', scale: 1, offsetX: 0, offsetY: 0,
    });
  });
});

describe('toggleFit', () => {
  it('alterna e zera o enquadramento', () => {
    expect(toggleFit({ fit: 'cover', scale: 2, offsetX: 1, offsetY: 1 })).toEqual(identityTransform('contain-blur'));
    expect(toggleFit(identityTransform('contain-blur'))).toEqual(identityTransform('cover'));
  });
});
