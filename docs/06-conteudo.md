# Print Vira Meme — Conteúdo (Etapa 6)

**Status:** v1.0 — aprovada em 2026-09-05 (7 decisões da seção 6 aceitas) · **Depende de:** [05-modelo-template.md](05-modelo-template.md)

Arquivos entregues (caminhos definitivos do app):

| Arquivo | Conteúdo |
|---|---|
| [src/content/presets/*.json](../src/content/presets/) | **50 presets**, um arquivo por categoria |
| [src/content/phrases/*.json](../src/content/phrases/) | **311 frases** de sugestão, um arquivo por categoria |

**Validação:** `validateCatalog(…, { strict: true })` → `ok: true`, 0 erros, 0 avisos (14 layouts · 50 presets · 311 frases · 8 categorias). Toda categoria tem ≥ 3 presets e ≥ 50% free; todo preset respeita `maxChars` de cada slot; nenhuma frase passa de 90 caracteres.

---

## 1. Distribuição

| Categoria | Presets | Free / PRO | Populares | Frases (categoria primária) |
|---|---|---|---|---|
| 😂 Humor | 15 | 11 / 4 | 2 | 72 |
| 💼 Trabalho | 8 | 5 / 3 | 2 | 52 |
| ❤️ Relacionamento | 7 | 4 / 3 | 1 | 43 |
| 💸 Dinheiro | 5 | 3 / 2 | 1 | 37 |
| ⚽ Futebol | 5 | 3 / 2 | 1 | 39 |
| 👨‍👩‍👧 Família | 4 | 3 / 1 | 1 | 28 |
| 🎓 Faculdade | 3 | 2 / 1 | 1 | 20 |
| 🍺 Rolê | 3 | 2 / 1 | 1 | 20 |
| **Total** | **50** | **33 / 17** | **10** | **311** |

A distribuição por categoria é exatamente a do briefing (15 / 8 / 7 / 5 / 5 / 4 / 3 / 3). Free/PRO global: **33 / 17** (66% free). Os 10 populares são todos free — "🔥 Populares" é vitrine de compartilhamento, não de conversão.

Layouts usados pelos presets: classic ×4, noticia ×4, pov ×5, placar ×3, manchete ×1, legenda ×4, conversa ×5, alerta ×5, enquete ×2 (free) · podio ×3, grafico ×3, certificado ×5, nota ×2, balao ×4 (PRO). Todos os 14 layouts têm pelo menos um preset.

## 2. Linha editorial (vale para presets, frases e OTAs futuras)

1. **Identificação imediata:** cada preset responde "em qual grupo eu mandaria isso?" (família, trabalho, pelada, casal, rolê). Se não responde, não entra.
2. **Zoeira leve:** ri *com*, não *de*. Sem política, religião, corpo/aparência, doença, dinheiro alheio de verdade. O alvo da piada é sempre "eu" ou uma situação universal ("o cunhado", "a segunda-feira").
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
