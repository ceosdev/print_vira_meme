import { PixelRatio } from 'react-native';
import { CANVAS_WIDTH } from '@/types/catalog';

/**
 * Escala lógica usada no editor E na exportação: o canvas de 1080 px vira 1080/PixelRatio px lógicos,
 * que o Android rasteriza em exatamente 1080 px físicos — mesma quebra de linha nos dois lugares.
 */
export const RENDER_SCALE = 1 / PixelRatio.get();

/** Escala para caber numa largura de container (cards, preview reduzido). */
export function fitScale(containerWidth: number): number {
  return containerWidth / CANVAS_WIDTH;
}
