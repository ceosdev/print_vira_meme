# Print Vira Meme — Modelo de template (Etapa 5)

**Status:** v1.0 — aprovada em 2026-09-05 (9 decisões da seção 8 aceitas) · **Depende de:** [04-arquitetura.md](04-arquitetura.md)

Arquivos entregues nesta etapa (já nos caminhos definitivos do app):

| Arquivo | Conteúdo |
|---|---|
| [src/types/catalog.ts](../src/types/catalog.ts) | schema TypeScript definitivo + registro de fontes + `tokensOf()` |
| [src/content/schema.ts](../src/content/schema.ts) | schemas zod + `validateCatalog()` com regras cruzadas e editoriais |
| [src/content/categories.json](../src/content/categories.json) | as 8 categorias |
| [src/content/layouts/*.json](../src/content/layouts/) | **14 layouts** (9 free, 5 PRO) |
| [src/content/presets/humor.json](../src/content/presets/humor.json) | 3 presets de exemplo (os 50 vêm na Etapa 6) |
| [src/content/phrases/humor.json](../src/content/phrases/humor.json) | 6 frases de exemplo (~200 na Etapa 6) |

Todos os JSONs passam no `validateCatalog()` (rodado com Node 22 + zod antes desta entrega) e os `.ts` compilam em `tsc --strict`.

---

## 1. Visão geral do modelo

```
Layout  (estrutura visual, JSON)          ──┐
  ├─ canvas 1080 × (1080 | 1350)            │  templateEngine.resolve()
  ├─ slots[]     o que o usuário edita      ├──────────────────────────► elementos finais ──► MemeCanvas
  └─ elements[]  image | text | rect | brand │        ▲
Preset  (layoutId + values + categoria)    ──┘        │
Phrase  (sugestões por SlotType + categoria) ── editor (TextSheet)
```

- **Layout** define *onde* e *como*. **Preset** define *o quê* (textos padrão) e é o "template" que o usuário vê. **Frase** alimenta as sugestões.
- Um texto referencia slots por token `{{slot-id}}` dentro de `content` — pode misturar literal e token (`"POV: {{pov}}"`, `"{{score-a}} × {{score-b}}"`).
- Coordenadas em **pixels de canvas**; o renderizador multiplica por `scale`.

## 2. Semântica de renderização (o que o `templateEngine` garante)

| Regra | Comportamento |
|---|---|
| **Tokens** | `{{id}}` é substituído pelo valor atual do slot (`values[id]`), com `uppercase` aplicado depois. Token sem valor vira string vazia. |
| **`hideWhenEmpty`** (text) | O elemento some quando *todos* os tokens do `content` estão vazios. Texto sem token nunca some por essa regra. |
| **`showIf`** (qualquer elemento) | O elemento só é desenhado se o slot indicado tiver valor não vazio. Serve para esconder o *fundo* de um texto opcional (balão da conversa, barra da enquete, linha da assinatura). |
| **`optional`** (slot) | Pode ficar vazio. O validador exige que todo texto que use um slot opcional tenha `hideWhenEmpty` ou `showIf`. |
| **`placeholder`** (slot) | Aparece em cinza no editor quando o slot está vazio; **nunca** é exportado. |
| **`fontRole`** | `display`: recebe a fonte escolhida pelo usuário (só fontes `selectable`). `body`: mantém a fonte do layout; no PRO aceita cor. `fixed`: nunca muda. |
| **autoFit** | `<Text numberOfLines={maxLines} adjustsFontSizeToFit minimumFontScale={minFontSize/fontSize}>`; `minFontSize` padrão = 60% de `fontSize`. |
| **`outline`** | 8 cópias deslocadas (±width nos 8 vizinhos) na cor do contorno + sombra. |
| **`valign`** | `justifyContent` do contêiner do texto (`top` padrão). |
| **`lineHeight`** | multiplicador; padrão 1.1 em `display`, 1.3 em `body`/`fixed`. |
| **z-order** | ordem do array `elements`. |
| **`rotation`** | graus em torno do centro do elemento (usado no Bilhete e no rabo do Balão). O validador checa a caixa *não rotacionada* dentro do canvas. |
| **`brand`** | Free: desenhado (`footer` = faixa 64 px "PRINT VIRA MEME" em Bebas 36; `pill` = pílula translúcida "printvirameme" em Rubik-Bold 30, alinhada à direita/baixo da caixa). PRO: não desenhado; se `canvas.heightWithoutBrand` existir, o canvas encolhe para esse valor. |
| **`image.defaultFit`** | `cover` (pan/zoom pelo usuário) ou `contain-blur` (foto inteira sobre ela mesma desfocada). O usuário alterna com "Preencher / Encaixar". |
| **`draggable`** | PRO pode arrastar; posição vai para `creation.positions[id]`. |

## 3. Tipos de slot (`SlotType`) e migração entre layouts

| Tipo | Uso | Exemplos de layout |
|---|---|---|
| `top` / `bottom` | textos do meme clássico | classic |
| `title` | manchete, título, pergunta | noticia, manchete, alerta, enquete, podio, grafico |
| `description` | subtítulo, motivo, detalhe | noticia, manchete, alerta, certificado |
| `pov` | complemento de "POV:" | pov |
| `caption` | legenda de foto / rodapé | legenda, balao |
| `name` | pessoa, time, contato | placar, conversa, podio, certificado |
| `score` | número do placar | placar |
| `stat` | "Atrasos: 5" | placar |
| `message` | balão de conversa | conversa |
| `option` | opção de enquete | enquete |
| `label` | kicker, eixo, assinatura, data, fonte | noticia, manchete, grafico, certificado |
| `free` | texto livre | nota, balao |

**Migração ("Outro template com esta foto"):** para cada slot do layout novo, na ordem, pega o primeiro valor ainda não usado do layout antigo **com o mesmo `type`** que o usuário tenha editado (diferente do padrão do preset antigo); senão usa o padrão do preset novo. Assim "EU: HOJE VOU DORMIR CEDO" (top) não vai parar num slot `score`, mas um `title` editado migra da notícia para a manchete.

## 4. Regras do validador (`validateCatalog`)

**Erros** (bloqueiam build/OTA): ids kebab-case e únicos · cores válidas · layout com exatamente 1 `image` e 1 `brand` · todo elemento dentro do canvas · `showIf`/tokens apontando para slots existentes · todo slot usado por algum texto · `minFontSize ≤ fontSize` · `display` só com fonte `selectable` · layout free sem fonte premium · brand `footer` ocupa a largura toda, encosta na base e bate com `heightWithoutBrand`; brand com altura ≥ 52 · preset aponta para layout existente, só usa slots dele, preenche todos os obrigatórios, respeita `maxChars` · preset free não usa layout premium · frase com ≥ 1 `slotType` e ≥ 1 categoria.

**Avisos** (viram erro com `strict: true`, no CI): categoria com < 3 presets · categoria com < 50% free · texto usando slot opcional sem `hideWhenEmpty`/`showIf` · tag repetindo a categoria primária · categoria ausente.

## 5. Catálogo de layouts do MVP (14)

| Layout | Canvas | Plano | Slots (tipo) | Brand | Ideia |
|---|---|---|---|---|---|
| `classic` Meme clássico | 1080² | Free | top, bottom* | pill | foto inteira, Anton com contorno em cima/embaixo |
| `noticia` Notícia urgente | 1350 | Free | title, description*, source* (label) | footer | tarja vermelha "🚨 URGENTE" + "AO VIVO", foto, manchete, descrição |
| `pov` POV | 1080² | Free | pov | pill | foto inteira com faixa escura e "POV: …" em Bebas |
| `placar` Placar | 1350 | Free | name-a, score-a, name-b, score-b, stat-1, stat-2*, stat-3* | footer | "FINAL", foto, barra de placar amarela, 3 linhas de estatística |
| `manchete` Manchete | 1350 | Free | kicker* (label), title, description* | footer | "jornal": papel, chapéu vermelho, manchete grande, foto, legenda |
| `legenda` Legenda | 1350 | Free | caption | pill | foto em cima, legenda centralizada embaixo — o mais versátil |
| `conversa` Conversa | 1350 | Free | contact (name), m1, m2, m3* (message) | pill | app de mensagens com estilo próprio (cinza/amarelo), foto como imagem enviada |
| `alerta` Alerta | 1350 | Free | title, description* | footer | faixa amarela "⚠️ ATENÇÃO", foto, aviso em Anton amarelo |
| `enquete` Enquete | 1350 | Free | question (title), opt1, opt2, opt3* (option) | pill | pergunta, foto, 3 barras (94% / 5% / 1% — a primeira sempre ganha) |
| `podio` Pódio | 1350 | **PRO** | title, name-1, name-2, name-3 | pill | foto em círculo sobre o bloco 1; blocos prata/ouro/bronze |
| `grafico` Gráfico | 1350 | **PRO** | title, legend, l-1…l-4 (label) | footer | 4 barras crescentes (a última vermelha), foto em círculo no canto |
| `certificado` Certificado | 1350 | **PRO** | name, reason (description), signature*, date* (label) | pill | borda dourada dupla, foto em medalhão, assinatura em Permanent Marker |
| `nota` Bilhete | 1350 | **PRO** | note (free) | pill | foto inteira + post-it amarelo rotacionado com fita e texto manuscrito |
| `balao` Balão de fala | 1350 | **PRO** | speech (free), caption* | pill | balão de quadrinho com rabo, Bangers; legenda amarela opcional no rodapé |

\* = opcional. Todos originais: nenhum copia identidade visual de app, emissora ou marca.

## 6. Exemplos completos

### 6.1 Layout `classic` (Free)

```json
{
  "id": "classic",
  "name": "Meme clássico",
  "version": 1,
  "canvas": { "width": 1080, "height": 1080 },
  "background": "#000000",
  "premium": false,
  "slots": [
    { "id": "top", "label": "Texto de cima", "type": "top", "maxChars": 80, "maxLines": 3, "multiline": true, "placeholder": "EU: HOJE VOU DORMIR CEDO" },
    { "id": "bottom", "label": "Texto de baixo", "type": "bottom", "maxChars": 80, "maxLines": 3, "multiline": true, "placeholder": "EU ÀS 3 DA MANHÃ:", "optional": true }
  ],
  "elements": [
    { "id": "photo", "type": "image", "x": 0, "y": 0, "width": 1080, "height": 1080, "defaultFit": "cover" },
    { "id": "top-text", "type": "text", "content": "{{top}}", "fontRole": "display", "font": "anton",
      "fontSize": 84, "minFontSize": 48, "color": "#FFFFFF", "align": "center", "valign": "top", "uppercase": true,
      "outline": { "color": "#000000", "width": 6 }, "shadow": true, "hideWhenEmpty": true, "draggable": true,
      "x": 40, "y": 40, "width": 1000, "height": 260 },
    { "id": "bottom-text", "type": "text", "content": "{{bottom}}", "fontRole": "display", "font": "anton",
      "fontSize": 84, "minFontSize": 48, "color": "#FFFFFF", "align": "center", "valign": "bottom", "uppercase": true,
      "outline": { "color": "#000000", "width": 6 }, "shadow": true, "hideWhenEmpty": true, "draggable": true,
      "x": 40, "y": 700, "width": 1000, "height": 260 },
    { "id": "brand", "type": "brand", "variant": "pill", "x": 560, "y": 1000, "width": 480, "height": 56 }
  ]
}
```

### 6.2 Layout `noticia` (Free, brand footer)

Ver [noticia.json](../src/content/layouts/noticia.json). Pontos de atenção: `heightWithoutBrand: 1286` (no PRO o canvas encolhe e a faixa some); `source` é `label` opcional com `hideWhenEmpty`; a tarja "🚨 URGENTE" e o selo "AO VIVO" são textos `fixed` (o usuário não muda).

### 6.3 Preset + frases

```json
{
  "id": "humor-academia-segunda",
  "layoutId": "noticia",
  "name": "Academia na segunda",
  "category": "humor",
  "values": {
    "title": "Brasileiro promete começar a academia na segunda-feira",
    "description": "Segundo fontes, é a 14ª segunda-feira consecutiva com a mesma promessa.",
    "source": "Fonte: ele mesmo"
  },
  "premium": false, "popular": true, "addedAt": "2026-09-05", "order": 3
}
```

```json
{ "id": "hum-caption-001", "text": "Só mais cinco minutinhos", "slotTypes": ["caption", "top", "free"], "categories": ["humor"] }
```

Uma frase pode servir a vários tipos de slot; a sugestão no editor filtra por `slotTypes` contendo o tipo do slot aberto e ordena pela categoria do preset.

## 7. Template Builder (futuro) — o que o modelo já permite

Como tudo é JSON validado por zod, o builder interno (fora do app) é um formulário que edita `Layout` e mostra um preview com o mesmo `MemeCanvas` (via Expo Web ou um app de desenvolvimento). Ele não precisa de nada além de: escolher tipo de elemento, arrastar caixas, editar propriedades e rodar `validateCatalog`. Nenhuma mudança de schema é necessária para isso.

## 8. Decisões desta etapa para você aprovar

| # | Decisão | Rec. |
|---|---|---|
| 1 | **14 layouts** no MVP: 9 free (classic, noticia, pov, placar, manchete, legenda, conversa, alerta, enquete) + 5 PRO (podio, grafico, certificado, nota, balao) | sim |
| 2 | Tokens `{{slot-id}}` dentro de `content`, misturáveis com texto literal | sim |
| 3 | `hideWhenEmpty` (texto) + `showIf` (qualquer elemento) como mecanismo de opcionalidade | sim |
| 4 | Registro de fontes com `selectable`/`premium`; `display` só com fontes selecionáveis; layout free nunca usa fonte PRO (validador) | sim |
| 5 | `rotation` suportado (Bilhete, rabo do Balão); caixa não rotacionada precisa caber no canvas | sim |
| 6 | Enquete com percentuais fixos 94/5/1 (a piada é a primeira opção sempre ganhar) | sim |
| 7 | Caixa do brand `pill` = 480×56 no canto inferior direito; `footer` = faixa de 64 px | sim |
| 8 | Regras de catálogo completo (≥ 3 presets e ≥ 50% free por categoria) como **avisos** agora e **erros** no CI (`strict`) | sim |
| 9 | Slot `type` como base da migração de valores entre layouts | sim |

**Próxima etapa após aprovação:** Etapa 6 — Conteúdo (50 presets distribuídos nas 8 categorias + ~200 frases, todos validados).
