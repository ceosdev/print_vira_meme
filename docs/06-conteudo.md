# Print Vira Meme — Conteúdo (Etapa 6)

**Status:** v1.0 — aprovada em 2026-09-05 (7 decisões da seção 6 aceitas) · **Depende de:** [05-modelo-template.md](05-modelo-template.md)

Arquivos entregues (caminhos definitivos do app):

| Arquivo | Conteúdo |
|---|---|
| [src/content/presets/*.json](../src/content/presets/) | **75 presets**, um arquivo por categoria |
| [src/content/phrases/*.json](../src/content/phrases/) | **400 frases** de sugestão, um arquivo por categoria |

**Validação:** `validateCatalog(…, { strict: true })` → `ok: true`, 0 erros, 0 avisos (19 layouts · 87 presets · 437 frases · 12 categorias). Toda categoria tem ≥ 3 presets e ≥ 50% free; todo preset respeita `maxChars` de cada slot; nenhuma frase passa de 90 caracteres.

---

## 1. Distribuição

| Categoria | Presets | Free / PRO | Populares | Frases (categoria primária) |
|---|---|---|---|---|
| 😂 Humor | 17 | 12 / 5 | 2 | 72 |
| 💼 Trabalho | 8 | 5 / 3 | 2 | 52 |
| ❤️ Relacionamento | 7 | 4 / 3 | 1 | 43 |
| 💸 Dinheiro | 5 | 3 / 2 | 1 | 37 |
| ⚽ Futebol | 5 | 3 / 2 | 1 | 39 |
| 👨‍👩‍👧 Família | 6 | 5 / 1 | 1 | 28 |
| 🎓 Faculdade | 5 | 4 / 1 | 1 | 20 |
| 🍺 Rolê | 5 | 3 / 2 | 1 | 20 |
| 🗳️ Politicagem | 5 | 4 / 1 | 2 | 23 |
| 🐶 Pet | 4 | 3 / 1 | 1 | 22 |
| 🍔 Comida | 4 | 3 / 1 | 1 | 22 |
| 🤖 Tecnologia | 16 | 12 / 4 | 4 | 59 |
| **Total** | **87** | **61 / 26** | **18** | **437** |

A primeira leva seguiu o briefing (15 / 8 / 7 / 5 / 5 / 4 / 3 / 3); a segunda leva (seção 7) somou 25 presets e 4 categorias; a terceira (seção 8) somou 12 presets de tecnologia. Free/PRO global: **61 / 26** (70% free). Os 18 populares são todos free — "🔥 Populares" é vitrine de compartilhamento, não de conversão.

Layouts usados pelos presets: alerta ×7, carimbo ×3, classic ×6, conversa ×7, enquete ×4, legenda ×5, manchete ×2, noticia ×7, perfil ×3, placar ×5, pov ×8, procurado ×4 (free) · balao ×4, carteirinha ×3, certificado ×6, grafico ×4, nota ×3, podio ×3, recibo ×3 (PRO). Todos os 19 layouts têm pelo menos um preset.

## 2. Linha editorial (vale para presets, frases e OTAs futuras)

1. **Identificação imediata:** cada preset responde "em qual grupo eu mandaria isso?" (família, trabalho, pelada, casal, rolê). Se não responde, não entra.
2. **Zoeira leve:** ri *com*, não *de*. Sem política **partidária**, religião, corpo/aparência, doença, dinheiro alheio de verdade. A categoria 🗳️ Politicagem usa o *vocabulário* político (candidato, urna, mandato, promessa de campanha, ata, reunião) aplicado a síndico, grupo do condomínio e churrasco em família — nunca a partido, governo, eleição real ou pessoa pública. O alvo da piada é sempre "eu" ou uma situação universal ("o cunhado", "a segunda-feira").
3. **Sem terceiros protegidos:** nenhuma celebridade, time real, marca ou meme de terceiros. Nomes e times são do usuário. (Única menção a produto: "WhatsApp" em um preset e uma frase, como referência nominativa ao lugar onde a piada acontece — ver decisão 4.)
4. **Português do Brasil falado:** "tô", "pra", "rapidinho", aspas simples para falas. Sem gíria regional forte, sem palavrão.
5. **Formato manda no texto:** notícia = manchete + descrição em tom jornalístico sério (o contraste é a piada); classic = CAIXA ALTA curta; POV = frase que completa "POV: …"; conversa = 3 balões com virada no terceiro.
6. **Curto vence:** título ≤ 70, descrição ≤ 100, mensagem ≤ 60, opção ≤ 30 sempre que possível — cabe no canvas sem `autoFit` agressivo.

## 3. Os 50 presets

### 😂 Humor

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `humor-dormir-cedo` — Hoje vou dormir cedo | Meme clássico | Free 🔥 tags: faculdade | EU: HOJE VOU DORMIR CEDO · EU ÀS 3 DA MANHÃ: |
| 2 | `humor-academia-segunda` — Academia na segunda | Notícia urgente | Free 🔥 | Brasileiro promete começar a academia na segunda-feira · Segundo fontes, é a 14ª segunda-feira consecutiva com a mesma promessa. · Fonte: ele mesmo |
| 3 | `humor-cinco-minutos` — Só mais cinco minutos | Meme clássico | Free tags: faculdade, trabalho | SÓ MAIS CINCO MINUTOS · DUAS HORAS DEPOIS: |
| 4 | `humor-geladeira` — Geladeira pela quinta vez | POV | Free tags: familia | você abre a geladeira pela quinta vez esperando que algo novo tenha aparecido |
| 5 | `humor-vou-sair-hoje` — Não vai sair hoje | Notícia urgente | Free tags: role | Especialistas confirmam que ele realmente não vai sair hoje · A decisão foi tomada após 40 minutos deitado no sofá 'só descansando'. · Fonte: o sofá |
| 6 | `humor-whatsapp-cinco-minutos` — Entrou por cinco minutos | Alerta | Free | PESSOA ENTROU NO WHATSAPP 'POR CINCO MINUTOS' · Desapareceu há três horas. Familiares pedem que retorne. |
| 7 | `humor-fingindo-ouvindo` — Fingindo que estou ouvindo | Legenda | Free | Eu fingindo que estou ouvindo enquanto penso no que vou comer |
| 8 | `humor-enquete-hoje` — O que eu vou fazer hoje | Enquete | Free | O que eu vou fazer hoje? · Nada · Pensar em fazer algo · Dormir de novo |
| 9 | `humor-placar-segunda` — Eu × Segunda-feira | Placar | Free tags: trabalho | EU · 0 · SEGUNDA · 7 · Sonecas: 5 · Cafés: 8 · Vontade: 0 |
| 10 | `humor-conversa-ta-chegando` — Tô chegando | Conversa | Free tags: role | Amigo · Onde você tá? · Tô chegando, 5 min · Isso foi há 40 minutos |
| 11 | `humor-pov-dieta` — Começou a dieta | POV | Free | você começa a dieta e alguém traz bolo |
| 12 | `humor-podio-desculpas` — Ranking de desculpas | Pódio | **PRO** | RANKING DE DESCULPAS · Tô chegando · Não vi a mensagem · Meu celular morreu |
| 13 | `humor-grafico-produtividade` — Produtividade do dia | Gráfico | **PRO** tags: trabalho | Minha produtividade ao longo do dia · Vontade de ir embora · 8h · 10h · 14h · 17h58 |
| 14 | `humor-certificado-atraso` — Certificado de atraso | Certificado | **PRO** | Você · por chegar atrasado em 100% dos compromissos de 2026 · A gerência · Toda segunda |
| 15 | `humor-balao-celular` — Só vou ver uma coisa | Balão de fala | **PRO** | SÓ VOU VER UMA COISA NO CELULAR · 3 HORAS DEPOIS |

### 💼 Trabalho

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `trabalho-email-1758` — E-mail às 17:58 | Alerta | Free 🔥 | E-MAIL RECEBIDO ÀS 17:58 · Assunto: 'urgente, precisa sair hoje'. Autoridades investigam. |
| 2 | `trabalho-fingindo-reuniao` — Fingindo que entendi | Legenda | Free 🔥 tags: faculdade | Eu fingindo que entendi a reunião |
| 3 | `trabalho-call-rapida` — Call rápida | Conversa | Free | Chefe · Tem disponibilidade para uma call rápida? · Claro! Sobre o quê? · Nada de mais, só uns 40 minutos |
| 4 | `trabalho-reuniao-email` — Podia ser um e-mail | Notícia urgente | Free | Reunião de duas horas poderia ter sido um e-mail · Participantes relatam que o assunto principal foi decidido nos últimos 5 minutos. · Fonte: todo mundo que estava lá |
| 5 | `trabalho-pov-camera` — Câmera ligada | POV | Free | você entra na reunião e esqueceu a câmera ligada |
| 6 | `trabalho-balao-rapidinho` — É rapidinho | Balão de fala | **PRO** | É RAPIDINHO, JURO · ENQUANTO ISSO, NA REUNIÃO |
| 7 | `trabalho-grafico-motivacao` — Motivação da semana | Gráfico | **PRO** | Minha motivação durante a semana · Nível de energia · Seg · Qua · Sex · Sex 18h |
| 8 | `trabalho-certificado-mes` — Funcionário do mês | Certificado | **PRO** | Funcionário do mês · por fingir que trabalha com excelência durante todas as reuniões online · RH · Todo dia |

### ❤️ Relacionamento

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `rel-nao-estou-brava` — Não estou brava | Meme clássico | Free 🔥 | ELA: NÃO ESTOU BRAVA · TAMBÉM ELA: |
| 2 | `rel-respondeu-ok` — Respondeu só 'ok' | Alerta | Free | ELA RESPONDEU APENAS 'OK' · Especialistas recomendam pedir desculpas imediatamente, mesmo sem saber o motivo. |
| 3 | `rel-explicando` — Tentando explicar | Legenda | Free tags: humor | Eu tentando explicar uma coisa que claramente fiz errado |
| 4 | `rel-conversa-jantar` — Onde você quer jantar | Conversa | Free | Amor · Onde você quer jantar? · Tanto faz, você escolhe · Não, aí não. |
| 5 | `rel-podio-briga` — Motivos da briga | Pódio | **PRO** | MOTIVOS DA ÚLTIMA BRIGA · O tom de voz · Aquele 'ok' · Ninguém lembra |
| 6 | `rel-certificado-namorado` — Namorado do ano | Certificado | **PRO** | Namorado do ano · por lembrar da data do aniversário de namoro (com ajuda do lembrete do celular) · Ela · Por enquanto |
| 7 | `rel-balao-tanto-faz` — Tanto faz | Balão de fala | **PRO** | TANTO FAZ, VOCÊ ESCOLHE · TRADUÇÃO: ESCOLHE ERRADO E VÊ |

### 💸 Dinheiro

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `din-salario-caiu` — Salário × Boletos | Placar | Free 🔥 | SALÁRIO · 1 · BOLETOS · 9 · Tempo na conta: 4 horas · Parcelas: 12 · Saldo: emocional |
| 2 | `din-fatura` — Vendo a fatura | Legenda | Free tags: humor | Eu vendo o valor da fatura do cartão |
| 3 | `din-boleto-amanha` — Boleto vence amanhã | Alerta | Free | BOLETO VENCE AMANHÃ · Vítima descobriu enquanto estava 'só dando uma olhadinha' nas compras. |
| 4 | `din-grafico-mes` — Meu dinheiro no mês | Gráfico | **PRO** | Meu desespero ao longo do mês · Boletos vencendo · Dia 5 · Dia 15 · Dia 25 · Dia 30 |
| 5 | `din-nota-economizar` — Esse mês eu economizo | Bilhete | **PRO** | Lembrete: esse mês eu vou economizar. (escrito pela 14ª vez) |

### ⚽ Futebol

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `fut-placar-pelada` — Placar da pelada | Placar | Free 🔥 | EU · 3 · MEU CUNHADO · 1 · Atrasos: 5 · Desculpas: 8 · Gols perdidos: 12 |
| 2 | `fut-noticia-artilheiro` — Artilheiro da pelada | Notícia urgente | Free | Artilheiro da pelada é visto falhando gol embaixo da trave · Testemunhas afirmam que 'até a minha vó fazia'. · Fonte: o grupo da pelada |
| 3 | `fut-pov-segunda` — Time perdeu, é segunda | POV | Free tags: trabalho | seu time perde e você tem que ir trabalhar segunda |
| 4 | `fut-podio-pelada` — Pódio da pelada | Pódio | **PRO** | PÓDIO DA PELADA · Quem levou a bola · Quem marcou o horário · Quem jogou bem |
| 5 | `fut-certificado-cunhado` — Cunhado técnico | Certificado | **PRO** tags: familia | Cunhado · por entender mais de futebol que o técnico, a comissão e a diretoria juntos · O sofá · Todo domingo |

### 👨‍👩‍👧 Família

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `fam-conversa-almoco` — Almoço de domingo | Conversa | Free 🔥 | Mãe · Você vem almoçar domingo? · Vou sim, tô chegando · Isso foi às 11h. Já são 15h. |
| 2 | `fam-bom-dia-grupo` — Bom dia no grupo | Alerta | Free | BOM DIA ENVIADO NO GRUPO DA FAMÍLIA · Mensagem tinha 14 flores, 3 corações e um áudio de 6 minutos. |
| 3 | `fam-manchete-tia` — A tia e o namoro | Manchete | Free | PLANTÃO FAMILIAR · TIA PERGUNTA SOBRE NAMORO PELA 9ª VEZ NO MESMO ALMOÇO · Na foto, o suspeito momentos antes de mudar de assunto. |
| 4 | `fam-nota-rapidinho` — Só vou ali rapidinho | Bilhete | **PRO** | Mãe: 'só vou ali rapidinho'. Rapidinho: 3 horas e 4 lojas. |

### 🎓 Faculdade

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `fac-vespera-prova` — Véspera da prova | Meme clássico | Free 🔥 | EU NA VÉSPERA DA PROVA: · 'DÁ TEMPO DE VER TUDO' |
| 2 | `fac-enquete-tcc` — Como está o TCC | Enquete | Free | Como está o TCC? · Começo amanhã · Tem um título · O que é TCC? |
| 3 | `fac-balao-grupo` — Trabalho em grupo | Balão de fala | **PRO** tags: trabalho | PODE DEIXAR QUE EU FAÇO A MINHA PARTE · TRABALHO EM GRUPO, DIA 1 |

### 🍺 Rolê

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 1 | `role-pov-so-uma` — Só uma | POV | Free 🔥 | você disse que ia tomar 'só uma' e já é 3 da manhã |
| 2 | `role-conversa-vai-hoje` — Vai hoje? | Conversa | Free | Grupo do rolê · Vai hoje? · Vou não, tô cansado · Chegou 22h e ficou até fechar |
| 3 | `role-certificado-ultimo` — O último a sair | Certificado | **PRO** | Você · por dizer 'vou embora cedo hoje' e ser o último a sair pela 27ª vez · O bar · Sábado passado |

🔥 = popular · tags = categorias secundárias em que o preset também aparece.

## 4. Frases (311)

| Tipo de slot | Frases |
|---|---|
| `title` | 41 |
| `caption` | 39 |
| `message` | 34 |
| `name` | 31 |
| `top` | 29 |
| `pov` | 26 |
| `option` | 26 |
| `description` | 23 |
| `bottom` | 22 |
| `label` | 22 |
| `free` | 21 |
| `stat` | 20 |

(Uma frase pode servir a mais de um tipo — por isso a soma passa de 311.)

**Como o editor usa:** ao abrir a sheet de um slot, sugere frases com `slotTypes` contendo o tipo do slot **e** `text.length ≤ slot.maxChars`, ordenadas por: categoria primária do preset → tags do preset → demais categorias; 🎲 sorteia dentro desse conjunto. Frases com o texto idêntico ao valor atual são omitidas.

Cobertura mínima garantida: todo tipo de slot tem ≥ 20 frases; toda categoria tem frases para `title`, `caption`, `pov` e `message` (os quatro tipos mais usados).

## 5. O que fica para depois (v1.1)

- +50 presets (segunda leva) e packs temáticos (Humor, Trabalho, Futebol, Casal, Dinheiro, Rolê) com 20–50 presets cada.
- Sazonais via OTA: Carnaval, Copa/Brasileirão, Dia dos Namorados, Black Friday, Natal, Ano Novo.
- Frases geradas por IA como recurso PRO (não substitui a curadoria).

## 6. Decisões desta etapa para você aprovar

| # | Decisão | Rec. |
|---|---|---|
| 1 | Distribuição 15/8/7/5/5/4/3/3 (como no briefing); **33 free / 17 PRO** | sim |
| 2 | **10 populares, todos free** (vitrine de compartilhamento) | sim |
| 3 | `addedAt = 2026-09-05` em todos → "✨ Novidades" mostra o catálogo inteiro por 30 dias após o lançamento e depois só OTAs | sim |
| 4 | Manter a menção nominativa a "WhatsApp" em 1 preset (`humor-whatsapp-cinco-minutos`) e 1 frase | sim (é o lugar da piada; trocar por "no celular" se preferir zero marcas) |
| 5 | Linha editorial da seção 2 como regra para todo conteúdo futuro (incluindo OTA) | sim |
| 6 | Sugestões filtradas por `maxChars` do slot e ordenadas por categoria → tags → demais | sim |
| 7 | Os textos em si (seção 3): revise e marque o que quiser trocar — conteúdo é a parte mais subjetiva do produto | revisar |

**Próxima etapa após aprovação:** Etapa 7 — Implementação (scaffold do projeto, telas, componentes, engine de templates, seleção de imagem, editor, exportação, compartilhamento, persistência, estrutura de monetização). Antes de codar, escrevo o plano de implementação (writing-plans) para você aprovar a ordem das tarefas.

## 7. Segunda leva — 2026-09-05 (+5 layouts, +4 categorias, +25 presets, +89 frases)

Pedido do Carlos: mais formatos visuais, mais categorias e conteúdo viral incluindo "política".
A política entrou como **política do cotidiano** (regra 2 da linha editorial) — síndico, grupo do
condomínio, eleição do churrasco. Nada partidário: o layout `noticia` gera manchete falsa, e
manchete falsa com política real é violação de Deturpação na Play Store, além de restringir a
demanda de anúncios no AdMob.

### Layouts novos

| id | Nome | Plano | Canvas | Slots |
|---|---|---|---|---|
| `carimbo` | Carimbo | Free | 1080×1080 | `top`* · `stamp` · `reason`* |
| `procurado` | Procurado | Free | 1080×1350 | `name` · `reason` · `reward`* |
| `perfil` | Perfil | Free | 1080×1350 | `name` · `handle` · `bio` · `stat-1` · `stat-2`* · `stat-3`* · `caption`* |
| `carteirinha` | Carteirinha | **PRO** | 1080×1080 | `org` · `name` · `role` · `code` · `valid`* · `caption`* |
| `recibo` | Recibo | **PRO** | 1080×1350 | `store` · `item-1` · `item-2`* · `item-3`* · `total` · `note`* |

`*` = slot opcional. Todos usam só `rect` + `text` + `image` + `brand`, que é o que o `MemeCanvas` desenha.

### Categorias novas

| chip | id | Por quê |
|---|---|---|
| 🗳️ Politicagem | `politicagem` | Vocabulário político aplicado a condomínio, grupo da família e churrasco |
| 🐶 Pet | `pet` | Veio viral grande no Brasil, ausente do catálogo inicial |
| 🍔 Comida | `comida` | Delivery, geladeira, marmita, dieta que começa na segunda |
| 🤖 Tecnologia | `tecnologia` | IA, senha, atualização, wi-fi — atual sem depender de manchete datada |

### Os 25 presets novos

#### 🗳️ Politicagem

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `pol-sindico-some` — Síndico some no elevador | Notícia urgente | Free 🔥 | Síndico é visto no elevador e some antes de ouvir a reclamação · Moradores dizem que foi a terceira aparição relâmpago só neste mês. · Fonte: a câmera do hall |
| `pol-eleicao-churrasco` — Eleição da churrasqueira | Enquete | Free tags: familia | Quem vai cuidar da churrasqueira hoje? · Eu, mas reclamando · Você, óbvio · Ninguém. Vai frio mesmo |
| `pol-carimbo-negado` — Proposta negada no grupo | Carimbo | Free 🔥 tags: familia | MINHA PROPOSTA NO GRUPO DA FAMÍLIA · NEGADO · por unanimidade e sem ninguém explicar o motivo |
| `pol-procurado-audio` — Procurado por áudio longo | Procurado | Free tags: familia | O TIO DO GRUPO · mandar áudio de 8 minutos para dizer o que cabia em duas linhas · RECOMPENSA: SILÊNCIO |
| `pol-carteirinha-fiscal` — Fiscal do horário do lixo | Carteirinha | **PRO** | CONSELHO DO PRÉDIO · EU MESMO · Fiscal não remunerado do horário do lixo · Nº 0002/2026 · Válida até alguém discordar · Apresentar na reunião de condomínio |

#### 🐶 Pet

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `pet-olhar-comida` — O olhar na hora da comida | POV | Free 🔥 | seu cachorro te olha comer como se você nunca tivesse dado comida a ele |
| `pet-alerta-sofa` — Gato assume o sofá | Alerta | Free | GATO ASSUME O SOFÁ E RECUSA NEGOCIAÇÃO · Humanos foram realocados para o tapete até segunda ordem. |
| `pet-conversa-fome` — Tô com fome | Conversa | Free | Minha gata · Tô com fome · Acabei de te dar comida agora · Tô com fome |
| `pet-recibo-petshop` — Recibo do banho e tosa | Recibo | **PRO** | BANHO E TOSA DO BAIRRO · 1x Banho ................... 80,00 · 1x Tosa na tesoura ........ 120,00 · 1x Olhar de mágoa ....... incluso · R$ 200,00 · Ele não falou comigo pelo resto do dia |

#### 🍔 Comida

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `com-pov-cardapio` — A salada que não vinga | POV | Free 🔥 | você jura que vai comer salada e o cardápio abre direto na página do lanche |
| `com-noticia-marmita` — Marmita não identificada | Notícia urgente | Free tags: trabalho | Marmita é aberta na segunda e ninguém reconhece o conteúdo · A comida foi guardada na quinta anterior com a promessa de 'amanhã eu como'. · Fonte: o cheiro |
| `com-placar-sobremesa` — Eu × Sobremesa | Placar | Free | EU · 1 · SOBREMESA · 9 · 'Só um pedaço': 6 · 'Amanhã eu começo': 4 · Arrependimento: 10 |
| `com-carteirinha-madrugada` — Carteirinha da madrugada | Carteirinha | **PRO** | SINDICATO DA FOME · EU MESMO · Come de pé na frente da geladeira às 23h · Nº 0003/2026 · Renovada toda madrugada · Não apresentar para a nutricionista |

#### 🤖 Tecnologia

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `tec-senha-de-cor` — Essa senha eu sei de cor | Meme clássico | Free 🔥 | EU: ESSA SENHA EU SEI DE COR · A SENHA: |
| `tec-alerta-atualizacao` — Atualização na hora errada | Alerta | Free | CELULAR DECIDE ATUALIZAR NO PIOR MOMENTO POSSÍVEL · Restam 47 minutos. A bateria está em 8%. |
| `tec-perfil-ia` — Eu usando inteligência artificial | Perfil | Free | Eu usando IA · prompt.errado · Peço uma coisa, recebo outra, agradeço mesmo assim e finjo que era isso mesmo. · 3 / Tentativas · 0 / Ideia do que fiz · 1 / Obrigado por medo · Perfil conferido por ninguém |
| `tec-recibo-assinaturas` — Assinaturas esquecidas | Recibo | **PRO** tags: dinheiro | ASSINATURAS ESQUECIDAS · 1x Streaming que não uso ... 39,90 · 1x Academia digital ....... 29,90 · 1x Nuvem cheia de print ... 12,90 · R$ 82,70 · Cobrado todo mês desde 2023 sem eu perceber |

#### 😂 Humor

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `humor-perfil-segunda` — Meu perfil na segunda-feira | Perfil | Free tags: trabalho | Eu na segunda-feira · modo.aviao · Acordei, mas ainda não cheguei. Respondo depois do café. Talvez. · 0 / Disposição · 847 / Abas abertas · 1 / Café de vantagem · Perfil atualizado toda segunda |
| `humor-carteirinha-atraso` — Carteirinha de atrasado | Carteirinha | **PRO** | CONSELHO DOS ATRASADOS · EU MESMO · Sai de casa na hora em que era pra chegar · Nº 0004/2026 · Válida por tempo indeterminado · Já pode ir servindo, eu chego |

#### 👨‍👩‍👧 Família

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `fam-procurado-controle` — Procurado: o controle da TV | Procurado | Free | O CONTROLE DA TV · sumir entre as almofadas na hora exata em que alguém quer trocar de canal · RECOMPENSA: PAZ |
| `fam-carimbo-dormir-fora` — Pedido negado em casa | Carimbo | Free | EU PEDINDO PRA DORMIR NA CASA DO AMIGO · NEGADO · sem direito a recurso e sem explicação até hoje |

#### 🎓 Faculdade

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `fac-carimbo-falta` — Justificativa recusada | Carimbo | Free | MINHA JUSTIFICATIVA DE FALTA · RECUSADA · por ser a mesma da semana passada, com a mesma vírgula |
| `fac-procurado-grupo` — Procurado no trabalho em grupo | Procurado | Free | O DO GRUPO · sumir no trabalho em grupo e reaparecer na hora de colocar o nome · RECOMPENSA: NENHUMA |

#### 🍺 Rolê

| Preset | Layout | Plano | Textos |
|---|---|---|---|
| `role-perfil-domingo` — Eu no domingo | Perfil | Free | Eu no domingo · nunca.mais.bebo · Prometi parar às 23h. Cheguei em casa às 5h. Hoje só existo em modo economia. · 0 / Energia · 17 / Arrependimentos · 1 / Promessa quebrada · Até sábado que vem |
| `role-recibo-sabado` — Recibo do sábado | Recibo | **PRO** tags: dinheiro | ROLÊ DE SÁBADO LTDA · 1x 'só uma e vou embora' .... 89,90 · 4x Rodada da firma ......... 210,00 · 1x Carro de app às 4h ....... 78,50 · R$ 378,40 · Parcelado em 12x na dignidade |

### Frases novas

89 frases nas quatro categorias novas (23 politicagem · 22 pet · 22 comida · 22 tecnologia),
cobrindo `top`, `bottom`, `title`, `description`, `pov`, `caption`, `message`, `option`,
`label`, `stat`, `name` e `free`. Sem elas o botão "Sugestões" abriria vazio nas categorias novas.

### Pendente

**Revisão visual dos 5 layouts novos no aparelho** (`printvirameme://dev-canvas`). O validador
garante geometria dentro do canvas, `maxChars` e regra editorial — não garante que ficou bonito
nem que o texto não encavalou num `rect`.

---

## 8. Terceira leva — 2026-09-07 (tecnologia: +12 presets, +37 frases)

Pedido do Carlos: buscar memes da atualidade na internet e engordar as categorias, começando por
🤖 Tecnologia, que estava a mais pobre do catálogo (4 presets). Escopo aprovado: **só tecnologia
nesta leva**; as outras 11 categorias ficam para a próxima, com o mesmo padrão.

### O que a pesquisa achou — e por que quase nada entrou como veio

Os virais de 2026 são presos a pessoa real, reality, filme ou marca (Gigachad, Drake, o drone do
Ryan Gosling, a risada da Sarah Andrade, "Casa do Patrão", Copa 2026, "nervosismo surreal"). A
regra 3 da linha editorial barra todos. E o app não distribui imagem de meme nenhuma — a foto é o
print do usuário. Então importamos duas coisas, não a terceira:

1. **A gramática da piada** — calma no meio do desastre → `alerta`/`manchete`; escolha impossível →
   `enquete`; escalada de números → `grafico`; "ninguém: / eu:" → `classic`; consequência chegando
   na pior hora → `nota`; derrota mansa e autodepreciativa → `legenda`.
2. **Os temas de tecnologia de 2026** — IA que erra com confiança e reporta sucesso, pedir à IA e
   não entender a resposta, "isso é foto real?", assinatura que sobe de preço sozinha, algoritmo
   que sequestra a feed, curtida sem querer em post antigo, verificação em duas etapas, chatbot de
   suporte, armazenamento cheio, termos aceitos sem ler, bateria em 1%.
3. **A imagem do meme** — não importamos. Nunca.

Fontes consultadas: [Memebuilder — trending templates 2026](https://www.memebuilder.ai/blog/trending-meme-templates-2026) ·
[CanIPhish — 35 IT memes](https://caniphish.com/blog/technology-memes) ·
[I Can't Compute — tech humor 2026](https://icantcompute.com/blogs/news/tech-humor-trends-whats-making-developers-laugh-in-2026) ·
[Tediado — virais de 2026](https://www.tediado.com.br/08/memes-2026-os-virais/) ·
[Tediado — 35 memes da vida real](https://www.tediado.com.br/11/35-memes-da-vida-real-que-todo-brasileiro-vai-entender/) ·
[ProgrammerHumor 2026](https://programmerhumor.io/memes/2026).

### Os 12 presets novos

| # | Preset | Layout | Plano | Textos |
|---|---|---|---|---|
| 5 | `tec-ia-seis-pastas` — IA organizou tudo | Notícia urgente | Free 🔥 tags: trabalho | IA cria seis pastas, renomeia o arquivo errado e avisa que deu tudo certo · O usuário pediu apenas para organizar a área de trabalho. O contrato segue desaparecido. · Fonte: a lixeira do computador |
| 6 | `tec-conversa-ia` — Excelente pergunta | Conversa | Free 🔥 tags: trabalho | Assistente de IA · Pronto! Organizei todos os seus arquivos · Perfeito. E onde ficou o meu contrato? · Excelente pergunta! Também não sei |
| 7 | `tec-enquete-real-ou-ia` — Real ou feito por IA | Enquete | Free | Essa foto aí é real ou foi feita por IA? · Sei lá mais o que é real · Real · Feita por IA |
| 8 | `tec-pov-algoritmo` — O algoritmo decidiu | POV | Free | você vê um vídeo por educação e o aplicativo decide que agora isso é a sua personalidade |
| 9 | `tec-nota-curtida` — Curtida sem querer | Bilhete | **PRO** tags: relacionamento | Se chegou notificação minha às 2 da manhã numa foto de 2019: foi sem querer, eu já me arrependi e não pretendo mais sair de casa. |
| 10 | `tec-procurado-prints` — Os prints que ninguém abre | Procurado | Free | OS 4.812 PRINTS · Ocupam a memória inteira do celular e nunca mais foram abertos por ninguém. · Recompensa: 2 GB livres |
| 11 | `tec-duas-etapas` — Verificação em duas etapas | Meme clássico | Free 🔥 | EU: SÓ VOU ENTRAR RAPIDINHO · A VERIFICAÇÃO EM DUAS ETAPAS: |
| 12 | `tec-placar-chatbot` — Eu × O chatbot | Placar | Free | EU · 0 · O CHATBOT · 9 · Digitei 'atendente': 7 · Respostas úteis: 0 · Links de ajuda: 14 |
| 13 | `tec-legenda-termos` — Li e concordo | Legenda | Free | Eu aceitando 84 páginas de termos de uso em dois segundos para ver um vídeo de 15 |
| 14 | `tec-manchete-bateria` — 1% de bateria | Manchete | Free | TECNOLOGIA · Celular fica 40 minutos em 1% e desliga na hora exata da foto · O dono jura que estava com o carregador na mão. Ninguém acredita. |
| 15 | `tec-grafico-assinatura` — O preço da assinatura | Gráfico | **PRO** tags: dinheiro | O preço da assinatura ao longo dos anos · Valor mensal · 2023 · 2024 · 2025 · hoje |
| 16 | `tec-certificado-prompt` — Certificado de prompt | Certificado | **PRO** | Você · por explicar para uma inteligência artificial, em catorze tentativas, exatamente o que você já sabia desde a primeira · A IA, exausta · Hoje, de novo |

Tecnologia sai de 4 presets em 3 layouts para **16 presets em 13 layouts** (12 free / 4 PRO), com
3 novos 🔥 populares. Todos com `addedAt: 2026-09-07`, então também aparecem na vitrine "✨ Novos".

### As 37 frases novas

Tecnologia sai de 22 para **59 frases**: 4 `top` · 4 `bottom` · 5 `title` · 3 `description` ·
3 `pov` · 3 `caption` · 4 `message` · 3 `option` · 2 `label` · 3 `stat` · 1 `name` · 2 `free`.
Onze delas levam categoria secundária (`trabalho`, `dinheiro`, `relacionamento`), então também
sobem no ranking de sugestões dessas categorias.

### Distribuição depois desta leva

| | antes | depois |
|---|---|---|
| Presets | 75 (52 free / 23 PRO) | **87** (61 free / 26 PRO) |
| Frases | 400 | **437** |
| 🔥 Populares | 15 | **18** |
| 🤖 Tecnologia | 4 presets / 22 frases | **16 presets / 59 frases** |

`validateCatalog(…, { strict: true })` → `ok: true`, 0 erros, 0 avisos · `npm test` todo verde ·
`tsc --noEmit` limpo. Os 12 presets novos também passam pelo `resolveLayout` real (com e sem
faixa de marca) sem nenhum texto saindo do canvas.

### Pendente

1. **As outras 11 categorias** — mesma leva, mesmo método (~28 presets e ~110 frases).
2. **Três formatos de 2026 sem layout que os comporte:** comparação em dois painéis
   ("❌ isso / ✅ aquilo"), barra de carregamento ("Carregando minha vontade de trabalhar… 3%") e
   tela de termos de uso. Cada um é layout novo — JSON de coordenadas, validador e conferência no
   `MemeCanvas`. Etapa à parte.
