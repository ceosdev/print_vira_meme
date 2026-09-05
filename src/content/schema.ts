/**
 * Schemas zod do catálogo + regras editoriais.
 *
 * Usado (1) em dev, na primeira carga do catálogo; (2) por tools/validate-catalog.ts
 * no CI e antes de cada OTA. Não depende de React Native — roda em Node puro.
 */
import { z } from 'zod';
import {
  CANVAS_WIDTH,
  CATEGORY_IDS,
  FONT_FACES,
  FONTS,
  SLOT_TYPES,
  tokensOf,
  type Category,
  type Layout,
  type Phrase,
  type Preset,
} from '../types/catalog';

// ---------------------------------------------------------------------------
// Primitivos
// ---------------------------------------------------------------------------

const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id deve ser kebab-case');
const colorSchema = z
  .string()
  .regex(
    /^(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*(0|1|0?\.\d+)\s*)?\)|transparent)$/,
    'cor deve ser #RRGGBB, #RRGGBBAA, rgb()/rgba() ou transparent',
  );
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve ser YYYY-MM-DD');

// ---------------------------------------------------------------------------
// Elementos
// ---------------------------------------------------------------------------

const baseElement = z.object({
  id: idSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().min(-180).max(180).optional(),
  opacity: z.number().min(0).max(1).optional(),
  showIf: idSchema.optional(),
});

export const imageElementSchema = baseElement.extend({
  type: z.literal('image'),
  radius: z.number().min(0).optional(),
  defaultFit: z.enum(['cover', 'contain-blur']),
});

export const textElementSchema = baseElement.extend({
  type: z.literal('text'),
  content: z.string().min(1),
  fontRole: z.enum(['display', 'body', 'fixed']),
  font: z.enum(FONT_FACES),
  fontSize: z.number().positive(),
  minFontSize: z.number().positive().optional(),
  color: colorSchema,
  align: z.enum(['left', 'center', 'right']),
  valign: z.enum(['top', 'middle', 'bottom']).optional(),
  uppercase: z.boolean().optional(),
  lineHeight: z.number().positive().optional(),
  letterSpacing: z.number().optional(),
  outline: z.object({ color: colorSchema, width: z.number().positive() }).optional(),
  shadow: z.boolean().optional(),
  hideWhenEmpty: z.boolean().optional(),
  draggable: z.boolean().optional(),
});

export const rectElementSchema = baseElement.extend({
  type: z.literal('rect'),
  fill: colorSchema,
  radius: z.number().min(0).optional(),
  border: z.object({ color: colorSchema, width: z.number().positive() }).optional(),
});

export const brandElementSchema = baseElement.extend({
  type: z.literal('brand'),
  variant: z.enum(['footer', 'pill']),
});

export const elementSchema = z.discriminatedUnion('type', [
  imageElementSchema,
  textElementSchema,
  rectElementSchema,
  brandElementSchema,
]);

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

export const slotSchema = z.object({
  id: idSchema,
  label: z.string().min(1).max(30),
  type: z.enum(SLOT_TYPES),
  maxChars: z.number().int().positive().max(300),
  maxLines: z.number().int().positive().max(8),
  multiline: z.boolean(),
  placeholder: z.string().max(300).optional(),
  optional: z.boolean().optional(),
});

export const layoutSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(30),
  version: z.literal(1),
  canvas: z.object({
    width: z.literal(CANVAS_WIDTH),
    height: z.union([z.literal(1080), z.literal(1350)]),
    heightWithoutBrand: z.number().int().positive().optional(),
  }),
  background: colorSchema,
  premium: z.boolean(),
  slots: z.array(slotSchema).min(1),
  elements: z.array(elementSchema).min(2),
});

export const presetSchema = z.object({
  id: idSchema,
  layoutId: idSchema,
  name: z.string().min(1).max(40),
  category: z.enum(CATEGORY_IDS),
  tags: z.array(z.enum(CATEGORY_IDS)).optional(),
  values: z.record(z.string(), z.string()),
  premium: z.boolean(),
  popular: z.boolean().optional(),
  packId: idSchema.optional(),
  addedAt: dateSchema,
  order: z.number().int(),
});

export const phraseSchema = z.object({
  id: idSchema,
  text: z.string().min(1).max(140),
  slotTypes: z.array(z.enum(SLOT_TYPES)).min(1),
  categories: z.array(z.enum(CATEGORY_IDS)).min(1),
});

export const categorySchema = z.object({
  id: z.enum(CATEGORY_IDS),
  name: z.string().min(1).max(20),
  emoji: z.string().min(1),
  order: z.number().int(),
});

// ---------------------------------------------------------------------------
// Validação cruzada + regras editoriais
// ---------------------------------------------------------------------------

export interface CatalogInput {
  layouts: unknown[];
  presets: unknown[];
  phrases: unknown[];
  categories: unknown[];
}

export interface CatalogReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  counts: { layouts: number; presets: number; phrases: number; categories: number };
}

export interface ValidateOptions {
  /**
   * strict = regras de catálogo completo viram erro (≥ 3 presets por categoria,
   * ≥ 50% free por categoria). Fora do strict são avisos — útil enquanto o
   * catálogo está sendo escrito.
   */
  strict?: boolean;
}

const BRAND_MIN_HEIGHT = 52;

export function validateCatalog(input: CatalogInput, opts: ValidateOptions = {}): CatalogReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (m: string) => errors.push(m);
  const warn = (m: string) => (opts.strict ? errors : warnings).push(m);

  const parseAll = <T>(label: string, schema: z.ZodType<T>, items: unknown[]): T[] => {
    const out: T[] = [];
    items.forEach((item, i) => {
      const r = schema.safeParse(item);
      if (r.success) out.push(r.data);
      else {
        const id = (item as { id?: string })?.id ?? `#${i}`;
        for (const issue of r.error.issues) err(`${label} ${id}: ${issue.path.join('.')} — ${issue.message}`);
      }
    });
    return out;
  };

  const layouts = parseAll<Layout>('layout', layoutSchema as unknown as z.ZodType<Layout>, input.layouts);
  const presets = parseAll<Preset>('preset', presetSchema as unknown as z.ZodType<Preset>, input.presets);
  const phrases = parseAll<Phrase>('phrase', phraseSchema as unknown as z.ZodType<Phrase>, input.phrases);
  const categories = parseAll<Category>('category', categorySchema as unknown as z.ZodType<Category>, input.categories);

  // ids únicos
  for (const [label, items] of [
    ['layout', layouts],
    ['preset', presets],
    ['phrase', phrases],
    ['category', categories],
  ] as const) {
    const seen = new Set<string>();
    for (const it of items as { id: string }[]) {
      if (seen.has(it.id)) err(`${label} ${it.id}: id duplicado`);
      seen.add(it.id);
    }
  }

  // ---- layouts ----
  const layoutById = new Map(layouts.map((l) => [l.id, l]));
  for (const l of layouts) {
    const slotIds = new Set(l.slots.map((s) => s.id));
    const dupSlots = l.slots.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
    for (const d of dupSlots) err(`layout ${l.id}: slot duplicado "${d}"`);

    const images = l.elements.filter((e) => e.type === 'image');
    const brands = l.elements.filter((e) => e.type === 'brand');
    if (images.length !== 1) err(`layout ${l.id}: precisa de exatamente 1 elemento image (tem ${images.length})`);
    if (brands.length !== 1) err(`layout ${l.id}: precisa de exatamente 1 elemento brand (tem ${brands.length})`);

    const elIds = new Set<string>();
    const referenced = new Set<string>();
    for (const e of l.elements) {
      if (elIds.has(e.id)) err(`layout ${l.id}: elemento duplicado "${e.id}"`);
      elIds.add(e.id);

      if (e.x < 0 || e.y < 0 || e.x + e.width > l.canvas.width || e.y + e.height > l.canvas.height) {
        err(`layout ${l.id}: elemento "${e.id}" fora do canvas (${e.x},${e.y},${e.width}x${e.height})`);
      }
      if (e.showIf && !slotIds.has(e.showIf)) err(`layout ${l.id}: "${e.id}".showIf aponta para slot inexistente "${e.showIf}"`);

      if (e.type === 'text') {
        const tokens = tokensOf(e.content);
        for (const t of tokens) {
          if (!slotIds.has(t)) err(`layout ${l.id}: "${e.id}" usa token {{${t}}} sem slot correspondente`);
          referenced.add(t);
        }
        if (e.minFontSize !== undefined && e.minFontSize > e.fontSize) err(`layout ${l.id}: "${e.id}".minFontSize > fontSize`);
        if (e.fontRole === 'display' && !FONTS[e.font].selectable) err(`layout ${l.id}: "${e.id}" é display mas usa fonte não selecionável "${e.font}"`);
        if (!l.premium && FONTS[e.font].premium) err(`layout ${l.id}: layout free usa fonte premium "${e.font}" em "${e.id}"`);
        // slot opcional precisa de mecanismo de ocultação
        for (const t of tokens) {
          const slot = l.slots.find((s) => s.id === t);
          if (slot?.optional && !e.hideWhenEmpty && !e.showIf) {
            warn(`layout ${l.id}: "${e.id}" usa slot opcional "${t}" sem hideWhenEmpty/showIf`);
          }
        }
      }
      if (e.type === 'brand') {
        if (e.height < BRAND_MIN_HEIGHT) err(`layout ${l.id}: brand com altura < ${BRAND_MIN_HEIGHT}`);
        if (e.variant === 'footer') {
          if (e.x !== 0 || e.width !== l.canvas.width) err(`layout ${l.id}: brand footer deve ocupar a largura toda`);
          if (e.y + e.height !== l.canvas.height) err(`layout ${l.id}: brand footer deve encostar na base do canvas`);
          if (l.canvas.heightWithoutBrand !== undefined && l.canvas.heightWithoutBrand !== e.y) {
            err(`layout ${l.id}: heightWithoutBrand (${l.canvas.heightWithoutBrand}) deve ser igual ao y do footer (${e.y})`);
          }
        } else if (l.canvas.heightWithoutBrand !== undefined) {
          err(`layout ${l.id}: heightWithoutBrand só faz sentido com brand footer`);
        }
      }
    }
    for (const s of l.slots) {
      if (!referenced.has(s.id)) err(`layout ${l.id}: slot "${s.id}" não é usado por nenhum texto`);
    }
  }

  // ---- presets ----
  const presetsByCategory = new Map<string, Preset[]>();
  for (const p of presets) {
    const l = layoutById.get(p.layoutId);
    if (!l) {
      err(`preset ${p.id}: layout inexistente "${p.layoutId}"`);
      continue;
    }
    if (!p.premium && l.premium) err(`preset ${p.id}: preset free não pode usar layout premium "${l.id}"`);
    const slotById = new Map(l.slots.map((s) => [s.id, s]));
    for (const [k, v] of Object.entries(p.values)) {
      const s = slotById.get(k);
      if (!s) {
        err(`preset ${p.id}: value "${k}" não é slot de "${l.id}"`);
        continue;
      }
      if (v.length > s.maxChars) err(`preset ${p.id}: "${k}" tem ${v.length} chars (máx ${s.maxChars})`);
    }
    for (const s of l.slots) {
      if (!s.optional && !(p.values[s.id] ?? '').trim()) err(`preset ${p.id}: slot obrigatório "${s.id}" sem valor`);
    }
    if (p.tags?.includes(p.category)) warn(`preset ${p.id}: tag repete a categoria primária`);
    const list = presetsByCategory.get(p.category) ?? [];
    list.push(p);
    presetsByCategory.set(p.category, list);
  }

  // ---- regras de catálogo completo ----
  for (const c of categories) {
    const list = presetsByCategory.get(c.id) ?? [];
    if (list.length < 3) warn(`categoria ${c.id}: ${list.length} presets (mínimo 3)`);
    if (list.length > 0) {
      const free = list.filter((p) => !p.premium).length;
      if (free / list.length < 0.5) warn(`categoria ${c.id}: só ${free}/${list.length} presets free (mínimo 50%)`);
    }
  }
  const catIds = new Set(categories.map((c) => c.id));
  for (const id of CATEGORY_IDS) if (!catIds.has(id)) warn(`categoria ${id} ausente em categories.json`);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: { layouts: layouts.length, presets: presets.length, phrases: phrases.length, categories: categories.length },
  };
}
