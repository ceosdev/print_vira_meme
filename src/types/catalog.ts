/**
 * Schema do catálogo: layouts, presets, frases e categorias.
 *
 * Fonte de verdade para o renderizador (MemeCanvas), o editor e o validador
 * (content/schema.ts). Coordenadas e tamanhos estão em pixels de canvas
 * (largura fixa de 1080). O renderizador multiplica tudo por `scale`.
 */

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

export const CATEGORY_IDS = [
  'humor',
  'trabalho',
  'relacionamento',
  'dinheiro',
  'futebol',
  'familia',
  'faculdade',
  'role',
  'politicagem',
  'pet',
  'comida',
  'tecnologia',
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHTS = [1080, 1350] as const;
export type CanvasHeight = (typeof CANVAS_HEIGHTS)[number];

/** Fontes embarcadas em assets/fonts (todas OFL). */
export const FONT_FACES = [
  'anton',
  'bebas',
  'oswald',
  'oswald-medium',
  'rubik',
  'rubik-medium',
  'rubik-bold',
  'rubik-black',
  'bangers',
  'lilita',
  'archivo',
  'marker',
] as const;
export type FontFace = (typeof FONT_FACES)[number];

export interface FontDef {
  face: FontFace;
  /** Nome da família como registrado pelo expo-font (nome do arquivo sem extensão). */
  family: string;
  /** Rótulo curto exibido no editor. */
  label: string;
  /** Aparece na linha de fontes do editor (aplica-se a slots com fontRole 'display'). */
  selectable: boolean;
  premium: boolean;
}

export const FONTS: Record<FontFace, FontDef> = {
  anton: { face: 'anton', family: 'Anton-Regular', label: 'Clássica', selectable: true, premium: false },
  bebas: { face: 'bebas', family: 'BebasNeue-Regular', label: 'Manchete', selectable: true, premium: false },
  oswald: { face: 'oswald', family: 'Oswald-Bold', label: 'Notícia', selectable: true, premium: false },
  'oswald-medium': { face: 'oswald-medium', family: 'Oswald-Medium', label: 'Notícia leve', selectable: false, premium: false },
  rubik: { face: 'rubik', family: 'Rubik-Regular', label: 'Sistema', selectable: false, premium: false },
  'rubik-medium': { face: 'rubik-medium', family: 'Rubik-Medium', label: 'Sistema média', selectable: false, premium: false },
  'rubik-bold': { face: 'rubik-bold', family: 'Rubik-Bold', label: 'Sistema negrito', selectable: false, premium: false },
  'rubik-black': { face: 'rubik-black', family: 'Rubik-Black', label: 'Sistema pesada', selectable: false, premium: false },
  bangers: { face: 'bangers', family: 'Bangers-Regular', label: 'Quadrinho', selectable: true, premium: true },
  lilita: { face: 'lilita', family: 'LilitaOne-Regular', label: 'Fofa', selectable: true, premium: true },
  archivo: { face: 'archivo', family: 'ArchivoBlack-Regular', label: 'Pesada', selectable: true, premium: true },
  marker: { face: 'marker', family: 'PermanentMarker-Regular', label: 'Manuscrita', selectable: true, premium: true },
};

export const SELECTABLE_FONTS: readonly FontFace[] = FONT_FACES.filter((f) => FONTS[f].selectable);

/**
 * Tipo semântico de um slot de texto. Liga o slot às frases sugeridas
 * (Phrase.slotTypes) e à migração de valores entre layouts.
 */
export const SLOT_TYPES = [
  'top', // texto de cima do meme clássico
  'bottom', // texto de baixo do meme clássico
  'title', // manchete / título / pergunta
  'description', // subtítulo / descrição / motivo
  'pov', // complemento de "POV:"
  'caption', // legenda de foto
  'name', // nome de pessoa/time/contato
  'score', // número de placar
  'stat', // linha de estatística ("Atrasos: 5")
  'message', // balão de conversa
  'option', // opção de enquete
  'label', // rótulo curto (kicker, eixo, assinatura, data)
  'free', // texto livre (nota, balão de fala)
] as const;
export type SlotType = (typeof SLOT_TYPES)[number];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export interface Slot {
  /** kebab-case; referenciado nos textos como {{id}} */
  id: string;
  /** Rótulo no editor ("Título") */
  label: string;
  type: SlotType;
  maxChars: number;
  maxLines: number;
  /** Campo multilinha na sheet de texto */
  multiline: boolean;
  /** Texto cinza no editor quando vazio; nunca exportado */
  placeholder?: string;
  /** Pode ficar vazio; elementos com showIf/hideWhenEmpty somem */
  optional?: boolean;
}

interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** graus, em torno do centro do elemento */
  rotation?: number;
  /** 0–1 */
  opacity?: number;
  /** id de slot: o elemento só é desenhado se o slot tiver valor não vazio */
  showIf?: string;
}

/** Slot da foto do usuário. Exatamente um por layout. */
export interface ImageElement extends BaseElement {
  type: 'image';
  radius?: number;
  /** cover = preenche (pan/zoom); contain-blur = foto inteira sobre a própria foto desfocada */
  defaultFit: 'cover' | 'contain-blur';
}

export interface TextElement extends BaseElement {
  type: 'text';
  /** Texto literal com tokens {{slotId}} ("POV: {{pov}}", "{{title}}", "🚨 URGENTE") */
  content: string;
  /**
   * display = recebe a fonte escolhida pelo usuário;
   * body/fixed = mantém a fonte do layout (body pode receber cor no PRO; fixed nunca muda)
   */
  fontRole: 'display' | 'body' | 'fixed';
  font: FontFace;
  fontSize: number;
  /** Limite inferior do autoFit; padrão = 60% de fontSize */
  minFontSize?: number;
  color: string;
  align: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  uppercase?: boolean;
  /** multiplicador; padrão 1.1 (display) / 1.3 (body, fixed) */
  lineHeight?: number;
  letterSpacing?: number;
  /** contorno (8 cópias deslocadas + sombra) */
  outline?: { color: string; width: number };
  shadow?: boolean;
  /** Some quando todos os tokens do content estiverem vazios */
  hideWhenEmpty?: boolean;
  /** PRO: pode ser arrastado no editor */
  draggable?: boolean;
}

export interface RectElement extends BaseElement {
  type: 'rect';
  /** cor ou 'transparent' */
  fill: string;
  radius?: number;
  border?: { color: string; width: number };
}

/** Marca d'água do plano Free. Exatamente um por layout. Não é desenhado no PRO. */
export interface BrandElement extends BaseElement {
  type: 'brand';
  /** footer = faixa escura de 64px ("PRINT VIRA MEME"); pill = pílula translúcida ("printvirameme") alinhada à direita/baixo dentro da caixa */
  variant: 'footer' | 'pill';
}

export type LayoutElement = ImageElement | TextElement | RectElement | BrandElement;
export type ElementType = LayoutElement['type'];

export interface Layout {
  id: string;
  name: string;
  /** versão do schema; permite evoluir sem quebrar OTA antigo */
  version: 1;
  canvas: {
    width: typeof CANVAS_WIDTH;
    height: CanvasHeight;
    /** altura do canvas no PRO quando o brand é 'footer' (some a faixa). Ausente = mantém a altura. */
    heightWithoutBrand?: number;
  };
  background: string;
  premium: boolean;
  slots: Slot[];
  /** ordem = z-order (o último fica por cima) */
  elements: LayoutElement[];
}

// ---------------------------------------------------------------------------
// Preset ("template" na interface), Frase, Categoria
// ---------------------------------------------------------------------------

export interface Preset {
  id: string;
  layoutId: string;
  /** nome curto exibido no card */
  name: string;
  /** categoria primária (contagens do catálogo) */
  category: CategoryId;
  /** categorias secundárias em que também aparece */
  tags?: CategoryId[];
  /** slotId -> texto padrão */
  values: Record<string, string>;
  premium: boolean;
  /** aparece em "🔥 Populares" (curadoria) */
  popular?: boolean;
  /** v1.1: pertence a um pack vendido separadamente */
  packId?: string;
  /** YYYY-MM-DD; "✨ Novidades" = últimos 30 dias */
  addedAt: string;
  /** ordem dentro da categoria (menor primeiro) */
  order: number;
}

export interface Phrase {
  id: string;
  text: string;
  /** em quais tipos de slot a frase é sugerida */
  slotTypes: SlotType[];
  /** prioridade de sugestão: categoria do preset primeiro, depois as demais */
  categories: CategoryId[];
}

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  order: number;
}

/** Valores atuais dos slots de uma criação. */
export type TemplateValues = Record<string, string>;

/** Regex dos tokens em TextElement.content */
export const TOKEN_RE = /\{\{([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g;

/** Extrai os ids de slot referenciados por um content. */
export function tokensOf(content: string): string[] {
  const ids: string[] = [];
  for (const m of content.matchAll(TOKEN_RE)) ids.push(m[1]);
  return ids;
}
