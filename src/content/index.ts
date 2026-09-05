import type { Category, CategoryId, Layout, Phrase, Preset, SlotType } from '@/types/catalog';
import { validateCatalog } from './schema';

import categoriesJson from './categories.json';

import alerta from './layouts/alerta.json';
import balao from './layouts/balao.json';
import certificado from './layouts/certificado.json';
import classic from './layouts/classic.json';
import conversa from './layouts/conversa.json';
import enquete from './layouts/enquete.json';
import grafico from './layouts/grafico.json';
import legenda from './layouts/legenda.json';
import manchete from './layouts/manchete.json';
import nota from './layouts/nota.json';
import noticia from './layouts/noticia.json';
import placar from './layouts/placar.json';
import podio from './layouts/podio.json';
import pov from './layouts/pov.json';

import presetsDinheiro from './presets/dinheiro.json';
import presetsFaculdade from './presets/faculdade.json';
import presetsFamilia from './presets/familia.json';
import presetsFutebol from './presets/futebol.json';
import presetsHumor from './presets/humor.json';
import presetsRelacionamento from './presets/relacionamento.json';
import presetsRole from './presets/role.json';
import presetsTrabalho from './presets/trabalho.json';

import phrasesDinheiro from './phrases/dinheiro.json';
import phrasesFaculdade from './phrases/faculdade.json';
import phrasesFamilia from './phrases/familia.json';
import phrasesFutebol from './phrases/futebol.json';
import phrasesHumor from './phrases/humor.json';
import phrasesRelacionamento from './phrases/relacionamento.json';
import phrasesRole from './phrases/role.json';
import phrasesTrabalho from './phrases/trabalho.json';

// Os JSONs são validados por zod (em dev e no CI); o cast abaixo só estreita os tipos inferidos do JSON.
const layoutsRaw = [
  classic, noticia, pov, placar, manchete, legenda, conversa, alerta, enquete,
  podio, grafico, certificado, nota, balao,
] as unknown as Layout[];
const presetsRaw = [
  ...presetsHumor, ...presetsTrabalho, ...presetsRelacionamento, ...presetsDinheiro,
  ...presetsFutebol, ...presetsFamilia, ...presetsFaculdade, ...presetsRole,
] as unknown as Preset[];
const phrasesRaw = [
  ...phrasesHumor, ...phrasesTrabalho, ...phrasesRelacionamento, ...phrasesDinheiro,
  ...phrasesFutebol, ...phrasesFamilia, ...phrasesFaculdade, ...phrasesRole,
] as unknown as Phrase[];
const categoriesRaw = categoriesJson as unknown as Category[];

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const report = validateCatalog({ layouts: layoutsRaw, presets: presetsRaw, phrases: phrasesRaw, categories: categoriesRaw });
  if (!report.ok) console.warn('[catalog] erros de validação:\n' + report.errors.join('\n'));
}

export interface SuggestionQuery {
  slotType: SlotType;
  maxChars: number;
  category: CategoryId;
  tags?: CategoryId[];
  /** texto atual do slot — omitido das sugestões */
  exclude?: string;
}

export interface Catalog {
  /** ordenadas por `order` */
  categories: Category[];
  layouts: Layout[];
  /** ordenados por categoria e `order` */
  presets: Preset[];
  phrases: Phrase[];
  layoutById: ReadonlyMap<string, Layout>;
  presetById: ReadonlyMap<string, Preset>;
  categoryById: ReadonlyMap<CategoryId, Category>;
  layoutOf(preset: Preset): Layout;
  /** primários (por order) + os que têm a categoria como tag (por order) */
  presetsForCategory(id: CategoryId): Preset[];
  popularPresets(): Preset[];
  /** addedAt nos últimos `days` dias (padrão 30), mais novos primeiro */
  newPresets(now?: Date, days?: number): Preset[];
  /** frases do tipo do slot que cabem em maxChars; categoria do preset → tags → demais */
  suggestionsFor(query: SuggestionQuery): Phrase[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function buildCatalog(input: { categories: Category[]; layouts: Layout[]; presets: Preset[]; phrases: Phrase[] }): Catalog {
  const categories = [...input.categories].sort((a, b) => a.order - b.order);
  const categoryOrder = new Map(categories.map((c, i) => [c.id, i]));
  const byCategoryThenOrder = (a: Preset, b: Preset) =>
    (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99) || a.order - b.order;

  const presets = [...input.presets].sort(byCategoryThenOrder);
  const layoutById = new Map(input.layouts.map((l) => [l.id, l]));
  const presetById = new Map(presets.map((p) => [p.id, p]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const layoutOf = (preset: Preset): Layout => {
    const layout = layoutById.get(preset.layoutId);
    if (!layout) throw new Error(`preset ${preset.id}: layout "${preset.layoutId}" não existe`);
    return layout;
  };

  return {
    categories,
    layouts: input.layouts,
    presets,
    phrases: input.phrases,
    layoutById,
    presetById,
    categoryById,
    layoutOf,
    presetsForCategory: (id) => [
      ...presets.filter((p) => p.category === id),
      ...presets.filter((p) => p.category !== id && p.tags?.includes(id)),
    ],
    popularPresets: () => presets.filter((p) => p.popular),
    newPresets: (now = new Date(), days = 30) => {
      const cutoff = now.getTime() - days * DAY_MS;
      return presets
        .filter((p) => {
          const added = new Date(`${p.addedAt}T00:00:00Z`).getTime();
          return added <= now.getTime() && added >= cutoff;
        })
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || byCategoryThenOrder(a, b));
    },
    suggestionsFor: ({ slotType, maxChars, category, tags = [], exclude }) => {
      const rank = (p: Phrase) => (p.categories.includes(category) ? 0 : p.categories.some((c) => tags.includes(c)) ? 1 : 2);
      return input.phrases
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => p.slotTypes.includes(slotType) && p.text.length <= maxChars && p.text !== exclude)
        .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
        .map(({ p }) => p);
    },
  };
}

export const catalog: Catalog = buildCatalog({
  categories: categoriesRaw,
  layouts: layoutsRaw,
  presets: presetsRaw,
  phrases: phrasesRaw,
});
