# Conta Google Play e distribuição — roteiro

**Atualizado:** 2026-09-05 · **Decisão pendente:** rota pessoal ou organização (Carlos decide em 06/09).

---

## 0. Situação

A conta de desenvolvedor antiga foi **encerrada em 31/03/2024 por inatividade**
(alerta em 23/01/2024, prazo em 22/03/2024).

- **Não é reversível.** Encerramento por inatividade não tem reativação nem recurso documentado,
  e já se passaram dois anos e meio. O próprio aviso do console manda criar uma conta nova.
- **Não há risco de banimento.** Encerramento por inatividade é administrativo, não é violação de
  política. Quando o Google encerra por violação, criar outra conta é em si uma infração e a nova
  é associada e banida — **não é o caso aqui**. Criar conta nova é a orientação do próprio Google.
- **Custo:** os US$ 25 antigos foram perdidos (não reembolsáveis, não transferíveis). Paga de novo.
- **`com.cartech.printvirameme` está livre** — a conta encerrada nunca publicou nada. Se tivesse
  publicado, o package name estaria queimado para sempre.

### Prazo do Brasil — 30/09/2026

O Brasil é um dos 4 países da primeira leva da **Verificação de Desenvolvedor Android**
(com Indonésia, Singapura e Tailândia). A partir de **30/09/2026**, num aparelho Android
certificado no Brasil, um app de desenvolvedor não verificado **não instala nem atualiza pelo
fluxo normal** — só por ADB ou pelo "fluxo avançado" (ligar modo dev, reiniciar, esperar 24h,
reautenticar). Nenhum testador leigo vai fazer isso.

Consequência prática: **a distribuição de APK por link tem prazo de validade.** Uma conta
Play Console ativa resolve a verificação.

---

## 1. Parte que não depende da decisão — fazer já

Nada aqui precisa de conta Play. É o que destrava todo o resto, nas duas rotas.

```bash
cd ~/projects/cartech/print_vira_meme
npx eas-cli@latest login          # conta grátis em expo.dev
npx eas-cli@latest init           # ver aviso do projectId abaixo
npx eas-cli@latest build --platform android --profile development
```

⚠️ **`projectId`:** o config é dinâmico (`app.config.ts`, não `app.json`), então o `eas init`
**não escreve o `projectId` sozinho** — ele imprime na tela e alguém precisa colar em
`app.config.ts` (`extra.eas.projectId`). Hoje o campo está **ausente**.

⚠️ **Keystore:** na primeira build o EAS pergunta se pode gerar a keystore de assinatura —
responder **sim**. Ela fica na conta Expo e é a mesma que assina o app na Play.
**Perder essa keystore = perder a capacidade de atualizar o app publicado.**

**Por que EAS e não build local:** esta máquina (WSL2) não tem JDK, Android SDK, `adb` nem
`ANDROID_HOME` — verificado. O EAS compila na nuvem; só precisa de Node. Ver `09-dev-build.md`.
O plano grátis tem fila e limite mensal de builds.

Depois do dev build instalado, fechar o checklist de `09-dev-build.md`. O item que importa
para a distribuição: **salvar na galeria** (risco conhecido do `blockedPermissions`).
Um testador que não consegue salvar o meme não está testando o produto.

---

## 2. Como as pessoas testam — as três opções

### Expo Go — descartado para testadores

- Precisa se conectar ao servidor de desenvolvimento **da sua máquina**. Ou a pessoa está na sua
  rede, ou depende de túnel ngrok (que cai). Você vira a infraestrutura dela.
- Metade do app não funciona: salvar na galeria, receber por "Compartilhar", compras e anúncios.

Continua útil **só para o Carlos**, iterando JS no próprio celular.

### APK standalone (perfil `preview`) — funciona até 30/09

`eas.json` já tem o perfil. APK autônomo, JS embutido, módulos nativos dentro. O EAS devolve
link/QR; a pessoa instala autorizando "fontes desconhecidas".

⚠️ É exatamente este fluxo que a verificação de desenvolvedor bloqueia no Brasil a partir de
**30/09/2026** — inclusive para atualizar o que já foi instalado.

### Teste Interno da Play Console — a recomendação

- Até **100 testadores** por e-mail; instalam **pela própria Play Store**, por link de opt-in.
- Sem sideload, sem "fontes desconhecidas", sem problema de verificação. Atualização automática.
- Disponível **imediatamente** após a conta existir.
- **Não está sujeito ao requisito de 12 testadores / 14 dias** — aquilo trava a produção, não o teste.

---

## 3. As trilhas da Play e o requisito 12/14

**Esclarecimento importante:** os 12 testadores por 14 dias **não são depois de publicar**.
São a condição **para poder publicar**. Uma conta pessoal nasce com a trilha de produção
bloqueada, e o teste fechado é a chave que destranca.

| Trilha | Quem enxerga | Sujeita ao 12/14? |
|---|---|---|
| **Teste interno** | até 100 pessoas por e-mail | **Não** — liberada de imediato |
| **Teste fechado** | grupos definidos por você | **É aqui que o relógio corre** |
| **Teste aberto** | qualquer um com o link | depois |
| **Produção** | público, buscável na loja | **bloqueada até cumprir** |

### O fluxo, na ordem

1. Conta criada, US$ 25 pagos, verificação de identidade concluída.
2. App criado na Play Console com a **ficha completa** (ver seção 5 — é o gargalo real).
3. AAB numa trilha de **teste fechado** + lista de testadores.
4. O release passa por **revisão do Google** antes de ficar disponível (alguns dias).
5. Cada testador precisa ter conta Google, **aceitar o convite de opt-in** e instalar.
6. **Relógio:** ao menos **12 testadores inscritos simultaneamente por 14 dias corridos**.
   Se alguém sai no dia 10, o contador daquela pessoa zera. Com 11 inscritos, o dia não conta.
7. **Desde 2026 o Google verifica uso real** — instalar e esquecer não vale. Os testadores
   precisam usar os recursos do app de forma compatível com uso de produção.
8. Cumpridos os 14 dias: **"Solicitar acesso à produção"** + questionário (como foi o teste,
   que feedback veio, o que mudou por causa dele).
9. Revisão do Google: **~7 dias**, podendo passar. **Pode ser negado.**
10. Aprovado, a produção destrava.

### Operação do teste fechado (se a rota for pessoal)

- **Meta: 18 a 20 inscritos, não 12.** Doze é o piso exato; uma desistência derruba o requisito.
- **A conta de desenvolvedor não conta** como testador.
- **Armadilha nº 1:** a pessoa passa um e-mail e usa **outro** na Play Store do celular.
  Pedir literalmente: *"o e-mail da conta Google que você usa na Play Store desse celular"*.
- **Uso real:** grupo de WhatsApp pedindo **um meme por semana de cada um, postado no grupo**.
  Cumpre o requisito e gera o feedback que o questionário da etapa 8 vai cobrar.
- **Avisar explicitamente:** não desinstalar e não sair do programa durante as duas semanas.
- Subir build novo na trilha fechada **não zera o contador** — conta o tempo de inscrição dos
  testadores, não a versão. Dá para testar o `pvm_pro_lifetime` com license testers, sem cobrança.

---

## 4. As duas rotas

### Rota A — Conta de organização (CNPJ da Cartech)

**Exigências**, além das da conta pessoal:

| Campo | Observação |
|---|---|
| **Número D-U-N-S** | obrigatório |
| **Site da organização** | obrigatório |
| Nome e endereço da organização | razão social exata da Receita |
| Telefone da organização | |
| Nome do contato (representante) | |
| Telefone do desenvolvedor exibido no perfil | |

Documentos na verificação: registro da empresa (Cartão CNPJ, Contrato Social) e **comprovante de
endereço físico** — a documentação diz que **não** pode ser endereço de agente registrado.

**D-U-N-S:** grátis, pela Dun & Bradstreet (no Brasil, CIAL D&B). Ninguém precisa pagar por isso;
existe gente vendendo "emissão rápida" — ignorar. **Primeiro consultar se a Cartech já tem** —
muitas empresas têm sem saber, e isso pula o prazo inteiro.
Prazo oficial **até 30 dias úteis**, na prática 5 a 10. Os dados precisam bater **exatamente** com
a Receita: **razão social**, não nome fantasia. O erro de verificação mais comum é nome legal
divergente entre o documento e o que foi digitado no console.

**Ganha:** isenção do teste fechado 12/14 — a política é escopada, no título e no texto, a
*contas pessoais criadas depois de 13/11/2023*. Corta **4 a 8 semanas**.

**Assume:**
- O app fica sob a empresa. Receita da compra PRO e do AdMob entra na Cartech — CNAE, nota,
  tributação. Se for MEI, conta no teto de faturamento. **Decisão contábil, não técnica.**
- Verificação mais longa (valida você e a empresa).

**Não perde:** o nome exibido na loja. A documentação é explícita que o nome do desenvolvedor pode
diferir do nome civil/razão social — dá para publicar como "Print Vira Meme".

**Obstáculos a checar antes:**
1. A Cartech tem site? É campo obrigatório. *(Resolve junto com a política de privacidade —
   um site com `/privacidade` mata o requisito da conta e a pendência nº 2 do `07-pendencias-deploy.md`.)*
2. O endereço do CNPJ passa como endereço físico? Se está no contador, escritório virtual ou
   coworking, a verificação pode reprovar.

**Por que o prazo do D-U-N-S não dói:** ele **não está no caminho crítico**. Pelo
`08-estado-e-proximos-passos.md` ainda faltam a Etapa 8 inteira (RevenueCat + AdMob) e a Etapa 9
(PostHog, Sentry, ícone e splash, screenshots, ficha). É mais de um mês de trabalho real —
o D-U-N-S chega antes de ser necessário. Espera em paralelo em vez de espera em série.

**O preço:** entre agora e a conta sair, não há Teste Interno. E depois de 30/09 o APK por link
aperta. Incômodo de algumas semanas, não bloqueio: o dev build no aparelho continua funcionando.

### Rota B — Conta pessoal

**Exigências:** nome civil, endereço oficial, e-mail e telefone de contato, documento de
identidade. Sem D-U-N-S, sem site.

**Ganha:** conta criada já na semana 1 → resolve a verificação de 30/09 sem aperto, e o
Teste Interno destrava de imediato.

**Assume:** o teste fechado obrigatório — 12 testadores, 14 dias corridos, uso real,
mais a revisão de acesso à produção. **4 a 8 semanas a mais.**

⚠️ **A inversão que esta rota força:** não dá para iniciar o relógio de 14 dias sem a **ficha da
loja completa**. Logo, os itens que o `08-estado-e-proximos-passos.md` coloca na Etapa 9
(ícone e splash definitivos, política hospedada, screenshots, ficha) **saem do fim e vão para o
começo** — viram caminho crítico. Cada dia com o ícone do template do Expo é um dia a mais no fim.

### Sobre converter pessoal → organização depois

A conversão existe (Conta de desenvolvedor → Sobre você → Alterar o tipo de conta, com D-U-N-S e
documentos). **Não confiar nisso como estratégia:** não há documentação do Google confirmando que
converter **remove** o requisito 12/14 de uma conta nascida pessoal depois de 13/11/2023.
Se não remover, os US$ 25 foram pagos e as 8 semanas continuam lá. Se for para tentar, confirmar
por escrito com o suporte da Play **antes** de contar com isso.

### Comparação

| | Organização | Pessoal |
|---|---|---|
| Pré-requisito | D-U-N-S (5–30 dias úteis) + site + docs da empresa | Documento de identidade |
| Teste fechado 12/14 | **isento** | **obrigatório** |
| Conta pronta em | ~3–5 semanas | ~1 semana |
| Até a produção | **~4–5 semanas** | **~9 semanas** |
| Cobre o prazo de 30/09 | apertado | folgado |
| Receita | entra no CNPJ (CNAE, nota, teto do MEI) | pessoa física |
| Ficha da loja | pode seguir na Etapa 9 | **vira caminho crítico** |

---

## 5. Bloqueadores da ficha da loja (valem nas duas rotas)

Para criar **qualquer** release — inclusive em trilha de teste — a ficha precisa estar completa.

| Item | Estado em 05/09 | Onde |
|---|---|---|
| **Ícone definitivo** + 512×512 | 🔴 **ainda é o template do Expo** (verificado: o "A" azul com guias) | `assets/icon.png` |
| **Splash definitivo** | 🔴 template | `assets/splash-icon.png` |
| **Política de privacidade hospedada** | 🔴 `printvirameme.com.br` não existe | `src/config/app.ts` → `PRIVACY_URL` |
| **Feature graphic** 1024×500 | 🔴 não existe | |
| **Screenshots** (mín. 2 de celular) | 🔴 não existem | |
| Descrição curta (80) + completa | 🔴 | |
| Classificação indicativa | 🔴 | questionário |
| Segurança de dados | 🔴 | declarar foto/câmera; o `blockedPermissions` ajuda |

**Atalho da política de privacidade:** GitHub Pages resolve em ~1h, sem comprar domínio.
Na rota organização, o site da empresa serve para as duas coisas.

**Vantagem de screenshots:** os 19 layouts geram imagens boas de graça — fazer memes reais no app.

Ver também `07-pendencias-deploy.md` (itens 1, 2, 3 e 6).

---

## 6. Cronogramas

### Rota A — organização

| Quando | Marco |
|---|---|
| Hoje | Consultar/solicitar D-U-N-S; conferir endereço do CNPJ; conferir site da empresa |
| Semana 1 | `eas init` + dev build + checklist de `09-dev-build.md` |
| Até 30/09 | Se quiser testadores nessa janela, gerar APK `preview` e distribuir **antes** do prazo |
| Semanas 2–4 | Site da empresa no ar com `/privacidade`; ícone, splash, ficha |
| D-U-N-S na mão | Criar conta de organização (US$ 25) + verificação |
| Em paralelo | Etapa 8 — RevenueCat e AdMob |
| Conta aprovada | Teste interno → **produção, sem teste fechado obrigatório** |

**≈ 4 a 5 semanas.**

### Rota B — pessoal

| Data | Marco |
|---|---|
| 05–07/09 | `eas init`, dev build, checklist do aparelho |
| 07–12/09 | Conta pessoal criada (US$ 25) + verificação de identidade |
| até 30/09 | ✅ verificação de desenvolvedor do Brasil resolvida pela conta |
| 12–26/09 | **Ícone, splash, política, screenshots, ficha** (caminho crítico) |
| ~28/09 | Teste interno com 3–5 pessoas — ensaio geral |
| ~05/10 | Teste fechado publicado · **recrutar 20 testadores** |
| ~08/10 | 12+ inscritos confirmados → **relógio começa** |
| 08–22/10 | 14 dias correndo · **Etapa 8 em paralelo** |
| ~22/10 | Solicitar acesso à produção |
| ~29/10–05/11 | Revisão do Google |
| **início de novembro** | **Produção** |

**≈ 9 semanas.**

### Riscos da rota B

| Risco | Mitigação |
|---|---|
| Ficha incompleta atrasa o início do relógio | Ícone e política em setembro, não na Etapa 9 |
| Cair abaixo de 12 inscritos | Recrutar 20 |
| Testador com e-mail errado | Conferir um a um antes de dar o relógio por iniciado |
| Salvar na galeria quebrado | Resolver antes de qualquer testador ver o app |
| Acesso à produção negado | Resposta genérica no questionário é causa comum — escrever sobre feedback real |

---

## 7. Pergunta em aberto para a decisão

**A Cartech é MEI, ME/Simples ou LTDA?** Se for MEI, checar CNAE e teto de faturamento antes de
plugar receita de app + AdMob no CNPJ. Não muda nada do lado técnico; muda o lado contábil.

---

## 8. Fontes

- [Closure of inactive developer accounts](https://support.google.com/googleplay/android-developer/answer/11605267)
- [Choose a developer account type](https://support.google.com/googleplay/android-developer/answer/13634885)
- [Required information to create a Play Console developer account](https://support.google.com/googleplay/android-developer/answer/13628312)
- [Verify your developer identity information](https://support.google.com/googleplay/android-developer/answer/10841920)
- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Keeping your developer account information up to date](https://support.google.com/googleplay/android-developer/answer/13634888)
- [Understanding Android developer verification](https://support.google.com/android-developer-console/answer/16561738)
- [Android developer verification — Android Developers Blog](https://android-developers.googleblog.com/2026/06/android-developer-verification.html)
- [D-U-N-S Number — CIAL Dun & Bradstreet](https://pt.cialdnb.com/en/duns-number)
