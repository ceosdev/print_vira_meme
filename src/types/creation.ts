import type { FontFace, TemplateValues } from './catalog';

export type ImageSource = 'gallery' | 'camera' | 'share_intent';

export interface ImportedImage {
  /** JPEG com lado maior ≤ 1600 px, no cache do app */
  uri: string;
  /** JPEG com lado maior ≤ 480 px, para os cards */
  thumbUri: string;
  width: number;
  height: number;
  source: ImageSource;
}

export type ImageFit = 'cover' | 'contain-blur';

/** Enquadramento da foto dentro do slot. offsets em px de canvas; scale relativo ao "cover" (1 = cobre exatamente). */
export interface ImageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  fit: ImageFit;
}

export interface StyleChoice {
  /** fonte escolhida para slots `display`; undefined = a do layout */
  font?: FontFace;
  caps: boolean;
  /** PRO: cor para slots display/body; undefined = a do layout */
  color?: string;
  /** PRO: força contorno ligado/desligado em slots display; undefined = como no layout */
  outline?: boolean;
}

export interface ExtraText {
  id: string;
  content: string;
  x: number;
  y: number;
}

export type ExportQuality = 'standard' | 'hd';

export interface ExportResult {
  uri: string;
  width: number;
  height: number;
  format: 'jpg' | 'png';
  quality: ExportQuality;
  hasBrand: boolean;
}

export interface Creation {
  image?: ImportedImage;
  presetId?: string;
  layoutId?: string;
  values: TemplateValues;
  positions: Record<string, { x: number; y: number }>;
  extraTexts: ExtraText[];
  imageTransform: ImageTransform;
  style: StyleChoice;
  lastExport?: ExportResult;
}
