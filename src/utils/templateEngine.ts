import {
  FONTS,
  TOKEN_RE,
  tokensOf,
  type FontFace,
  type ImageElement,
  type Layout,
  type LayoutElement,
  type Preset,
  type TemplateValues,
  type TextElement,
} from '@/types/catalog';
import type { ExtraText, StyleChoice } from '@/types/creation';

export function substitute(content: string, values: TemplateValues): string {
  return content.replace(TOKEN_RE, (_match, id: string) => values[id] ?? '');
}

export function isBlank(v: string | undefined): boolean {
  return v === undefined || v.trim().length === 0;
}

export function isVisible(el: LayoutElement, values: TemplateValues): boolean {
  if (el.showIf && isBlank(values[el.showIf])) return false;
  if (el.type === 'text' && el.hideWhenEmpty) {
    const ids = tokensOf(el.content);
    if (ids.length > 0 && ids.every((id) => isBlank(values[id]))) return false;
  }
  return true;
}

export function canvasHeight(layout: Layout, showBrand: boolean): number {
  return !showBrand && layout.canvas.heightWithoutBrand ? layout.canvas.heightWithoutBrand : layout.canvas.height;
}

export function effectiveFont(el: TextElement, style: StyleChoice): FontFace {
  return el.fontRole === 'display' && style.font ? style.font : el.font;
}

export function imageElementOf(layout: Layout): ImageElement {
  const el = layout.elements.find((e): e is ImageElement => e.type === 'image');
  if (!el) throw new Error(`layout ${layout.id} sem elemento image`);
  return el;
}

export function defaultValues(preset: Preset, layout: Layout): TemplateValues {
  const out: TemplateValues = {};
  for (const slot of layout.slots) {
    const v = preset.values[slot.id];
    if (v !== undefined) out[slot.id] = v;
    else if (!slot.optional) out[slot.id] = '';
  }
  return out;
}

/**
 * Ao trocar de layout, leva os valores que o usuário editou (≠ padrão do preset anterior)
 * para slots do mesmo `type` no layout novo, respeitando maxChars; o resto usa o padrão do novo preset.
 */
export function migrateValues(args: {
  from: Layout;
  to: Layout;
  values: TemplateValues;
  fromDefaults: TemplateValues;
  toDefaults: TemplateValues;
}): TemplateValues {
  const edited = args.from.slots
    .filter((s) => !isBlank(args.values[s.id]) && (args.values[s.id] ?? '') !== (args.fromDefaults[s.id] ?? ''))
    .map((s) => ({ type: s.type, value: args.values[s.id] as string }));

  const out: TemplateValues = {};
  for (const slot of args.to.slots) {
    const idx = edited.findIndex((e) => e.type === slot.type && e.value.length <= slot.maxChars);
    if (idx >= 0) {
      out[slot.id] = edited[idx].value;
      edited.splice(idx, 1);
    } else if (args.toDefaults[slot.id] !== undefined) {
      out[slot.id] = args.toDefaults[slot.id];
    } else if (!slot.optional) {
      out[slot.id] = '';
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Resolução do layout (o que o MemeCanvas desenha)
// ---------------------------------------------------------------------------

interface ResolvedBase {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
}
export interface ResolvedImage extends ResolvedBase {
  kind: 'image';
  radius: number;
  defaultFit: ImageElement['defaultFit'];
}
export interface ResolvedText extends ResolvedBase {
  kind: 'text';
  text: string;
  /** slots que este texto edita (vazio = texto fixo do layout) */
  slotIds: string[];
  fontFamily: string;
  fontSize: number;
  minFontSize: number;
  color: string;
  align: TextElement['align'];
  valign: NonNullable<TextElement['valign']>;
  lineHeight: number;
  letterSpacing?: number;
  outline?: { color: string; width: number };
  shadow: boolean;
  maxLines: number;
  draggable: boolean;
}
export interface ResolvedRect extends ResolvedBase {
  kind: 'rect';
  fill: string;
  radius: number;
  border?: { color: string; width: number };
}
export interface ResolvedBrand extends ResolvedBase {
  kind: 'brand';
  variant: 'footer' | 'pill';
}
export type ResolvedElement = ResolvedImage | ResolvedText | ResolvedRect | ResolvedBrand;

export interface ResolvedLayout {
  width: number;
  height: number;
  background: string;
  elements: ResolvedElement[];
}

export interface ResolveInput {
  layout: Layout;
  values: TemplateValues;
  style: StyleChoice;
  positions?: Record<string, { x: number; y: number }>;
  extraTexts?: ExtraText[];
  showBrand: boolean;
}

const DEFAULT_OUTLINE = { color: '#000000', width: 6 } as const;
const EXTRA_TEXT = { width: 1000, height: 200, fontSize: 64, minFontSize: 38, maxLines: 3 } as const;

function lineHeightFor(el: TextElement): number {
  return el.lineHeight ?? (el.fontRole === 'display' ? 1.1 : 1.3);
}

export function resolveLayout(input: ResolveInput): ResolvedLayout {
  const { layout, values, style, positions = {}, extraTexts = [], showBrand } = input;
  const height = canvasHeight(layout, showBrand);
  const slotMaxLines = new Map(layout.slots.map((s) => [s.id, s.maxLines]));
  const elements: ResolvedElement[] = [];

  for (const el of layout.elements) {
    if (!isVisible(el, values)) continue;
    const base: ResolvedBase = { id: el.id, x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation, opacity: el.opacity };

    switch (el.type) {
      case 'image':
        elements.push({ ...base, kind: 'image', radius: el.radius ?? 0, defaultFit: el.defaultFit });
        break;
      case 'rect':
        elements.push({ ...base, kind: 'rect', fill: el.fill, radius: el.radius ?? 0, border: el.border });
        break;
      case 'brand':
        if (showBrand) elements.push({ ...base, kind: 'brand', variant: el.variant });
        break;
      case 'text': {
        const tokens = tokensOf(el.content);
        let text = substitute(el.content, values);
        if (el.uppercase || (el.fontRole === 'display' && style.caps)) text = text.toUpperCase();
        const lineHeight = lineHeightFor(el);
        const boxLines = Math.max(1, Math.floor(el.height / (el.fontSize * lineHeight)));
        const maxLines = tokens.length > 0 ? Math.max(1, ...tokens.map((t) => slotMaxLines.get(t) ?? 1)) : boxLines;
        const pos = positions[el.id];
        const styled = el.fontRole !== 'fixed';
        const outline =
          el.fontRole === 'display' && style.outline !== undefined
            ? style.outline
              ? (el.outline ?? DEFAULT_OUTLINE)
              : undefined
            : el.outline;
        elements.push({
          ...base,
          kind: 'text',
          x: pos?.x ?? el.x,
          y: pos?.y ?? el.y,
          text,
          slotIds: tokens,
          fontFamily: FONTS[effectiveFont(el, style)].family,
          fontSize: el.fontSize,
          minFontSize: el.minFontSize ?? Math.round(el.fontSize * 0.6),
          color: styled && style.color ? style.color : el.color,
          align: el.align,
          valign: el.valign ?? 'top',
          lineHeight,
          letterSpacing: el.letterSpacing,
          outline,
          shadow: el.shadow ?? false,
          maxLines,
          draggable: el.draggable ?? false,
        });
        break;
      }
    }
  }

  for (const extra of extraTexts) {
    elements.push({
      kind: 'text',
      id: extra.id,
      slotIds: [],
      x: extra.x,
      y: extra.y,
      width: EXTRA_TEXT.width,
      height: EXTRA_TEXT.height,
      text: style.caps ? extra.content.toUpperCase() : extra.content,
      fontFamily: FONTS[style.font ?? 'anton'].family,
      fontSize: EXTRA_TEXT.fontSize,
      minFontSize: EXTRA_TEXT.minFontSize,
      color: style.color ?? '#FFFFFF',
      align: 'center',
      valign: 'top',
      lineHeight: 1.1,
      outline: style.outline === false ? undefined : DEFAULT_OUTLINE,
      shadow: true,
      maxLines: EXTRA_TEXT.maxLines,
      draggable: true,
    });
  }

  return { width: layout.canvas.width, height, background: layout.background, elements };
}
