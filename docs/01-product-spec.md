# Print Vira Meme — Product Specification (Etapa 1)

**Status:** v1.0 — aprovada em 2026-09-05 (todas as 12 decisões da seção 15 aceitas) · **Plataforma:** Android (React Native + Expo + TypeScript)

## 0. Em uma frase

Print Vira Meme transforma qualquer foto ou print em um meme pronto para mandar no grupo, em menos de 20 segundos, sem saber editar nada — e cada meme compartilhado é um anúncio do app.

---

## 1. Onde discordo do briefing (e o que proponho)

Você pediu para eu questionar. Estas são as mudanças que considero importantes. O restante da spec já assume que foram aceitas; a seção 15 lista tudo para você aprovar ou reverter.

### 1.1 Limite diário de criação no Free — remover

O briefing sugere "criação limitada por dia" no Free. Isso conflita com o princípio 31 do seu próprio brief: cada meme criado no Free é um meme com marca d'água circulando no WhatsApp — é o seu canal de aquisição. Limitar criação é limitar marketing. Também é um gatilho fraco de conversão: quem bate o limite geralmente fecha o app, não paga.

**Proposta:** Free ilimitado. A diferenciação do PRO vem de marca d'água, anúncios, conteúdo premium, HD e editor extra — nunca da quantidade.

### 1.2 Marca d'água: não "eventual", sempre — mas como parte do design

**Proposta:** todo layout tem um *brand slot* desenhado (o rodapé "PRINT VIRA MEME" da notícia, uma tag pequena no canto do meme clássico). No Free ele sempre aparece; no PRO some. Precisa ser legível no preview do WhatsApp (~360px de largura) sem competir com a piada. Na notícia, a marca é literalmente "o nome do canal" — vira parte do humor.

### 1.3 Regra comercial: "PRO tem tudo, para sempre"

A regra sugerida ("premium disponível no momento da compra; packs futuros à parte") gera a pior review possível: *"paguei o PRO e ainda cobram"*.

**Proposta:**
- **PRO** = todos os recursos + todos os templates premium, **incluindo os que vierem depois, incluindo packs**.
- **Packs** = à la carte para quem **não** tem PRO. Na tela do pack, sempre: "ou leve tudo com o PRO por R$ 19,90".
- **Custo:** abrir mão de vender packs para usuários PRO (1–3% da base) — irrelevante.
- **Ganho:** regra de uma frase; ancoragem de preço (4 packs ≈ 1 PRO); PRO vira o melhor negócio óbvio; cada pack novo é motivo de retenção para quem já é PRO.

Exceção que **não** recomendo agora: packs "especiais" licenciados (colabs) explicitamente "não inclusos". Só se um dia houver conteúdo licenciado caro.

### 1.4 Packs ficam para a v1.1

Sua própria lista de lançamento (seção 29 do brief) não inclui packs. Com 50 templates no MVP, não há conteúdo para packs sem canibalizar o catálogo base.

**Proposta:** arquitetura pronta (entitlement por `packId`), zero packs vendidos na v1.0, **1 SKU (PRO)**. Packs entram quando houver conteúdo novo (v1.1), o que também dá uma "novidade" real para trazer o usuário de volta.

### 1.5 O que é "template": separar layout, preset e frase

O briefing chama de template tanto "Notícia Urgente" (um layout) quanto "Quando o chefe fala que é rapidinho" (uma situação/frase). Taxonomia proposta (detalhada na seção 8):

- **Layout** = estrutura visual em JSON (~15 no MVP).
- **Preset** = o que o usuário vê como "template": layout + categoria + textos pré-preenchidos + thumbnail (50 no MVP).
- **Frase** = sugestão de texto por slot, com tags de categoria (~200 no MVP).

Resultado: os "50 templates" existem como o usuário espera, mas custam ~15 layouts, e as combinações são milhares.

### 1.6 Fluxo: foto primeiro E template primeiro

Quem chega pelo "Compartilhar → Print Vira Meme" já tem a foto; quem abre o app "para ver o que tem" quer navegar templates.

**Proposta:** os dois caminhos convergem no editor. O estado da criação aceita foto e preset em qualquer ordem.

### 1.7 Anúncios: sem banner, com regras de "nunca"

Banners rendem pouco (eCPM baixo no Brasil), ocupam espaço no editor e fazem o app parecer barato.

**Proposta:** interstitial com frequência controlada + (v1.1) rewarded para desbloquear um template premium por uso. Regras invioláveis na seção 9.4.

### 1.8 Preço: R$ 19,90 no lançamento

Mais barato que um lanche; aciona a compra por impulso na hora em que o usuário quer tirar a marca. R$ 24,90 e R$ 29,90 testados depois via preço na Play Console (sem release). Não simular "de R$ 29,90 por R$ 19,90" sem ter praticado o preço (CDC).

### 1.9 Analytics não é opcional no MVP

O objetivo do MVP é responder "as pessoas criam e compartilham?". Sem eventos, o MVP não valida nada.

**Proposta:** eventos definidos já nesta spec (seção 11), sem conteúdo do usuário; provedor escolhido na Etapa 4.

### 1.10 "Novidades" sem backend: EAS Update

Templates são JSON no bundle JS → **EAS Update** (OTA do Expo) entrega templates/frases novas sem release na Play. Custo zero de backend, e resolve "o usuário volta para ver novidades".

### 1.11 Expo Camera é desnecessário

`expo-image-picker` já abre a câmera do sistema (`launchCameraAsync`). Menos uma permissão complexa, menos código.

---

## 2. Proposta de valor

- **Para quem:** brasileiros que vivem em grupos de WhatsApp e querem responder com humor.
- **O que:** transforma qualquer foto/print em meme em segundos, com situações prontas do dia a dia brasileiro.
- **Diferente de:** editores de imagem (Canva, PicsArt) e "meme generators" genéricos com imagens de terceiros — que exigem saber editar e usam imagens que você não pode usar.
- **Promessa:** *"Pega a foto, escolhe a situação, manda."* Sem login, sem upload, sem saber editar.

Três promessas que aparecem na loja e no app:

1. **Meme em segundos.**
2. **Suas fotos ficam no seu celular.**
3. **Pague uma vez, use para sempre** (PRO).

---

## 3. Público-alvo e personas

**Mercado:** Brasil, Android (~80% do mercado), 16–40 anos, uso intensivo de WhatsApp em grupos (família, trabalho, amigos, futebol, faculdade).

### Persona 1 — Rafa, "o zoeiro do grupo" (primária, ~60% do uso)
- 19–30 anos, 10+ grupos de WhatsApp, tira print de tudo.
- **Motivação:** ser o primeiro a responder com algo engraçado; o "kkkkk" do grupo é a recompensa.
- **Frustração:** apps de meme são gringos, cheios de imagens que ele não conhece, ou editores que pedem 10 toques.
- **Sucesso:** do print ao envio em menos de 20 segundos.

### Persona 2 — Dani, "humor de casal e família" (secundária)
- 25–40 anos; manda memes para o parceiro e para o grupo da família: foto do cachorro, do filho, do marido dormindo no sofá.
- **Motivação:** carinho + zoeira leve. Quer um resultado "bonitinho".
- **Sensível a conteúdo pesado:** palavrão e humor agressivo afastam.

### Persona 3 — Bruno, "o cara do grupo do trabalho" (secundária)
- 28–45 anos; zoeira corporativa: reunião que podia ser e-mail, e-mail às 17:58, "rapidinho".
- Quer parecer engraçado sem parecer inapropriado. **Paga o PRO para tirar a marca** ("fica mais profissional").

### Persona 4 — Receptor (não usa o app… ainda)
- Vê o meme no grupo. Precisa entender em 1 segundo que "isso foi feito num app" e o nome dele. É o alvo da marca d'água e do loop viral.

---

## 4. Problema e solução

**Problema:** ter a foto engraçada é fácil; transformar em algo "mandável" não é. Os caminhos hoje: (a) mandar a foto crua com texto ao lado (perde o timing e a piada); (b) editor genérico (demora, resultado amador); (c) app de meme gringo (imagens de terceiros, humor que não conversa com o Brasil, inglês).

**Solução:** catálogo de situações brasileiras prontas + layouts que fazem qualquer foto parecer um meme "de verdade" + exportação e compartilhamento em 2 toques. **O usuário não edita — ele escolhe.**

---

## 5. Diferencial (o que defende o produto)

1. **Situações, não ferramentas:** catálogo curado de humor brasileiro do dia a dia; o valor está no conteúdo e na velocidade, não em recursos de edição.
2. **Sua foto é o meme:** layouts originais que dependem da foto do usuário — sem risco de direitos autorais e com a piada personalizada (que é o que faz alguém mandar no grupo).
3. **Loop viral por design:** marca como parte do layout, entrada pelo "Compartilhar" do Android, compartilhar como ação principal.
4. **Privacidade como argumento:** zero upload, zero login.
5. **Compra única:** num mercado de assinaturas, "pague uma vez" é um diferencial de confiança no Brasil.

**Copiável?** Os layouts, sim. A curadoria de conteúdo, o ritmo de novidades e a base de usuários compartilhando, não.

---

## 6. Casos de uso principais

| # | Situação | Entrada | Meta de tempo |
|---|---|---|---|
| UC1 | Recebi/tirei um print e quero responder com meme | Compartilhar → Print Vira Meme | < 20s até o envio |
| UC2 | Tenho uma foto na galeria e quero zoar alguém | App → Criar meme | < 40s |
| UC3 | Quero ver o que tem de novo / me inspirar | App → categorias/novidades → preset → pede foto | sem meta |
| UC4 | Mesma foto, outra piada | Resultado → "Outro template com esta foto" | < 10s |
| UC5 | Quero tirar a marca / usar template premium | Paywall contextual → compra → volta ao mesmo meme | 2 toques + Play |
| UC6 | Troquei de celular / reinstalei | Paywall → Restaurar compra | 1 toque |

---

## 7. Jornada do usuário

### 7.1 Primeira vez (instalação → primeiro meme)

1. Abre o app: **sem onboarding em carrossel.** Home com "Criar meme" dominante e templates visíveis já com exemplos.
2. Toca "Criar meme" → escolhe foto (galeria/câmera). Aviso único e discreto dentro do seletor: *"Suas fotos ficam no seu celular."*
3. Escolhe um preset (já vem com texto).
4. Editor: o meme já está pronto com o texto sugerido; pode trocar por outra sugestão ou digitar.
5. "Gerar" → Resultado: meme grande, **Compartilhar** dominante; **Salvar** e **Outro template** secundários.
6. Compartilha no WhatsApp. Ao voltar, a tela de resultado permanece (sem anúncio nesse retorno).

**Meta:** 60s da instalação ao primeiro compartilhamento; zero decisões obrigatórias fora do conteúdo.

### 7.2 Uso recorrente via Compartilhar (UC1)

Print → Compartilhar → Print Vira Meme → abre direto na seleção de template com a imagem carregada → editor → resultado → WhatsApp. O app "mora" na share sheet do celular, virando lembrete permanente.

### 7.3 Loop de retenção

- **Volta por conteúdo:** novidades via OTA (semanal/quinzenal), sazonais (Carnaval, Copa/Brasileirão, Natal, Black Friday).
- **Volta por hábito:** cada print recebido é um gatilho; o app está na share sheet.
- **v1.1:** favoritos e histórico ("refaz com outra foto").

### 7.4 Conversão para PRO (momentos)

Nunca bloqueando a criação. Gatilhos: tocar em template premium; tocar em "tirar marca" no resultado; tocar em "HD"; fechar o 2º interstitial ("sem anúncios por R$ 19,90, uma vez só"); após o 3º compartilhamento ("você já mandou 3 memes 🔥"). Depois de comprar, volta exatamente para onde estava.

---

## 8. Modelo de conteúdo (taxonomia)

| Entidade | O que é | Quem vê | MVP |
|---|---|---|---|
| **Layout** | JSON: canvas, slot de imagem, slots de texto com variáveis, formas, brand slot, regras (maxLines, autoFit) | interno (usuário vê só o resultado) | ~15 (≈10 free, 5 PRO) |
| **Preset** ("template" na UI) | `layoutId` + categoria + valores padrão das variáveis + nome + thumbnail + `premium` | catálogo, cards | 50 (≈32 free, 18 PRO) |
| **Frase** | texto sugerido para um tipo de slot (top/bottom/title/description/pov/score…) com tags de categoria | chips "Sugestões" no editor | ~200 |
| **Categoria** | Humor, Trabalho, Relacionamento, Dinheiro, Futebol, Família, Faculdade, Rolê | Home, filtros | 8 |
| **Estilo** | fonte/cor/contorno aplicável ao texto | editor | 3 fontes free, +4 PRO |
| **Pack** | conjunto de presets (+ layouts) com SKU próprio | loja | v1.1 |

**Regras:**
- Preset tem **categoria primária** (para as contagens que você definiu) e **tags secundárias** — Faculdade/Rolê com 3 presets não ficam "vazias" porque presets de Humor com tag aparecem lá.
- Todo preset é editável: o texto padrão é ponto de partida, não o meme final.
- **Tipos de layout do MVP (candidatos):** Meme clássico (topo/rodapé), Notícia urgente, Manchete, POV, Conversa (estilo próprio, sem identidade de apps reais), Placar, Pódio, Gráfico engraçado, Alerta/Aviso, Certificado, Enquete, Nota/lembrete, Antes × Depois, Ranking, Legenda de foto. Lista definitiva na Etapa 5/6.
- **Fontes:** só OFL/licenciadas (Anton, Bebas Neue, Oswald, Inter…). "Impact" não é livre — não usar.
- **Conteúdo:** original, sem celebridades, marcas ou memes de terceiros; nomes/times digitados pelo usuário são conteúdo dele.

---

## 9. Modelo de monetização

### 9.1 Free
Ilimitado: criar, exportar (1080px JPEG), compartilhar, salvar. Todas as 8 categorias com ≥ 50% dos presets. ~10 layouts. 3 fontes. Brand slot sempre visível. Anúncios (regras 9.4).
**Objetivo:** máximo de memes com marca circulando.

### 9.2 PRO — compra única (R$ 19,90 no lançamento)
Sem anúncios · sem marca · exportação em qualidade máxima (PNG, 2x) · todos os layouts/presets/fontes premium, **inclusive futuros e packs** · editor extra (arrastar/ajustar texto, cor e contorno, texto adicional) · prioridade em recursos futuros (IA será PRO, possivelmente com limite de uso por custo).

**Mensagem:** *"Pague uma vez. Use para sempre."* + "Compra única, sem assinatura" em todo lugar que exibir preço. Preço sempre lido da Play (nunca hardcoded). Botão **"Restaurar compra"** obrigatório.

### 9.3 Packs (v1.1) — R$ 3,90 a R$ 5,90
Conteúdo adicional, à la carte, para quem não é PRO. 20–50 presets por pack (Humor, Trabalho, Futebol, Casal, Dinheiro, Rolê, sazonais). Tela do pack sempre mostra "ou tudo com PRO". PRO inclui todos.

### 9.4 Anúncios (Free)
- **Nunca:** no primeiro meme da vida do usuário; entre "meme pronto" e "compartilhar"; com o editor aberto; no retorno da share sheet.
- **Interstitial:** ao tocar "Criar outro"/voltar para a Home após uma exportação; a partir da 2ª exportação; depois a cada 3 exportações; mínimo 3 min entre anúncios; sempre com "Sem anúncios? PRO por R$ 19,90" no fechamento.
- **Rewarded (v1.1):** "Assista e use este template PRO neste meme" — libera um preset premium por uso (com marca e com anúncios). **Nunca** usar rewarded para remover marca (mata o loop e o PRO).
- **Sem banners.**

### 9.5 Regra comercial em uma frase (para a loja e o paywall)
> "PRO libera tudo, para sempre — inclusive o que a gente lançar depois. Packs são para quem prefere pagar só por um tema."

### 9.6 Hipóteses de receita (para validar, não promessas)
Free→PRO 1–3% em 30 dias; ARPU de anúncios baixo no Brasil (interstitial ~US$ 1–3 eCPM). O PRO é a receita principal; anúncios pagam a conta da Play/EAS e empurram para o PRO.

---

## 10. Estratégia de viralização

1. **Marca no meme, desenhada por layout** (brand slot). Teste de aceitação: legível em thumbnail de 360px; não cobre foto nem texto.
2. **Compartilhar é a ação principal** em toda tela de resultado; arquivo já pronto quando a tela abre (sem espera ao tocar).
3. **Entrada pela share sheet do Android:** o app aparece em todo "Compartilhar" do celular.
4. **"Outro template com esta foto":** multiplica memes por foto (e por sessão).
5. **Conteúdo com gatilho de identificação:** cada preset responde "em qual grupo eu mandaria isso?". Se não há resposta, não entra.
6. **Zero atrito antes do compartilhamento:** sem login, sem onboarding, sem anúncio no caminho.
7. **Sazonalidade via OTA:** conteúdo de Carnaval/Copa/Natal no dia certo, sem release.
8. **Loja:** screenshots que são memes (o próprio produto vende); nome e descrição com "meme com suas fotos".

---

## 11. Métricas

**North Star:** memes compartilhados por usuário ativo semanal (compartilhamentos / WAU).

**Funil:** `app_open → image_selected → preset_selected → meme_exported → meme_shared`.

**Eventos** (props entre parênteses; nunca texto digitado nem imagem):
- `app_open` (entry: launcher | share_intent)
- `image_selected` (source: gallery | camera | share_intent)
- `preset_selected` (presetId, layoutId, category, premium)
- `suggestion_used` (phraseId) · `text_edited` (slot)
- `meme_exported` (presetId, quality, hasBrand, durationMs) · `export_failed` (reason)
- `meme_shared` (presetId) · `meme_saved` · `remake_same_photo`
- `paywall_shown` (trigger) · `purchase_started` / `purchase_completed` / `purchase_restored` (sku)
- `ad_shown` (type)

**Indicadores derivados:** % instalações que exportam no D0; % que compartilham no D0; memes/sessão; memes/foto; presets e categorias mais usados; retenção D1/D7/D30; conversão Free→PRO (30 dias); receita/usuário; crash-free; tempo até o primeiro meme; taxa de falha de exportação.

**Critérios de validação da hipótese** (30 dias pós-lançamento; chutes iniciais para calibrar): ≥ 40% dos instaladores exportam ≥ 1 meme no D0; ≥ 25% compartilham ≥ 1 no D0; D7 ≥ 15%; PRO ≥ 1,5%.

**Limitação honesta:** o Android não confirma se o compartilhamento foi concluído; `meme_shared` = share sheet aberta com o arquivo. Atribuição de instalação via meme não é mensurável diretamente; usa-se crescimento orgânico na Play Console.

---

## 12. Privacidade

- Sem login, sem conta, sem servidor de fotos. Imagens vão do seletor para o cache do app, são redimensionadas localmente e apagadas do cache automaticamente (ex.: > 24h). Só vão para a galeria quando o usuário toca "Salvar".
- SDKs de anúncios e analytics coletam identificadores de dispositivo: política de privacidade e formulário *Data Safety* da Play precisam declarar. Analytics nunca inclui o conteúdo do meme.
- "Suas fotos ficam no seu celular" é verdadeira enquanto nenhuma função enviar imagem. Quando a IA chegar, será opt-in explícito por foto.
- Página de política de privacidade hospedada (domínio próprio recomendado — também para a loja).

---

## 13. Escopo

### 13.1 MVP (v1.0) — o que entra
Home · seleção de imagem (galeria, câmera via picker, share intent) · catálogo (8 categorias, 50 presets, ~15 layouts, ~200 frases) · editor simples (texto, sugestões, 3 fontes; PRO: posição, cor/contorno, texto extra, +4 fontes) · resultado (compartilhar, salvar, outro template, criar outro) · brand slot · exportação PNG/JPEG · PRO (1 SKU, restaurar) · interstitial com regras · analytics · persistência local (PRO, contadores, preferências) · política de privacidade · pt-BR.

### 13.2 v1.1
Packs (2–3), rewarded, favoritos, histórico, catálogo remoto por OTA em cadência, +50 presets.

### 13.3 Depois
IA de legenda (PRO), template builder (ferramenta interna — pode começar em paralelo como projeto separado, só gera JSON), templates personalizados, iOS.

### 13.4 Fora (conforme seção 28 do brief)
Login, feed, social, comentários, moedas, assinatura, backend, admin completo, marketplace, edição avançada.

---

## 14. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Catálogo de 50 parecer pequeno | frases (~200) + "outro template com esta foto" + OTA quinzenal |
| Entrada por share intent depende de lib da comunidade (`expo-share-intent`) | isolar em serviço; fallback é o seletor normal; validar no primeiro dev build |
| Diferença entre preview e exportação | mesmo componente renderiza ambos; testes em aparelhos intermediários; exportação com feedback de progresso |
| Pirataria do PRO (entitlement local) | aceitar no MVP; validação de compra com a Play/RevenueCat decidida na Etapa 4 |
| Nome/marca | verificar INPI e Play Store; garantir domínio |
| Reviews negativas por anúncio | regras "nunca" (9.4) + frequência conservadora no lançamento |
| Conteúdo ofender / perder o "leve" | tom editorial: zoeira sem ódio, sem política, sem corpo/aparência; revisão do catálogo |

---

## 15. Decisões para você aprovar

Se aprovar sem comentários, sigo com as recomendações.

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Free sem limite diário (1.1) | sim |
| 2 | Marca d'água sempre no Free, como brand slot por layout (1.2) | sim |
| 3 | "PRO tem tudo, para sempre; packs só para Free" (1.3) | sim |
| 4 | Packs só na v1.1; MVP com 1 SKU (1.4) | sim |
| 5 | Taxonomia layout/preset/frase; "template" na UI = preset (1.5) | sim |
| 6 | Fluxo dual foto-primeiro / template-primeiro (1.6) | sim |
| 7 | Sem banners; interstitial com regras; rewarded na v1.1 (1.7) | sim |
| 8 | R$ 19,90 no lançamento (1.8) | sim |
| 9 | Analytics no lançamento; provedor na Etapa 4 (1.9) | sim |
| 10 | Novidades via EAS Update (1.10) | sim |
| 11 | Nome "Print Vira Meme" | manter (verificar INPI/domínio por sua conta) |
| 12 | Tom de conteúdo: zoeira leve, sem política/ódio/aparência | sim |

**Próxima etapa após aprovação:** Etapa 2 — UX (telas, estados, navegação, comportamento Free/PRO por tela).
