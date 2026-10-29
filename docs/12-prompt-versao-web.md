# Prompt — Print Vira Meme Web (PWA)

> Cole tudo abaixo da linha como primeira mensagem para o agente no repositório novo
> `print_vira_meme_web`, criado como pasta irmã de `print_vira_meme`
> (`~/projects/cartech/print_vira_meme_web`). O agente precisa ter acesso de leitura às duas pastas.

---

## Papel e forma de trabalhar

Você vai construir o **Print Vira Meme Web**: a versão web/PWA de um app Android (React Native + Expo) que já existe e está funcionando. Não é um produto novo: é o mesmo produto, a mesma identidade visual, o mesmo conteúdo e o mesmo motor de templates, levados para o navegador, **sem nenhuma monetização além de um botão de doação via Pix**.

Regras de trabalho, sem exceção:

1. **Português do Brasil** em tudo: código comentado, commits, interface, documentação.
2. **Trabalhe em etapas** (seção 14). Ao fim de cada etapa: rode as verificações, mostre o resultado e **pare para aprovação** antes de seguir.
3. **Conteste.** Se alguma decisão deste prompt estiver errada ou tiver um custo que eu não vi, diga antes de implementar, com o motivo e a alternativa. Não implemente em silêncio algo de que você discorda.
4. **Prove antes de dizer pronto.** Toda afirmação de "funciona" vem com a saída de um comando (teste, build, Lighthouse, Playwright). Se algo não foi verificado, diga isso.
5. **Versões:** antes de instalar qualquer coisa, confira a versão estável atual e a documentação dela; não confie na memória. Fixe as versões exatas no `package.json`.
6. Commits pequenos e descritivos, no estilo `tipo: descrição` (ex.: `render: autoFit de texto no Canvas 2D`). Não faça push sem eu pedir.

## 1. Fonte de verdade: o repositório original

O app original está em `../print_vira_meme` (caminho absoluto `/home/csantana/projects/cartech/print_vira_meme`). **Leia antes de escrever código**, nesta ordem:

| Arquivo | Para quê |
|---|---|
| `docs/01-product-spec.md` | proposta, personas, tom, loop viral (ignore a parte de PRO, anúncios e Play) |
| `docs/02-ux.md` | todas as telas, estados, mensagens de erro, microinterações. **É a especificação de UX.** Ignore §3.6, §3.6.1, §4.1, §4.2 (paywall e anúncios) |
| `docs/03-ui.md` | identidade visual, paleta, tipografia, componentes, diretrizes dos layouts, microcopy |
| `docs/04-arquitetura.md` | §2 (entidades), §4 (renderização e a decisão de escala), §5 (imagens), §6 (gestos) |
| `docs/05-modelo-template.md` | **semântica do motor de templates**: o renderizador web precisa obedecer isso à risca |
| `docs/06-conteudo.md` | linha editorial do conteúdo (§2) |
| `src/types/catalog.ts`, `src/types/creation.ts` | tipos do catálogo e da criação |
| `src/content/schema.ts`, `src/content/index.ts` | validação zod e montagem do catálogo |
| `src/utils/templateEngine.ts`, `src/utils/imageTransform.ts` | motor puro (substituição, visibilidade, migração entre layouts, `resolveLayout`, enquadramento) |
| `src/components/canvas/**` | como cada elemento é desenhado hoje (texto, contorno, sombra, brand, imagem cover/contain-blur) |
| `src/app/*.tsx`, `src/components/**` | telas e componentes atuais, para fidelidade visual e de comportamento |
| `src/theme/*.ts` | tokens (cores, espaçamentos, raios, tamanhos, durações) e tipografia |
| `src/i18n/strings.ts` | todos os textos da interface |
| `src/store/*.ts` | estado (zustand) |
| `assets/brand/*.svg`, `assets/fonts/*.ttf`, `assets/images/sample-photo.png` | marca, fontes (todas OFL) e foto de exemplo |
| `src/**/__tests__` | testes que documentam o comportamento esperado |

### O que copiar, adaptar e descartar

**Copiar quase sem mudança** (é a parte valiosa; não reescreva o que já está certo):
- `src/content/**` (19 layouts, 75 presets, 400 frases, 12 categorias) e o validador zod;
- `templateEngine.ts`, `imageTransform.ts` e os testes deles;
- tipos do catálogo e da criação, tokens de tema, `strings.ts` (com os ajustes da seção 9);
- fontes TTF (converter para woff2) e SVGs da marca;
- o script `tools/validate-catalog.ts`.

**Reescrever para a web:** todos os componentes visuais (RN `View`/`Text` → elementos DOM + CSS), o renderizador do meme (seção 4), importação de imagem, exportação, compartilhamento, salvar e gestos.

**Descartar por completo** (não porte, não deixe "desligado"): PRO, paywall (`/pro`), `ProLiteSheet`, `ProPill`, `ProCard`, `PremiumBadge`, entitlements, `usePaywall`, `useEntitlements`, `useEntitlementSync`, `paywallRules`, AdGate, `adRules`, contadores de milestone, serviços e mocks de compra e anúncio, `dev-doctor`, tudo de Expo, EAS e Play.

## 2. Decisões já tomadas

| Tema | Decisão |
|---|---|
| Stack | **Vite + React + TypeScript** (strict), **sem Next.js** |
| Rotas | React Router (versão estável atual) |
| Estado | zustand (como no original) |
| Validação | zod (como no original) |
| PWA | `vite-plugin-pwa` com estratégia `injectManifest` (o service worker precisa de código próprio para o Share Target) |
| SEO | **pré-renderização estática no build** (seção 7). O app em si continua SPA |
| Estilo | CSS Modules ou CSS puro com variáveis vindas dos tokens. Sem framework de UI; os componentes são poucos e a identidade é própria |
| Ícones | `lucide-react` (o original usa `lucide-react-native`) |
| Renderização do meme | **Canvas 2D**, desenhado a partir do layout resolvido. Nada de html2canvas, html-to-image ou SVG `foreignObject` |
| Backend | **nenhum.** Site estático. Nenhuma foto sai do aparelho |
| Hospedagem | Cloudflare Pages (estático, grátis). Domínio configurável por `VITE_SITE_URL` (placeholder `https://printvirameme.com.br`) |
| Monetização | **só doação via Pix estático** (seção 8). Nada de PRO, assinatura, anúncio ou paywall |
| Testes | Vitest + Testing Library (unidade e componentes), Playwright (e2e com emulação de celular), Lighthouse CI |
| Analytics | opcional: Cloudflare Web Analytics (sem cookies), carregado só se `VITE_CF_ANALYTICS_TOKEN` existir |

## 3. O produto na web

### 3.1 Princípios (herdados e ajustados)

- **"Pega a foto, escolhe a situação, manda."** Do acesso ao envio em menos de 20 segundos.
- **Funciona sem instalar.** Instalar é um bônus, nunca um requisito nem um pop-up que bloqueia.
- **Mobile first, sempre.** No desktop, o app aparece como uma coluna central de até ~480 px com o fundo da marca em volta. As páginas de SEO podem usar largura maior.
- **Tudo liberado para todos:** os 19 layouts e 75 presets (inclusive os 7 layouts e 26 presets que eram premium), as 8 fontes selecionáveis (inclusive Quadrinho, Fofa, Pesada e Manuscrita), cor, contorno, "+ Texto", "Mover textos" e exportação em alta resolução.
- **Privacidade:** "Suas fotos ficam no seu aparelho. Nada é enviado." Tem que ser verdade: nenhuma requisição de rede com a imagem, nem para analytics.

### 3.2 Telas e rotas

| Rota | Tela | Observações |
|---|---|---|
| `/` | Home | Hero "CRIAR MEME", carrossel 🔥 Populares, ✨ Novidades (presets com `addedAt` nos últimos 30 dias). Sem `ProCard` e sem `ProPill` no header. Link discreto "Apoiar o projeto 💛" |
| `[sheet foto]` | Seleção de foto | Galeria e Câmera (seção 5.1). Mensagem de privacidade |
| `/templates` | Catálogo | Chips de categoria + Todos/Populares/Novos; cards com preview ao vivo usando a foto do usuário (seção 4.5). Sem badge PRO. Badge NOVO continua |
| `/editor` | Editor | Textos, sheet de texto com 12 sugestões + Sortear, fontes, estilo (AA, cor, contorno), "+ Texto", "Mover textos", enquadramento (pinça e arraste, Preencher/Encaixar), Trocar foto, **Gerar meme**. Acesso direto sem criação em memória → redireciona para `/templates` |
| `/resultado` | Resultado | Imagem gerada, **Compartilhar** (primário), **Salvar**, chave "Marca do app" (seção 6), Outro template, Criar outro meme, Convidar pelo WhatsApp, cartão de doação (seção 8) |
| `/apoiar` | Doação | QR Pix + copiar código + copiar chave (seção 8) |
| `/configuracoes` | Configurações | Instalar o app (seção 5.6), Convidar amigos, Como suas fotos são tratadas, Política de privacidade, Marca do app por padrão (liga/desliga), Limpar dados locais, Apoiar o projeto, versão |
| `/privacidade` | Política de privacidade | Página estática pré-renderizada |
| `/meme/:presetId` | Página SEO do preset | Seção 7 |
| `/categoria/:categoryId` | Página SEO da categoria | Seção 7 |
| `/dev/canvas` | QA visual (só em dev) | Renderiza os 19 layouts com a foto de exemplo, lado a lado, em várias escalas. Porta o `src/app/dev-canvas.tsx`. Não entra no build de produção |

A criação continua aceitando **foto primeiro ou template primeiro** (UX §1.6 do spec): o estado da criação recebe foto e preset em qualquer ordem e os dois caminhos convergem no editor.

O estado da criação fica **em memória** (zustand). A foto **não** é persistida: se a página recarregar no editor ou no resultado, mostre o estado já previsto no original ("A foto sumiu… Escolhe de novo?"). Preferências (marca padrão, fonte padrão, instruções de instalação já vistas) ficam em `localStorage`, envolvidas em `try/catch`.

## 4. Renderizador Canvas 2D: a parte mais delicada

No app nativo, um único `MemeCanvas` desenha card, editor e exportação, e a exportação "fotografa" a view com `react-native-view-shot`. Na web isso **não** se porta: o meme passa a ser **desenhado** num `<canvas>` a partir do `ResolvedLayout` que o `resolveLayout` já produz. A regra do original continua valendo: **um único renderizador** para card, editor, exportação e imagens OG. Só muda a escala.

### 4.1 Contrato

```ts
// render/drawMeme.ts — puro, sem DOM além do contexto recebido
drawMeme(ctx: CanvasRenderingContext2D, input: {
  resolved: ResolvedLayout;          // de templateEngine.resolveLayout
  image: CanvasImageSource | null;   // ImageBitmap no browser; Image do @napi-rs/canvas no Node
  imageSize: { width: number; height: number };
  transform: ImageTransform;
  scale: number;                     // px reais por px de canvas (1080 de largura)
}): DrawReport                      // ex.: tamanho final de fonte escolhido por texto, textos truncados
```

- O módulo **não** pode depender de `window` nem de `document`. Ele precisa rodar no browser e no Node, com `@napi-rs/canvas` (para os testes de imagem e para as imagens OG do build, seção 7).
- A medição de texto usa o próprio `ctx.measureText`.

### 4.2 Semântica a reproduzir (conferir contra `docs/05-modelo-template.md` §2 e `src/components/canvas/**`)

- **Ordem dos elementos** = ordem de desenho (o último fica por cima). `rotation` gira em torno do centro do elemento; `opacity` vira `globalAlpha`.
- **`rect`:** preenchimento, `radius` (use `roundRect`) e `border`.
- **`image` em `cover`:** recorte no slot (com `radius`), retângulo calculado por `imageRect()` com zoom de 1 a 3 e deslocamento limitado por `clampTransform()`.
- **`image` em `contain-blur`:** a foto inteira centralizada sobre a própria foto ampliada e desfocada. **Não use `ctx.filter`** (suporte irregular no Safari). Desfoque desenhando a foto num canvas minúsculo (~1/16) e ampliando com `imageSmoothingQuality = 'high'`, ou com box blur manual. Sem foto: placeholder do original.
- **`text`:**
  - **Quebra de linha própria**, por palavras; uma palavra maior que a largura quebra por caractere. Respeite `\n` explícito.
  - **autoFit:** comece em `fontSize` e reduza (busca binária, passo de 1 px de canvas) até caber em `maxLines` **e** na altura da caixa (`linhas × fontSize × lineHeight`). Nunca desça de `minFontSize`. Se nem no mínimo couber, corte na última linha permitida com "…" (equivale ao `numberOfLines` do RN).
  - `align` (left/center/right) e `valign` (top/middle/bottom) dentro da caixa.
  - `letterSpacing`: use `ctx.letterSpacing` quando existir; senão, desenhe caractere a caractere, com fallback e teste dedicado.
  - **Contorno:** o original desenha 8 cópias deslocadas. No canvas, use `strokeText` com `lineWidth = 2 × outline.width`, `lineJoin = 'round'` e `miterLimit = 2`, **antes** do `fillText`. Compare visualmente com o app (seção 12) e ajuste a espessura se ficar diferente.
  - **Sombra:** `rgba(0,0,0,0.6)`, deslocamento y = 4, desfoque 12 (em px de canvas × escala), aplicada só no preenchimento.
  - **Emoji** (ex.: "🚨 URGENTE"): inclua fontes de emoji do sistema na pilha (`"Bebas Neue", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`).
- **`brand`:** variantes `footer` e `pill`, com as medidas de `CanvasBrand.tsx` (texto ≥ 30 px de canvas, legível numa miniatura de 360 px).
- **Altura do canvas** com a marca desligada = `layout.canvas.heightWithoutBrand` quando existir (é o `canvasHeight()` do motor).

### 4.3 Fontes

- Converta as 12 TTF para **woff2** com subconjunto `latin` + `latin-ext` (português e acentos). Não faça um subconjunto mais agressivo: o texto é livre.
- `@font-face` com `font-display: swap` para a interface (Rubik).
- **Antes de qualquer desenho no canvas**, aguarde as fontes que o layout usa: `await Promise.all(families.map(f => document.fonts.load(\`64px "${f}"\`)))`. Desenhar antes disso produz meme com fonte errada, o bug clássico da web. Cubra isso com um teste e2e.
- Pré-carregue (`<link rel="preload">`) só Rubik e Anton. As demais carregam sob demanda e entram no precache do service worker.

### 4.4 Editor: preview e interação

- O preview do editor é o **mesmo `drawMeme`**, num `<canvas>` dimensionado para a largura disponível × `devicePixelRatio`.
- A interação usa **camadas DOM transparentes** posicionadas sobre o canvas, nas caixas dos elementos (convertidas pela escala):
  - toque num texto abre a sheet de texto daquele slot;
  - com "Mover textos" ligado, arrastar os textos `draggable` e os extras, limitados ao canvas (`commitDrag` do original);
  - área da foto: **pinça e arraste com Pointer Events** (`touch-action: none` só nessa área), com o mesmo clamp de `clampTransform`, redesenhando via `requestAnimationFrame` e gravando no store no fim do gesto.
- Garanta que rolar a página fora da foto continue funcionando e que a pinça na foto não dê zoom na página (iOS Safari incluído).

### 4.5 Cards do catálogo com preview ao vivo

São até 75 previews com a foto do usuário. Para não travar celular fraco:
- desenhe com o **thumb de 480 px** e escala de card;
- renderize só o que está visível (`IntersectionObserver`);
- guarde o resultado em cache por `(presetId, imageId)`, como `ImageBitmap` ou object URL;
- considere desenhar num `OffscreenCanvas` dentro de um Web Worker se o profiling mostrar engasgo. Meça antes de decidir.

### 4.6 Exportação

- Canvas fora da tela em **2160 px de largura** (escala 2, a antiga "HD", agora para todos), `toBlob('image/jpeg', 0.92)`.
- Avalie se PNG vale a pena em algum layout de fundo chapado. O padrão é JPEG, porque o WhatsApp recomprime de qualquer jeito e o arquivo fica menor.
- Nome do arquivo: `print-vira-meme-<AAAAMMDD-HHmmss>.jpg`.
- Timeout de 8 s com a mensagem do original ("Deu ruim ao gerar. Tentar de novo?").
- Libere object URLs e bitmaps que não forem mais usados.

## 5. Recursos de plataforma (equivalentes web)

### 5.1 Escolher foto

- **Galeria:** `<input type="file" accept="image/*">`.
- **Câmera:** `<input type="file" accept="image/*" capture="environment">`. Sem `getUserMedia`: a câmera do sistema basta e não pede permissão de site.
- **Importação:**
  1. `createImageBitmap(file, { imageOrientation: 'from-image' })` (respeita o EXIF);
  2. reduza para 1600 px no lado maior (`full`) e 480 px (`thumb`) com `targetSize()` do original;
  3. mantenha em memória (`ImageBitmap` + `Blob`).
- **HEIC:** se a decodificação falhar e o tipo ou a extensão for HEIC/HEIF, mostre uma mensagem específica e amigável (o Safari converte sozinho; o Chrome do Android às vezes não). Não traga um decodificador HEIC pesado sem discutir comigo.

### 5.2 Compartilhar

- `navigator.canShare({ files: [file] })` verdadeiro → `navigator.share({ files: [file] })`. Isso abre o menu do sistema com o WhatsApp no Android e no iPhone.
- Sem suporte (Firefox desktop e outros) → **baixar** o arquivo e mostrar um toast explicando.
- `AbortError` (o usuário cancelou) não é erro: não mostre mensagem.
- A chamada precisa sair direto do gesto do usuário. Gere o arquivo **antes**, ao entrar no Resultado, para que o toque em "Compartilhar" chame `share` sem `await` longo e não perca a ativação do usuário.

### 5.3 Salvar

- **Android e desktop:** download via `<a download>` (vai para Downloads e aparece na galeria do Android).
- **iOS:** o download do Safari não vai para Fotos. Use `navigator.share({ files })` e oriente com o texto "Toque em **Salvar Imagem**".
- Detecte por capacidade quando der e por plataforma só onde for inevitável. Ajuste as strings `saved`, `savedToast` e as de erro (seção 9).

### 5.4 Convidar

`navigator.share({ text, url: VITE_SITE_URL })`. Sem suporte → abrir `https://wa.me/?text=<texto + url codificados>`. A URL do convite **abre o app direto, sem instalar nada**: esse é o principal ganho da web e precisa estar claro no texto do convite.

### 5.5 Receber imagem pelo "Compartilhar" do Android (Web Share Target)

- No manifest: `share_target` com `action: "/compartilhado"`, `method: "POST"`, `enctype: "multipart/form-data"` e `params.files` para `image/*`.
- No service worker: intercepte o POST, guarde o arquivo (Cache Storage ou IndexedDB) e redirecione (303) para `/templates?compartilhado=1`. A página importa a foto e segue o fluxo do `useIncomingImage` original. Um arquivo que não for imagem gera o toast do original.
- Só funciona com a **PWA instalada no Android/Chrome**. No iPhone não existe. Documente isso em Configurações e no README.

### 5.6 Instalação (PWA)

- **Android/Chrome:** capture `beforeinstallprompt` e mostre um botão "Instalar app" em Configurações e um cartão discreto na Home **depois do primeiro meme compartilhado**. Nunca mostre no primeiro acesso, nunca bloqueie e permita dispensar para sempre.
- **iOS/Safari:** não existe prompt. Mostre uma sheet com os passos (Compartilhar → Adicionar à Tela de Início) com o mesmo critério de quando aparecer.
- Já instalado (`display-mode: standalone`): esconda tudo isso.

### 5.7 Manifest e service worker

- **Manifest:** `name` "Print Vira Meme", `short_name` "Vira Meme", `lang` "pt-BR", `start_url` "/", `display` "standalone", `orientation` "portrait", `background_color` e `theme_color` `#0F0F14`, ícones 192/512 e **maskable** (gerados a partir de `assets/brand/*.svg`, fundo `#FFD60A` como no adaptive icon), `share_target`, `categories: ["entertainment", "photo"]`, `screenshots` (para o prompt de instalação rico do Android).
- **Precache:** shell do app, JS e CSS, catálogo, fontes woff2 e foto de exemplo. Depois da primeira visita o app funciona **100% offline**. Fixe um orçamento de tamanho do precache, mostre o número no fim da etapa e justifique se passar de ~3 MB.
- **Atualização:** quando houver versão nova, mostre o toast "Nova versão disponível · Atualizar". Nunca recarregue sozinho no meio de uma edição.

### 5.8 Outros detalhes de mobile web

- `viewport-fit=cover` e `env(safe-area-inset-*)`; use `100dvh`, não `100vh`.
- Campos com `font-size` ≥ 16 px (senão o iOS dá zoom ao focar).
- A sheet de texto fica acima do teclado usando `visualViewport` (o original acabou de corrigir isso: commit "sheet de texto mostra 12 sugestões e cabe na tela com o teclado aberto").
- Vibração: `navigator.vibrate` onde existir (Android); no iOS, ignore silenciosamente.
- `prefers-reduced-motion` desliga as animações não essenciais.
- O tema é **só escuro**, como o original (`color-scheme: dark`).

## 6. Marca d'água ("Marca do app")

- A marca continua no layout (`brand` `footer` ou `pill`) e **vem ligada por padrão**, porque ela é o canal de aquisição.
- Qualquer um desliga com uma chave "Marca do app" no Resultado (re-exporta na hora) e define o padrão em Configurações. Sem paywall, sem frase de culpa. Rótulo sugerido: "Mostrar 'printvirameme.com.br' no meme".
- O texto da marca passa a carregar o **endereço do site** (vindo de `VITE_SITE_URL`, sem `https://`): a `pill` mostra o domínio e o `footer` mostra "PRINT VIRA MEME · printvirameme.com.br" (ou só o domínio, se não couber).
- **Valide a legibilidade** numa miniatura de 360 px de largura em todos os 19 layouts e ajuste tamanho e padding se necessário (`docs/03-ui.md` §4).
- Com a marca desligada, a altura do canvas usa `heightWithoutBrand`.

## 7. SEO

O app é SPA, mas as páginas de entrada são **pré-renderizadas em HTML estático no build**. Isso não é só para o Google: **o preview de link do WhatsApp não executa JavaScript**. Sem HTML estático com Open Graph, o link aparece sem imagem e sem título no grupo.

### 7.1 Como

- Pré-renderização no build com `vite-react-ssg` (confira se está mantido e compatível com a versão atual do React Router). Se não estiver, use um script próprio de pré-renderização (`react-dom/server` + rotas estáticas) e justifique a escolha.
- Rotas pré-renderizadas: `/`, `/templates`, `/apoiar`, `/privacidade`, `/categoria/:id` (12) e `/meme/:presetId` (75). As rotas de criação (`/editor`, `/resultado`) não precisam e devem ter `noindex`.
- A hidratação transforma a página estática no app sem piscar.

### 7.2 Conteúdo de cada página

- **`/meme/:presetId`:** `<h1>` com o nome do preset; imagem de exemplo (preset + foto de exemplo); o texto do preset; 8 a 12 frases sugeridas daquele tipo de slot; categoria com link; presets relacionados; CTA **"Usar este template"**, que pré-seleciona o preset e abre a sheet de foto.
- **`/categoria/:id`:** título e descrição da categoria, grade de presets com miniatura e links.
- **Home:** título forte ("Transforme qualquer print em meme em segundos"), CTA, explicação curta, populares e categorias com links. Tudo em HTML real, não só no canvas.
- Copy em português, no tom de `docs/03-ui.md` §5, sem encher de palavra-chave.

### 7.3 Metadados por página

- `<title>` e `<meta name="description">` únicos, `<link rel="canonical">`, `lang="pt-BR"`.
- Open Graph (`og:title`, `og:description`, `og:image` 1200×630, `og:url`, `og:locale` pt_BR, `og:site_name`) e Twitter card `summary_large_image`.
- **Imagens OG geradas no build** com o **mesmo `drawMeme`** rodando em Node via `@napi-rs/canvas`, com as fontes registradas: uma por preset (exemplo com a foto de exemplo) e uma por categoria e para a home (composição com a marca).
- JSON-LD: `WebApplication` (gratuita, `offers.price` 0, `applicationCategory` "MultimediaApplication") na home e `BreadcrumbList` nas páginas de categoria e preset.
- `sitemap.xml` e `robots.txt` gerados no build a partir do catálogo, com `VITE_SITE_URL`.

### 7.4 Desempenho (conta para o ranking)

Meta Lighthouse mobile nas páginas pré-renderizadas: **SEO 100, Performance ≥ 90, Acessibilidade ≥ 95**, PWA instalável. As imagens de exemplo das páginas são WebP com `width`/`height` e `loading="lazy"` abaixo da dobra; o JS do editor é carregado sob demanda (code splitting por rota).

## 8. Doação via Pix estático

### 8.1 Regras

Sem backend, sem taxa, sem cadastro. O dono informa a chave (**aleatória**), o nome e a cidade por variável de ambiente:

```
VITE_PIX_KEY=<chave aleatória EVP>
VITE_PIX_NAME=<nome do recebedor, até 25 caracteres, sem acento>
VITE_PIX_CITY=<cidade, até 15 caracteres, sem acento>
```

Sem `VITE_PIX_KEY`, todos os pontos de doação **somem** (o build não quebra).

### 8.2 Geração do BR Code no cliente

Módulo puro `pix/brcode.ts`, com testes:
- Payload EMV do Pix estático: `00` payload format, `26` merchant account (`br.gov.bcb.pix` + chave), `52` 0000, `53` 986, `54` valor **opcional**, `58` BR, `59` nome, `60` cidade, `62` com txid `***`, `63` **CRC16-CCITT (0xFFFF)**.
- Normalize o nome e a cidade (remover acentos, maiúsculas, cortar no limite).
- Teste o CRC contra um payload de referência conhecido e o payload completo contra um exemplo do manual do BR Code do Banco Central.
- QR com uma biblioteca leve de QR (ex.: `qrcode`), gerado no cliente como SVG.

### 8.3 Tela `/apoiar` e pontos de entrada

- **Tela:** texto curto e honesto ("O Print Vira Meme é grátis, sem anúncios e sem cadastro. Se ele te fez rir, um Pix ajuda a manter no ar 💛"); chips de valor sugerido (R$ 5 · R$ 10 · R$ 20 · Outro valor), cada um gerando o payload com o campo `54`; "Outro valor" gera sem valor e o pagador digita; o QR; os botões **"Copiar código Pix (copia e cola)"** e **"Copiar chave"**; toast "Copiado ✓"; a nota "O pagamento é feito no app do seu banco. Nenhum dado seu passa por aqui."
- **Pontos de entrada:**
  - um cartão discreto no **Resultado**, abaixo das ações e só depois do primeiro compartilhamento da sessão;
  - item em Configurações;
  - link no rodapé das páginas de SEO e da Home.
- **Nunca** use modal, pop-up, contagem ou bloqueio.
- Clipboard: `navigator.clipboard.writeText`, com fallback de seleção manual do texto.

## 9. Ajustes de texto (`strings.ts`)

- **Remover:** tudo de `paywall`, `proLite`, `home.proCard`, `home.proPill*`, `templates.proBadge`, `editor.generatePro`, `result.removeWatermark`, `result.hd`, `settings.knowPro`, `settings.youArePro`, `settings.restore`, `settings.rate`, `settings.analytics` (a menos que o analytics opcional esteja ativo).
- **Trocar** "celular" por "aparelho" onde o contexto for genérico, e reescrever `settings.photosBody` para o navegador ("A foto é aberta e redimensionada no seu navegador e fica só na memória desta aba. Nada é enviado para servidores.").
- **Adicionar:** strings de instalação, Marca do app, doação, Share Target, fallback de download, instrução "Salvar Imagem" do iOS e atualização disponível.
- Mantenha o tom de `docs/03-ui.md` §5.

## 10. Identidade visual

Mesma identidade, tokens idênticos aos de `src/theme/tokens.ts` e `typography.ts`, expostos como variáveis CSS:

- **Cores:** fundo `#0F0F14`, superfícies `#1A1A22` / `#26262F`, borda `#2E2E3A`, texto `#FFFFFF` / `#A1A1AA` / `#5F5F6B`, **ação `#FFD60A`** (pressionado `#E6BF00`, texto sobre ação `#0F0F14`), sucesso `#22C55E`, perigo `#EF4444`, overlay `rgba(0,0,0,0.6)`.
- O **gradiente roxo→rosa** (`#7C3AED`→`#EC4899`) era a cor do PRO. Sem PRO, não use em lugar nenhum, a menos que você proponha (e eu aprove) um novo papel para ele.
- **Tipografia de interface:** Rubik (Regular, Medium, Bold, Black) com a escala `display / h1 / h2 / title / body / bodyMedium / label / caption`.
- Espaçamentos, raios, tamanhos (botão primário 56, alvo de toque ≥ 48) e durações (150/250/350 ms) iguais aos tokens.
- Componentes com o mesmo visual e estados do original: Button, Chip, TemplateCard, HeroButton, SectionHeader, BottomSheet, SlotField, FontChip, StyleControls, CanvasFrame, Toast, ListItem, Skeleton e Placeholder.
- Favicon e ícones a partir de `assets/brand/*.svg`.

## 11. Acessibilidade

- Tudo operável por teclado no desktop.
- Foco visível; sheets como `dialog` com foco preso e `Esc` para fechar.
- Rótulos nos botões só com ícone.
- O canvas tem `role="img"` e `aria-label` com o texto do meme.
- Contraste conforme `docs/03-ui.md` §6.

## 12. Testes e verificação

- **Unidade (Vitest):** porte os testes do motor, do `imageTransform` e do catálogo, e acrescente: quebra de linha, autoFit (cabe, reduz, chega no mínimo, trunca com "…"), letterSpacing com fallback, BR Code (CRC, montagem, normalização), geração do sitemap.
- **Imagem (golden):** `drawMeme` em Node (`@napi-rs/canvas`) para cada um dos 19 layouts com o preset padrão e a foto de exemplo, comparado pixel a pixel (tolerância pequena, ex.: `pixelmatch`) com PNGs de referência versionados. A primeira leva de referências eu aprovo olhando. Gere uma página HTML com o grid lado a lado, para comparar com screenshots do app nativo que eu vou te passar.
- **Componentes (Testing Library):** Home, Templates, Editor, Resultado, Apoiar e Configurações.
- **E2E (Playwright)** com emulação **Pixel 7** e **iPhone 14**: subir a foto (`setInputFiles`) → escolher template → editar texto → trocar fonte → gerar → confirmar que o download ou share recebeu um JPEG 2160 px de largura, e que as fontes estavam carregadas (compare um pixel de controle). Mais: funcionamento offline (segunda visita com a rede cortada), página `/meme/:id` com OG estático no HTML bruto (sem executar JS) e QR do Pix presente.
- **Lighthouse CI** nas metas da seção 7.4.
- **Teste no aparelho real.** Antes de fechar cada etapa que mexe em plataforma, eu testo num Android e num iPhone de verdade. Diga exatamente o que testar e como abrir o servidor de dev pela LAN (`vite --host`). O emulador não substitui isso, principalmente para share, download, instalação e gestos.

## 13. Repositório

- `README.md` com: o que é, como rodar, variáveis de ambiente, deploy no Cloudflare Pages, limitações conhecidas por plataforma (tabela: Android Chrome / iOS Safari / desktop).
- `CLAUDE.md` com as convenções deste prompt (pt-BR, etapas, contestar, provar antes de dizer pronto) e um ponteiro para `../print_vira_meme/docs` como referência de produto.
- `docs/` com um `estado-e-proximos-passos.md` atualizado a cada etapa, no mesmo espírito do `docs/08` do original.
- `public/_headers` do Cloudflare Pages: cache longo para assets com hash, `no-cache` para o HTML e o service worker, e cabeçalhos de segurança (CSP compatível com o analytics opcional, `Referrer-Policy`, `Permissions-Policy`).
- Scripts: `dev`, `build` (inclui pré-renderização, OG, sitemap e validação do catálogo), `preview`, `test`, `test:e2e`, `typecheck`, `lint`, `validate:catalog`, `lighthouse`.

## 14. Etapas (parar para aprovação ao fim de cada uma)

1. **Fundação:** projeto Vite + TS + React Router + zustand + zod, lint, Vitest, tokens como CSS, fontes woff2, catálogo e motor copiados com os testes passando, campo `premium`/`packId` removido do schema e dos JSONs **por script** (com o validador confirmando 19 · 75 · 400 · 12). *Entrega:* `npm test`, `typecheck`, `validate:catalog` verdes.
2. **Renderizador:** `drawMeme` completo (seção 4.1–4.3), rota `/dev/canvas`, testes golden em Node. *Entrega:* grid dos 19 layouts para eu revisar contra o app nativo.
3. **Fluxo de criação:** Home, sheet de foto, Templates com preview ao vivo, Editor (textos, sugestões, fontes, estilo, gestos, mover textos, + Texto), exportação. *Entrega:* e2e do fluxo verde + roteiro de teste no aparelho.
4. **Resultado e plataforma:** compartilhar, salvar, convidar, Marca do app, Configurações. *Entrega:* e2e + teste no aparelho (Android e iPhone).
5. **PWA:** manifest, ícones, service worker com precache, offline, atualização, instalação (Android e iOS), Share Target. *Entrega:* Lighthouse PWA instalável, teste offline, share target testado num Android com o app instalado.
6. **Doação:** BR Code, `/apoiar`, pontos de entrada. *Entrega:* testes do BR Code + um pagamento real de R$ 0,01 lido por um app de banco (eu faço).
7. **SEO:** pré-renderização, páginas de preset e categoria, OG gerada no build, JSON-LD, sitemap e robots. *Entrega:* HTML bruto com as metas, preview de link testado no WhatsApp, Lighthouse SEO 100.
8. **Deploy:** Cloudflare Pages, `_headers`, domínio, README e docs finais. *Entrega:* URL no ar, checklist da seção 15 cumprida.

## 15. Critérios de aceite (o produto está pronto quando)

- [ ] Do primeiro acesso ao meme compartilhado no WhatsApp em menos de 20 s num Android intermediário, **sem instalar nada**.
- [ ] Os 19 layouts renderizam igual ao app nativo (golden aprovado), com as fontes certas na primeira exportação.
- [ ] Exportação em 2160 px de largura, com e sem marca, respeitando `heightWithoutBrand`.
- [ ] Compartilhar abre o menu do sistema no Android e no iPhone; no desktop sem suporte, baixa.
- [ ] Salvar funciona no Android (Downloads/galeria) e no iPhone (menu → Salvar Imagem).
- [ ] Funciona offline depois da primeira visita.
- [ ] Instalável no Android (prompt) e no iPhone (instruções); Share Target funcionando no Android com a PWA instalada.
- [ ] Nenhum vestígio de PRO, paywall, anúncio ou compra no código, na interface ou nos textos.
- [ ] Doação: QR e copia-e-cola válidos (pagamento real testado); some sem `VITE_PIX_KEY`.
- [ ] 75 páginas de preset + 12 de categoria pré-renderizadas, com OG próprio; link colado no WhatsApp mostra imagem e título.
- [ ] Lighthouse mobile: SEO 100, Performance ≥ 90, Acessibilidade ≥ 95.
- [ ] Nenhuma requisição de rede carrega a foto do usuário (verificado no e2e pela aba de rede).
- [ ] Testes, typecheck, lint e validação do catálogo verdes.

Comece pela leitura da seção 1. Depois me devolva **antes de escrever código**:
1. o que você entendeu do produto em 5 linhas;
2. os pontos deste prompt de que você discorda ou que acha arriscados;
3. o plano detalhado da Etapa 1.
