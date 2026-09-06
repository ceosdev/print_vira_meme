# Print Vira Meme — Arquitetura (Etapa 4)

**Status:** v1.0 — aprovada em 2026-09-05 (13 decisões da seção 17 aceitas; package `com.cartech.printvirameme` confirmado) · **Depende de:** [01-product-spec.md](01-product-spec.md) · [02-ux.md](02-ux.md) · [03-ui.md](03-ui.md)

---

## 0. Resumo das escolhas

| Preocupação | Escolha | Por quê (curto) |
|---|---|---|
| Base | Expo SDK estável mais recente (54+), New Architecture, Hermes, TypeScript strict | padrão atual; dev build obrigatório de qualquer forma (anúncios, compras, share intent) |
| Rotas | Expo Router (`src/app`) | file-based, deep link e modal nativos |
| Estado | Zustand; `persist` + AsyncStorage só para o que precisa sobreviver | simples, testável, sem boilerplate |
| Renderização do meme | **Views do React Native** + `react-native-view-shot` | flexível, emoji e fontes "de graça", mesmo componente para preview e exportação; Skia fica como plano B |
| Fidelidade preview ↔ export | canvas renderizado em **`1080 / PixelRatio` px lógicos** nos dois casos | quebra de linha idêntica e bitmap de exatamente 1080 px sem intermediário gigante |
| Imagens | `expo-image` (exibição) · `expo-image-picker` (galeria/câmera) · `expo-image-manipulator` (redimensionar) | módulos oficiais; Photo Picker do Android sem permissão |
| Gestos/animação | Reanimated + Gesture Handler; `@gorhom/bottom-sheet` | pan/zoom na UI thread; sheets sólidas |
| Compartilhar/salvar | `expo-sharing` · `expo-media-library` | share sheet nativa; salvar sem permissão de leitura |
| Share intent | `expo-share-intent` | única opção madura para Expo; validar no 1º dev build |
| Compras | **RevenueCat** (`react-native-purchases`) atrás de `PurchaseService` | tira acknowledge/restore/entitlements/validação do nosso colo sem backend; `expo-iap` documentado como alternativa |
| Anúncios | `react-native-google-mobile-ads` (AdMob) | padrão de mercado; interstitial/rewarded; plugin Expo |
| Analytics | **PostHog** (`posthog-react-native`) | funis e retenção prontos, sem config nativa, free tier folgado |
| Crashes | **Sentry** (`@sentry/react-native`) | plugin Expo, sourcemaps via EAS, free tier |
| Conteúdo | JSON em `src/content/`, validado por **zod**, entregue por **EAS Update** | offline-first; novidades sem release |
| Fontes | TTF em `assets/fonts` embarcadas pelo plugin do `expo-font` | sem carregamento assíncrono, sem "flash" no canvas |
| Testes | Jest (`jest-expo`) + Testing Library; script `validate-catalog`; Maestro no checklist de release | cobre engine, regras e catálogo; caminho de ouro em aparelho real |

---

## 1. Estrutura de pastas

Mantive a sua proposta (organização por tipo) e adicionei `content/`, `canvas/`, `hooks/`, `theme/` e `tools/`. Rotas ficam em `src/app` (o Expo Router aceita `src/app`).

```
print-vira-meme/
├── app.config.ts              nome, package, plugins, permissões bloqueadas, extra (chaves públicas)
├── eas.json                   perfis: development (dev client), preview (APK), production (AAB)
├── package.json · tsconfig.json · babel.config.js · jest.config.js
├── assets/
│   ├── fonts/                 Anton, BebasNeue, Oswald, Rubik, Bangers, LilitaOne, ArchivoBlack, PermanentMarker (+ OFL.txt)
│   └── images/                icon.png, adaptive-icon-*.png, splash.png, sample-photo.jpg (foto-exemplo própria)
├── src/
│   ├── app/                   rotas (Expo Router)
│   │   ├── _layout.tsx        Stack, providers, hidratação, ExportHost, entrada por share intent
│   │   ├── index.tsx          Home
│   │   ├── templates.tsx
│   │   ├── editor.tsx
│   │   ├── result.tsx
│   │   ├── pro.tsx            modal
│   │   └── settings.tsx
│   ├── components/
│   │   ├── ui/                Button, Chip, BottomSheet, Toast, ListItem, Skeleton, Screen, Header
│   │   ├── canvas/            MemeCanvas, elements/{ImageElement,TextElement,RectElement,BrandElement}, ExportHost, useCanvasScale
│   │   ├── editor/            SlotField, FontChip, StyleControls, TextSheet, PhotoSheet, ImageGestureLayer
│   │   ├── home/              HeroButton, ProCard, SectionHeader, PresetCarousel
│   │   ├── TemplateCard.tsx · PremiumBadge.tsx · ProPill.tsx · ProLiteSheet.tsx
│   ├── content/               catálogo (dados, não código)
│   │   ├── categories.json
│   │   ├── layouts/*.json     ~15 layouts
│   │   ├── presets/*.json     75 presets, 1 arquivo por categoria
│   │   ├── phrases/*.json     ~200 frases, 1 arquivo por categoria
│   │   ├── schema.ts          zod schemas (Layout, Preset, Phrase, Category)
│   │   └── index.ts           carrega, valida (em dev), indexa (por id, por categoria, por slotType)
│   ├── services/              1 interface + 1 implementação cada; mocks em __mocks__/
│   │   ├── imageService.ts    importar/redimensionar/limpar cache
│   │   ├── exportService.ts   renderizar off-screen + capturar
│   │   ├── shareService.ts    share sheet
│   │   ├── mediaService.ts    salvar na galeria
│   │   ├── shareIntentService.ts
│   │   ├── purchaseService.ts RevenueCat
│   │   ├── adsService.ts      AdMob
│   │   ├── analyticsService.ts PostHog
│   │   └── crashService.ts    Sentry
│   ├── store/
│   │   ├── creationStore.ts   memória
│   │   ├── entitlementStore.ts persist
│   │   ├── countersStore.ts   persist
│   │   └── prefsStore.ts      persist
│   ├── hooks/                 useCatalog, useExport, useAdGate, usePaywall, useShareIntentEntry, useToast
│   ├── utils/
│   │   ├── templateEngine.ts  substituição de variáveis, visibilidade, migração de valores entre layouts
│   │   ├── imageTransform.ts  limites de pan/zoom, enquadramento inicial
│   │   └── adRules.ts · paywallRules.ts   funções puras (testáveis)
│   ├── theme/                 tokens.ts, typography.ts, fonts.ts
│   ├── types/                 catalog.ts, creation.ts, services.ts, analytics.ts
│   └── i18n/strings.ts        todos os textos da interface (pt-BR)
├── tools/
│   ├── validate-catalog.ts    roda os schemas + regras editoriais (CI e pre-commit)
│   └── template-builder/      futuro (ferramenta local que gera JSON)
└── docs/                      estas specs
```

**Regra de dependência:** `app → hooks → store/services → utils/types`. Componentes não importam serviços diretamente (recebem via hooks). `content/` só é lido por `useCatalog`/`templateEngine`.

---

## 2. Entidades e tipos

Tipos principais (o schema **definitivo** dos layouts, com todas as opções de elemento, é a Etapa 5 — aqui está a forma).

```ts
// types/catalog.ts
export type CategoryId =
  | 'humor' | 'trabalho' | 'relacionamento' | 'dinheiro'
  | 'futebol' | 'familia' | 'faculdade' | 'role';

export type FontId =
  | 'anton' | 'bebas' | 'oswald' | 'rubik'            // free (rubik só como fonte fixa)
  | 'bangers' | 'lilita' | 'archivo' | 'marker';      // PRO

export type SlotType =
  | 'top' | 'bottom' | 'title' | 'description' | 'pov' | 'caption'
  | 'name' | 'score' | 'stat' | 'message' | 'option' | 'label' | 'free';

export interface Slot {
  id: string;            // "title"
  label: string;         // "Título" (rótulo no editor)
  type: SlotType;        // liga às frases sugeridas
  maxChars: number;
  maxLines: number;
  multiline: boolean;
  placeholder?: string;
  optional?: boolean;    // vazio => elemento some na exportação
}

export interface Layout {
  id: string;
  name: string;
  version: 1;
  canvas: { width: 1080; height: 1080 | 1350; heightWithoutBrand?: number };
  background: string;
  premium: boolean;
  slots: Slot[];
  elements: LayoutElement[];   // ordem = z-order
}

export type LayoutElement = ImageElement | TextElement | RectElement | BrandElement;

interface BaseElement {
  id: string; x: number; y: number; width: number; height: number;
  rotation?: number; opacity?: number;
}
export interface ImageElement extends BaseElement {
  type: 'image'; radius?: number; defaultFit: 'cover' | 'contain-blur';
}
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;                       // "{{title}}" | "🚨 URGENTE" | "POV: {{pov}}"
  fontRole: 'display' | 'body' | 'fixed';
  font: FontId;                          // fonte do layout (usuário troca só em 'display')
  fontSize: number; minFontSize?: number;
  color: string;
  align: 'left' | 'center' | 'right'; valign?: 'top' | 'middle' | 'bottom';
  uppercase?: boolean; lineHeight?: number; letterSpacing?: number;
  outline?: { color: string; width: number }; shadow?: boolean;
  hideWhenEmpty?: boolean; draggable?: boolean;
}
export interface RectElement extends BaseElement {
  type: 'rect'; fill: string; radius?: number; border?: { color: string; width: number };
}
export interface BrandElement extends BaseElement {
  type: 'brand'; variant: 'footer' | 'pill';
}

export interface Preset {
  id: string; layoutId: string; name: string;
  category: CategoryId; tags?: CategoryId[];
  values: Record<string, string>;   // slotId -> texto padrão
  premium: boolean; popular?: boolean; addedAt: string; order: number;
}

export interface Phrase { id: string; text: string; slotTypes: SlotType[]; categories: CategoryId[]; }
export interface Category { id: CategoryId; name: string; emoji: string; order: number; }
```

```ts
// types/creation.ts
export type ImageSource = 'gallery' | 'camera' | 'share_intent';
export interface ImportedImage { uri: string; thumbUri: string; width: number; height: number; source: ImageSource; }
export interface ImageTransform { scale: number; offsetX: number; offsetY: number; fit: 'cover' | 'contain-blur'; }
export interface StyleChoice { font?: FontId; caps: boolean; color?: string; outline?: boolean; }
export interface ExtraText { id: string; content: string; x: number; y: number; }           // PRO "+ Texto"

export interface Creation {
  image?: ImportedImage;
  presetId?: string; layoutId?: string;
  values: Record<string, string>;
  positions: Record<string, { x: number; y: number }>;   // PRO: textos arrastados
  extraTexts: ExtraText[];
  imageTransform: ImageTransform;
  style: StyleChoice;
  lastExport?: ExportResult;
}

export type ExportQuality = 'standard' | 'hd';
export interface ExportResult { uri: string; width: number; height: number; format: 'jpg' | 'png'; quality: ExportQuality; hasBrand: boolean; }
```

```ts
// types/services.ts (contratos — cada serviço tem uma implementação real e um mock)
export interface ImageService {
  pick(source: 'gallery' | 'camera'): Promise<ImportedImage | 'cancelled' | 'denied' | 'error'>;
  importUri(uri: string, source: ImageSource): Promise<ImportedImage>;
  cleanupCache(maxAgeMs: number): Promise<void>;
}
export interface ExportRequest {
  layout: Layout; values: Record<string, string>; positions: Creation['positions']; extraTexts: ExtraText[];
  image: ImportedImage; imageTransform: ImageTransform; style: StyleChoice;
  showBrand: boolean; quality: ExportQuality;
}
export interface ExportService { exportMeme(req: ExportRequest): Promise<ExportResult>; }
export interface ShareService { shareImage(uri: string, mime: 'image/jpeg' | 'image/png'): Promise<'opened' | 'unavailable' | 'error'>; }
export interface MediaService { saveToGallery(uri: string): Promise<'saved' | 'denied' | 'error'>; }

export type PurchaseOutcome =
  | { status: 'purchased' | 'restored' } | { status: 'none' | 'cancelled' | 'offline' }
  | { status: 'error'; message: string };
export interface PurchaseService {
  init(): Promise<void>;
  getProPrice(): Promise<string | null>;          // "R$ 19,90" vindo da Play
  purchasePro(): Promise<PurchaseOutcome>;
  restore(): Promise<PurchaseOutcome>;
  onEntitlementsChange(cb: (e: { isPro: boolean; packIds: string[] }) => void): () => void;
}
export interface AdsService { init(): void; preloadInterstitial(): void; showInterstitial(): Promise<'shown' | 'not_ready' | 'error'>; }
export interface AnalyticsService { track(e: AnalyticsEvent): void; setEnabled(v: boolean): void; }
```

```ts
// types/analytics.ts — união discriminada: impossível emitir evento com prop errada
export type AnalyticsEvent =
  | { name: 'app_open'; entry: 'launcher' | 'share_intent' }
  | { name: 'image_selected'; source: ImageSource }
  | { name: 'preset_selected'; presetId: string; layoutId: string; category: CategoryId; premium: boolean }
  | { name: 'suggestion_used'; phraseId: string }
  | { name: 'text_edited'; slotType: SlotType }
  | { name: 'meme_exported'; presetId: string; quality: ExportQuality; hasBrand: boolean; durationMs: number }
  | { name: 'export_failed'; reason: string }
  | { name: 'meme_shared'; presetId: string }
  | { name: 'meme_saved'; presetId: string }
  | { name: 'remake_same_photo' }
  | { name: 'paywall_shown'; trigger: PaywallTrigger }
  | { name: 'purchase_started' | 'purchase_completed' | 'purchase_restored'; sku: string }
  | { name: 'ad_shown'; type: 'interstitial' | 'rewarded' };
export type PaywallTrigger =
  | 'premium_template' | 'premium_font' | 'premium_style' | 'remove_watermark'
  | 'share_milestone' | 'ad_close' | 'home_card' | 'settings';
```

---

## 3. Gerenciamento de estado

Quatro stores Zustand, pequenas e com responsabilidade única:

| Store | Persistência | Conteúdo | Observações |
|---|---|---|---|
| `creationStore` | memória | `Creation` + ações: `setImage`, `setPreset` (migra valores por `slot.type`), `setValue`, `setStyle`, `setImageTransform`, `setPosition`, `addExtraText`, `setLastExport`, `reset`, `keepPhotoReset` ("outro template") | perdida se o processo morrer — por design |
| `entitlementStore` | `persist` (AsyncStorage) | `isPro`, `packIds`, `updatedAt` | fonte de verdade offline; atualizada pelo `purchaseService` |
| `countersStore` | `persist` | `exports`, `shares`, `exportsSinceAd`, `lastAdAt`, `shareMilestoneShown`, `adCloseCount` | alimenta `adRules`/`paywallRules` |
| `prefsStore` | `persist` | `analyticsEnabled`, `lastCategory` | |

- Hidratação: `_layout.tsx` segura a splash (`expo-splash-screen`) até `persist.hasHydrated()` dos três stores persistidos (≈ dezenas de ms).
- Seletores finos (`useCreationStore(s => s.values[slotId])`) para o canvas não re-renderizar inteiro a cada tecla.
- Regras de negócio **fora** dos stores, em funções puras: `adRules.shouldShowInterstitial(counters, isPro, now, adReady)`, `paywallRules.contextFor(trigger)`, `templateEngine.migrateValues(from, to, values)`. Testáveis sem React.

---

## 4. Renderização dos templates

### 4.1 `MemeCanvas`

```tsx
<MemeCanvas
  layout={layout}
  values={values}            // slotId -> texto
  image={image}              // ImportedImage (uri ou thumbUri, conforme o uso)
  imageTransform={t}
  style={style}
  positions={positions}
  extraTexts={extraTexts}
  showBrand={!isPro}
  scale={scale}              // px lógicos por px de canvas
  interactive={false}        // true só no editor (gestos e toque em texto)
/>
```

- Um `View` com `width = 1080·scale`, `height = canvas.height·scale`, `overflow: 'hidden'`, fundo `layout.background`.
- Cada elemento vira um `View` posicionado em absoluto: `left = x·scale`, `top = y·scale`, etc. A ordem do array é o z-order.
- `templateEngine.resolve(layout, values, style, positions, showBrand)` produz a lista final de elementos já com: texto substituído (`{{slot}}` → valor, com `uppercase` aplicado), elementos ocultos removidos (`hideWhenEmpty` / brand no PRO), fonte final (`display` recebe `style.font`), posição final (`positions` do PRO), altura do canvas (sem o rodapé no PRO quando `heightWithoutBrand`).
- **Texto:** `<Text>` com `fontFamily`, `fontSize·scale`, `numberOfLines = maxLines`, `adjustsFontSizeToFit`, `minimumFontScale = minFontSize/fontSize`, `allowFontScaling={false}`, `includeFontPadding={false}`. Alinhamento vertical via `justifyContent` no contêiner.
- **Contorno:** o RN não tem *stroke* de texto. O `TextElement` com `outline` renderiza **8 cópias deslocadas** (±w nos 8 vizinhos) na cor do contorno atrás do texto principal + `textShadow`. Custo: ~9 nós por slot contornado — irrelevante para 2–3 slots por layout.
- **Imagem:** `expo-image` dentro de um contêiner com `overflow: 'hidden'` e `borderRadius`. `cover`: a imagem é dimensionada para cobrir o slot e recebe `transform: [{translateX}, {translateY}, {scale}]` a partir de `imageTransform`. `contain-blur`: duas imagens — a de fundo com `blurRadius` (suportado pelo `expo-image` no Android) + overlay escuro 30%, e a de frente com `contentFit="contain"`.
- **Brand:** `BrandElement` desenha o rodapé ou a pill conforme a Etapa 3 (é um `View` + `Text`, nada especial).
- **Cards:** `TemplateCard` usa o mesmo `MemeCanvas` com `scale = larguraDoCard / 1080` e `image.thumbUri`. Renderiza na escala do card (texto nítido); a quebra de linha pode diferir levemente do editor — aceitável para miniatura.

### 4.2 Fidelidade e escala — a decisão central

Preview do editor e exportação usam **a mesma escala lógica: `RENDER_SCALE = 1 / PixelRatio.get()`**.

- O canvas do editor é renderizado com `1080 · RENDER_SCALE` px lógicos de largura (≈ 393 lógicos num aparelho de DPR 2,75 — quase a largura da tela) e **ajustado ao contêiner com `transform: scale`** (que não afeta o layout do texto).
- A instância de exportação usa exatamente a mesma escala → **quebra de linha e `autoFit` idênticos** ao que o usuário viu.
- Ao capturar, o bitmap tem `1080·RENDER_SCALE·PixelRatio = 1080 px` físicos: **sem intermediário gigante** (1080×1350×4 ≈ 5,8 MB) e sem *upscale* borrado. Passamos `width/height` ao `captureRef` só para normalizar arredondamentos de ±1 px.
- **HD (PRO):** segunda instância com `RENDER_SCALE·2` → 2160 px, PNG. Diferenças de quebra de linha em relação ao preview são teoricamente possíveis (arredondamento), na prática invisíveis, e é um bônus.

### 4.3 Exportação (`exportService` + `ExportHost`)

1. `useExport().run(quality)` monta o `ExportRequest` a partir dos stores e chama `exportService.exportMeme`.
2. `ExportHost` (montado uma vez no `_layout`) renderiza um `MemeCanvas` **fora da tela** (`position: 'absolute', left: -10000`, `collapsable={false}`) só enquanto há um job.
3. Espera `onLoad` da imagem do `expo-image` + um frame (`requestAnimationFrame`) para garantir layout e pintura.
4. `captureRef(ref, { format: 'jpg' | 'png', quality: 0.9, width, height, result: 'tmpfile' })` (`react-native-view-shot`).
5. Move o arquivo para `cacheDirectory/exports/meme-<timestamp>.<ext>` (`expo-file-system`), desmonta a instância, devolve `ExportResult`.
6. Timeout de 8 s → `export_failed('timeout')`. Qualquer exceção → `export_failed(reason)`; a UI oferece "Tentar de novo".

**Plano B (não é o plano):** se em aparelhos reais aparecerem diferenças de fidelidade ou custo de memória inaceitável, `MemeCanvas` ganha uma implementação em `@shopify/react-native-skia` com a **mesma interface** (Skia tem stroke, blur e snapshot em pixels exatos nativos; perde em emoji/fontes de sistema e em layout de texto fluido). Nada fora de `components/canvas/` muda.

---

## 5. Imagens: importação, memória e cache

- `imageService.pick('gallery')` → `ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, exif: false })`; `pick('camera')` → `launchCameraAsync`. No Android 13+ o Photo Picker do sistema dispensa permissão de leitura.
- Todo caminho (galeria, câmera, share intent) passa por `importUri`, que usa o `expo-image-manipulator` para gerar:
  - **`uri`**: lado maior limitado a **1600 px**, JPEG 0,9 (uma foto de 12 MP decodificada ocupa ~48 MB; em 1600 px, ~7 MB).
  - **`thumbUri`**: lado maior **480 px**, para os cards.
  - Depois apaga o arquivo original que o picker copiou para o cache.
- Arquivos ficam em `cacheDirectory/images/` e `cacheDirectory/exports/`; `cleanupCache(24h)` roda em segundo plano na abertura do app. Nada é gravado fora do cache sem o usuário tocar "Salvar".
- `expo-image` decodifica no tamanho da view (Glide), então os cards nunca decodificam a foto de 1600 px.
- **Permissões (Play "Photo and Video Permissions"):** o app **não** pede `READ_MEDIA_IMAGES`/`READ_EXTERNAL_STORAGE`. Em `app.config.ts`, `android.blockedPermissions` remove as que `expo-media-library`/`expo-image-picker` declaram por padrão; ficam `CAMERA` e `WRITE_EXTERNAL_STORAGE` (ignorada a partir do Android 10, necessária no 9 para salvar).
- Salvar: `MediaLibrary.requestPermissionsAsync(true /* writeOnly */)` + `MediaLibrary.saveToLibraryAsync(uri)`. Álbum "Print Vira Meme" é melhor esforço (só quando não exigir permissão extra); caso contrário vai para Pictures.

---

## 6. Gestos no editor

- `ImageGestureLayer` (só com `interactive`) sobrepõe o slot de imagem com `Gesture.Simultaneous(Gesture.Pan(), Gesture.Pinch())` do Gesture Handler; `scale`/`offsetX`/`offsetY` são *shared values* do Reanimated aplicados ao `expo-image` via `useAnimatedStyle` — 60 fps na UI thread.
- `imageTransform.clamp()` (função pura) garante que a foto nunca deixa área vazia e limita o zoom a 3×. Toque duplo → `reset()`.
- No fim do gesto (`onEnd`), `runOnJS(setImageTransform)` grava no store — a instância de exportação aplica o mesmo transform estaticamente.
- Arrastar texto (PRO): `Gesture.Pan()` no `TextElement` com `draggable`, *snap* ao centro (±12 px de canvas), grava em `positions`.
- Toque simples em texto → abre `TextSheet` daquele slot (`Gesture.Tap()` com `maxDuration` curto para não brigar com o pan).

---

## 7. Compartilhamento e share intent

- **Sair:** `Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Compartilhar meme' })` abre a share sheet do Android (FileProvider já configurado pelo módulo). `meme_shared` é emitido ao abrir a sheet (o Android não informa conclusão). `Sharing.isAvailableAsync()` cobre o caso "sem app para compartilhar".
- **Entrar:** `expo-share-intent` (plugin de config + `ShareIntentProvider` no `_layout`). `useShareIntentEntry()` observa `hasShareIntent`; se `files[0].mimeType` começa com `image/`, chama `imageService.importUri(path, 'share_intent')`, `creationStore.setImage`, `router.replace('/templates')`, `resetShareIntent()`. Texto/link → Home + toast. Falha → Home + `PhotoSheet` com erro.
- Risco conhecido: a integração com Expo Router já exigiu *patch* em `expo-linking` em versões anteriores. Fica isolado em `shareIntentService`; se o dev build mostrar problema, o fallback (app abre na Home, usuário escolhe pela galeria) já funciona.

---

## 8. Compras (PRO e packs)

### 8.1 Escolha: RevenueCat (`react-native-purchases`)

O que o RevenueCat resolve que, sem ele, exigiria código nosso **ou** um backend:

| Necessidade | Com `expo-iap`/`react-native-iap` direto | Com RevenueCat |
|---|---|---|
| *Acknowledge* de compra em até 3 dias (senão a Play estorna) | nosso código, fácil de errar | automático |
| Restaurar em outro aparelho | `getAvailablePurchases()` + nossa lógica | `restorePurchases()` |
| Validar o *purchase token* no servidor da Play | precisa de backend + Play Developer API | feito por eles |
| Entitlements (`pro`, `pack_futebol`…) para vários SKUs | mapa manual | nativo |
| Cache offline do status | nosso | SDK cacheia `CustomerInfo` |
| Dashboards de conversão/receita/reembolso | Play Console + nosso analytics | prontos |
| Custo | 0 | 0 até US$ 2,5 mil/mês de receita; depois 1% |

Trade-offs aceitos: um SDK a mais fazendo rede na inicialização (com cache); dependência de terceiro (mitigada pela interface `PurchaseService` — trocar para `expo-iap` é reescrever um arquivo). O que **nenhum** dos dois resolve: APK modificado que força `isPro` no JS — aceito no MVP (custo do PRO é baixo; não vale ofuscação).

### 8.2 Implementação

- Play Console: produto **não consumível** `pvm_pro_lifetime` (R$ 19,90). RevenueCat: entitlement `pro`, offering `default` com o pacote `lifetime`.
- `purchaseService.init()` → `Purchases.configure({ apiKey })` **depois do primeiro frame**; `getCustomerInfo()` atualiza `entitlementStore` (`isPro = !!customerInfo.entitlements.active['pro']`, `packIds` = demais entitlements ativos). Listener `addCustomerInfoUpdateListener` mantém o store sincronizado.
- `getProPrice()` → `getOfferings().current.lifetime.product.priceString` (**preço sempre da loja**, localizado).
- `purchasePro()` → `purchasePackage(pkg)`; cancelamento do usuário vira `{status:'cancelled'}` (sem mensagem); sem rede → `'offline'`.
- `restore()` → `restorePurchases()`; se nada ativo → `'none'`.
- **Packs (v1.1):** cada pack é um não consumível `pvm_pack_<id>` com entitlement `pack_<id>`; o catálogo marca `preset.packId`; `isUnlocked(preset) = !premium || isPro || packIds.includes(packId)`.
- `usePaywall().require(trigger, continuation)`: se `isPro`, executa `continuation()`; senão abre `/pro` com o gatilho e guarda a continuação; ao comprar, executa-a (gera, re-exporta sem marca, aplica fonte).

---

## 9. Anúncios

- `react-native-google-mobile-ads` com plugin Expo (`androidAppId`). IDs de unidade em `app.config.ts › extra`; `TestIds.INTERSTITIAL` em dev/preview.
- `adsService.init()` após o primeiro frame; `preloadInterstitial()` na inicialização e após cada exibição.
- `useAdGate().runGuarded(action)` chama `adRules.shouldShowInterstitial(...)` (regras da UX 4.1); se `true`, `showInterstitial()` e **depois** `action()`; se o anúncio não está pronto, executa `action()` direto — nunca espera.
- Contadores: `meme_exported` incrementa `exports`/`exportsSinceAd`; exibir zera `exportsSinceAd` e grava `lastAdAt`, incrementa `adCloseCount` (a cada 5 → `ProLiteSheet`).
- **Consentimento:** distribuição inicial **só no Brasil** → sem formulário UMP/GDPR no MVP. Ao expandir para EEA/UK, ligar `AdsConsent` do mesmo SDK.
- Rewarded (v1.1): `RewardedAd` + `adsService.showRewarded()`; concede `unlockedPresetForSession`.

---

## 10. Analytics e crashes

- **PostHog:** `new PostHog(key, { host, captureAppLifecycleEvents: false })`; `analyticsService.track(e)` faz `posthog.capture(e.name, props)`; autocapture desligado — só os eventos tipados da seção 2. `distinctId` anônimo gerado no aparelho. Nunca texto do usuário nem caminho de arquivo. `prefsStore.analyticsEnabled=false` → `optOut()`; item "Enviar estatísticas de uso anônimas" nas Configurações.
- Funis e retenção (D1/D7/D30) saem prontos no PostHog; receita e conversão no RevenueCat; instalações/desinstalações e vitals na Play Console.
- **Sentry:** `@sentry/react-native` com o plugin Expo (`@sentry/react-native/expo`) e upload de sourcemaps no EAS Build/Update. `crashService.captureException` usado pelos serviços em falhas não fatais (exportação, compra).
- Inicialização de PostHog, Sentry, RevenueCat e AdMob acontece em `InteractionManager.runAfterInteractions` na Home — a Home aparece antes de qualquer SDK de terceiro rodar.

---

## 11. Conteúdo e entrega (offline-first)

- JSON em `src/content/` importado estaticamente (entra no bundle → funciona sem rede desde a primeira abertura).
- `content/schema.ts` (zod) valida tudo em **dev** (na primeira carga) e no script `tools/validate-catalog.ts` (CI/pre-commit), que também aplica regras editoriais: toda categoria com ≥ 3 presets e ≥ 50% free; todo layout com exatamente 1 `image`, 1 `brand` (texto ≥ 30 px) e `slots` referenciados por algum `{{slot}}`; todo `preset.values` com chaves existentes; toda frase com ≥ 1 `slotType`; ids únicos.
- Índices em memória (`byId`, `presetsByCategory`, `phrasesBySlotType`) construídos uma vez.
- **Novidades:** `expo-updates` + EAS Update (canal `production`). Como o catálogo é JS, uma atualização OTA entrega presets/frases/layouts novos sem release na Play. `checkAutomatically: ON_LOAD`, aplica no próximo start (nunca interrompe uma criação). Layouts com `version` permitem evoluir o schema sem quebrar OTA antigo.

---

## 12. Rotas e ciclo de vida

```
_layout.tsx
  ├─ GestureHandlerRootView › SafeAreaProvider › BottomSheetModalProvider › ShareIntentProvider
  ├─ segura a splash até hidratar os stores
  ├─ <Stack screenOptions={{ headerShown:false, animation:'slide_from_right' }}>
  │    index · templates · editor · result · settings
  │    pro  (presentation:'modal', animation:'slide_from_bottom')
  ├─ <ExportHost />   canvas off-screen para exportação
  ├─ <ToastHost />
  └─ useShareIntentEntry() · cleanupCache() · init de SDKs após o primeiro frame
```

Guardas de rota: `/editor` sem `image`+`preset` → `router.replace('/')`; `/result` sem `lastExport` → volta ao editor e re-exporta em silêncio. Botão voltar do Android segue o Stack (UX §1).

---

## 13. Build, distribuição e configuração

- **Package:** `com.cartech.printvirameme` (imutável após publicar — confirmar). `scheme: 'printvirameme'`. `minSdkVersion` padrão do SDK (24 = Android 7).
- **EAS Build:** `development` (dev client, APK), `preview` (APK interno para testes em aparelhos), `production` (AAB). **EAS Update:** canal por perfil. **EAS Submit** opcional.
- `app.config.ts`: `extra` com chaves **públicas** (RevenueCat public SDK key, PostHog key/host, Sentry DSN, AdMob app/unit ids); nada secreto vai no app. `android.blockedPermissions` (seção 5); plugins: `expo-router`, `expo-font` (fonts), `expo-image-picker` (texto de permissão da câmera), `expo-media-library`, `expo-share-intent`, `react-native-google-mobile-ads`, `@sentry/react-native/expo`, `expo-updates`, `expo-build-properties`.
- **Git:** `git init` no início da Etapa 7 (a pasta ainda não é repositório); `.gitignore` do Expo; `docs/` versionado.

---

## 14. Testes

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Funções puras | Jest | `templateEngine` (substituição, `hideWhenEmpty`, migração de valores por `slot.type`, altura sem brand), `imageTransform.clamp`, `adRules`, `paywallRules` |
| Catálogo | `tools/validate-catalog.ts` (zod + regras) | roda no CI e antes de cada OTA |
| Stores | Jest | ações do `creationStore` (setPreset migra valores), contadores |
| Componentes | `@testing-library/react-native` (`jest-expo`) | `TextSheet` aplica sugestão; `Editor` mostra "Desbloquear PRO e gerar" para preset premium + Free; `Result` sem link de marca no PRO; serviços mockados |
| Caminho de ouro | Maestro (aparelho real, no checklist de release) | abrir → foto → template → gerar → compartilhar → salvar; compra em sandbox (licença de teste da Play) |

Sem Detox; sem snapshot de bitmap (frágil). Fidelidade visual é verificada manualmente em 3 aparelhos (DPR 2, 2,75 e 3) antes de cada release.

---

## 15. Decisões técnicas importantes — e por quê

1. **Views + view-shot, não Skia (por enquanto).** Emojis, fontes e texto fluido funcionam sem esforço; um só componente serve card, editor e exportação; a equipe (você) itera layouts sem aprender uma API de desenho. Skia entra só se a realidade exigir, atrás da mesma interface.
2. **Escala lógica `1/PixelRatio`.** Elimina a maior fonte de bugs desse tipo de app (preview diferente do arquivo) e o maior risco de memória (bitmap 3× maior que o necessário) com uma única constante.
3. **Foto reduzida a 1600 px na importação.** Nenhum layout precisa de mais (o slot maior tem 1000 px de largura em canvas 1080). Decodificação e gestos ficam leves em aparelhos intermediários.
4. **Cards com `thumbUri` de 480 px e `expo-image`.** Seis previews ao vivo custam menos que uma foto de galeria.
5. **SDKs de terceiros inicializam depois do primeiro frame.** A Home é o produto; RevenueCat/AdMob/PostHog/Sentry não podem atrasá-la.
6. **Regras de negócio como funções puras.** AdGate e paywall são a parte mais sensível para reviews e receita — precisam de testes unitários triviais de escrever.
7. **Estado de criação só em memória.** Persistir traria arquivos de cache órfãos e telas de "recuperar rascunho" para um artefato que custa 20 s.
8. **Conteúdo em JSON + zod + EAS Update.** É o "backend" do MVP: zero servidor, validação em CI, novidades sem release.
9. **Fontes embarcadas nativamente.** O canvas precisa renderizar certo no primeiro frame; carregamento assíncrono de fonte causa "salto" e captura errada.
10. **Sem `READ_MEDIA_IMAGES`.** Além de privacidade real, evita a revisão de política de fotos/vídeos da Play, que atrasa publicações.

---

## 16. Bibliotecas (versões fixadas por `npx expo install` no SDK escolhido)

| Pacote | Para quê |
|---|---|
| `expo`, `expo-router`, `expo-dev-client`, `expo-updates`, `expo-build-properties`, `expo-constants`, `expo-splash-screen`, `expo-status-bar`, `expo-linking`, `expo-application` | base, rotas, OTA, build, splash, versão |
| `expo-image`, `expo-image-picker`, `expo-image-manipulator`, `expo-file-system` | exibir, escolher, redimensionar, mover/limpar arquivos |
| `expo-sharing`, `expo-media-library` | share sheet, salvar na galeria |
| `expo-font`, `expo-haptics`, `expo-linear-gradient` | fontes embarcadas, haptics, gradiente PRO |
| `react-native-reanimated`, `react-native-gesture-handler`, `react-native-screens`, `react-native-safe-area-context` | animação, gestos, navegação |
| `@gorhom/bottom-sheet` | sheets |
| `react-native-view-shot` | captura do canvas |
| `zustand`, `@react-native-async-storage/async-storage` | estado, persistência |
| `zod` | schema do catálogo |
| `lucide-react-native`, `react-native-svg` | ícones |
| `react-native-google-mobile-ads` | AdMob |
| `react-native-purchases` | RevenueCat |
| `expo-share-intent` | receber imagens do "Compartilhar" |
| `posthog-react-native` (+ peers opcionais `expo-device`, `expo-localization`) | analytics |
| `@sentry/react-native` | crashes |
| dev: `typescript`, `jest`, `jest-expo`, `@testing-library/react-native`, `eslint-config-expo`, `prettier`, `tsx` | qualidade, testes, scripts |

---

## 17. Decisões desta etapa para você aprovar

| # | Decisão | Rec. |
|---|---|---|
| 1 | Renderização com **Views RN + `react-native-view-shot`**; Skia como plano B atrás da mesma interface | sim |
| 2 | Canvas em **`1080/PixelRatio` px lógicos** no editor e na exportação | sim |
| 3 | `autoFit` via `adjustsFontSizeToFit`; contorno via cópias deslocadas | sim |
| 4 | Compras com **RevenueCat** atrás de `PurchaseService` (`expo-iap` como alternativa documentada) | sim |
| 5 | Anúncios com `react-native-google-mobile-ads`; **distribuição inicial só no Brasil** (sem UMP) | sim |
| 6 | Analytics **PostHog** + crashes **Sentry**; opt-out de estatísticas nas Configurações | sim |
| 7 | Share intent com `expo-share-intent`, isolado e com fallback | sim |
| 8 | Zustand + AsyncStorage para entitlements/contadores/prefs; criação só em memória | sim |
| 9 | Catálogo JSON validado por zod, entregue por EAS Update | sim |
| 10 | Estrutura por tipo em `src/` (sua proposta + `content/`, `canvas/`, `hooks/`, `theme/`, `tools/`) | sim |
| 11 | Bloquear `READ_MEDIA_IMAGES`/`READ_EXTERNAL_STORAGE`; só Photo Picker | sim |
| 12 | Package **`com.cartech.printvirameme`** (confirme — não muda depois de publicar) | confirmar |
| 13 | Testes: Jest para engine/regras/catálogo/componentes; Maestro só no checklist de release | sim |

**Próxima etapa após aprovação:** Etapa 5 — Modelo de template (schema TypeScript definitivo + zod + 10 layouts/presets reais em JSON).
