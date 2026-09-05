import type { ImageFit, ImageTransform } from '@/types/creation';

export interface Size {
  width: number;
  height: number;
}
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export function identityTransform(fit: ImageFit = 'cover'): ImageTransform {
  return { scale: 1, offsetX: 0, offsetY: 0, fit };
}

export function coverScale(image: Size, slot: Size): number {
  return Math.max(slot.width / image.width, slot.height / image.height);
}

export function containScale(image: Size, slot: Size): number {
  return Math.min(slot.width / image.width, slot.height / image.height);
}

/** Retângulo da foto dentro do slot, em px de canvas, com origem no canto superior esquerdo do slot. */
export function imageRect(image: Size, slot: Size, t: ImageTransform): Rect {
  if (t.fit === 'contain-blur') {
    const s = containScale(image, slot);
    const width = image.width * s;
    const height = image.height * s;
    return { left: (slot.width - width) / 2, top: (slot.height - height) / 2, width, height };
  }
  const s = coverScale(image, slot) * t.scale;
  const width = image.width * s;
  const height = image.height * s;
  return { left: (slot.width - width) / 2 + t.offsetX, top: (slot.height - height) / 2 + t.offsetY, width, height };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Zoom entre 1 e 3; deslocamento limitado para a foto nunca deixar área vazia (modo cover). */
export function clampTransform(image: Size, slot: Size, t: ImageTransform): ImageTransform {
  if (t.fit === 'contain-blur') return identityTransform('contain-blur');
  const scale = clamp(t.scale, MIN_ZOOM, MAX_ZOOM);
  const r = imageRect(image, slot, { fit: 'cover', scale, offsetX: 0, offsetY: 0 });
  const maxX = Math.max(0, (r.width - slot.width) / 2);
  const maxY = Math.max(0, (r.height - slot.height) / 2);
  return { fit: 'cover', scale, offsetX: clamp(t.offsetX, -maxX, maxX), offsetY: clamp(t.offsetY, -maxY, maxY) };
}

export function toggleFit(t: ImageTransform): ImageTransform {
  return identityTransform(t.fit === 'cover' ? 'contain-blur' : 'cover');
}
