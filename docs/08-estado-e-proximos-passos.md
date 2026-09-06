# Print Vira Meme — Estado atual e o que falta

**Atualizado:** 2026-09-05 · **Leia isto primeiro ao retomar o projeto.**

---

## 0. Onde está o código

| | |
|---|---|
| Repositório | `git@github.com:ceosdev/print_vira_meme.git` |
| Branch estável | **`main`** — tudo integrado e pushado (Etapas 1 a 7 + correções do aparelho + segunda leva do catálogo) |
| Último commit | `1415f5d` |
| Branch aberta | nenhuma |

O `gh` CLI não está autenticado nesta máquina; o push usa SSH (chave já funciona).

### Como rodar no celular

```bash
cd ~/projects/cartech/print_vira_meme
npx expo start -c
```

⚠️ **Esta máquina (WSL2) não tem toolchain Android**: sem JDK 17, sem Android SDK e sem `adb`
(o único Java no lado Windows é um JDK 1.7). Então `adb reverse` e `npx expo run:android` **não
funcionam aqui** — por isso o dev build vai por EAS Build na nuvem (ver `09-dev-build.md`).
Sem cabo: `npx expo start --tunnel` (o ngrok cai com frequência).

Rotas de QA (sem link na Home desde `e5ecf56`): no Expo Go use
`exp://<ip-da-maquina>:8081/--/dev-canvas` e `/--/dev-doctor`; no dev build,
`printvirameme://dev-canvas`.

### Verificações

```bash
npm test           # 151 testes / 29 suítes
npm run typecheck  # tsc --noEmit
npx expo lint
npm run validate:catalog   # 19 layouts · 75 presets · 400 frases · 12 categorias
```

---

## 1. O que está pronto

Todas as etapas de planejamento estão aprovadas e documentadas em `docs/`:

| Etapa | Documento | Conteúdo |
|---|---|---|
| 1 | `01-product-spec.md` | proposta, personas, monetização (PRO R$ 19,90 vitalício), viralização, métricas |
| 2 | `02-ux.md` | todas as telas, estados, AdGate, gatilhos de paywall, permissões |
| 3 | `03-ui.md` | tema escuro, amarelo = ação, gradiente = PRO, Rubik, 8 fontes de meme |
| 4 | `04-arquitetura.md` | stack, serviços por contrato, escala `1080/PixelRatio`, decisões técnicas |
| 5 | `05-modelo-template.md` | schema de layout + zod + 19 layouts |
| 6 | `06-conteudo.md` | 75 presets e 400 frases, linha editorial (seção 7 = segunda leva) |
| 7 | `07-pendencias-deploy.md` | **placeholders a trocar antes de publicar** |

Planos de implementação executados: `docs/superpowers/plans/` (fundação, núcleo visual, telas).

### Aplicação

- **Fluxo completo:** Home → foto (galeria/câmera) → catálogo (cards com preview ao vivo usando a foto do usuário) → editor (texto, sugestões, fontes, estilo, enquadramento) → gerar → resultado (compartilhar, salvar, outro template, convidar) → paywall e configurações.
- **Motor de templates:** JSON validado por zod; substituição de variáveis, visibilidade condicional, migração de textos entre layouts, `autoFit`.
- **Canvas:** um único `MemeCanvas` serve card, editor e exportação — muda só a escala. Exporta em 1080 px (2160 no PRO) com o mesmo layout do preview.
- **Serviços reais:** imagem (picker + resize 1600/480 + cache), exportação (view-shot off-screen), compartilhamento, galeria. **Mocks ainda:** compras, anúncios, analytics, crash.
- **Regras de negócio testadas:** AdGate, paywall com continuação após a compra, entitlements, contadores.
- **Catálogo (segunda leva, `3a956f2`):** 19 layouts · 75 presets · 400 frases · 12 categorias.
  Layouts novos: carimbo, procurado, perfil (free) · carteirinha, recibo (PRO). Categorias novas:
  🗳️ Politicagem (política do cotidiano — síndico, condomínio, churrasco; **nada partidário**,
  ver regra 2 da linha editorial em `06-conteudo.md`), 🐶 Pet, 🍔 Comida, 🤖 Tecnologia.
  **Pendente: revisão visual dos 5 layouts novos em `/dev-canvas`** — o validador garante
  geometria e `maxChars`, não estética.

### Verificado no aparelho (Android 16, Expo Go)

- `/dev-doctor` (link 🩺 na Home em `__DEV__`): **10/10 passos OK**, incluindo exportar meme 1080×1080 em 181 ms.
- Fluxo completo criando meme: **funciona**.
- **Pendente de confirmação:** arraste/pinça da foto e "Mover textos · PRO" depois da correção de worklets (commit `e1406a1`).

### O que NÃO funciona no Expo Go (precisa de dev build)

Salvar na galeria · compras · anúncios · receber imagem por "Compartilhar → Print Vira Meme".

---

## 2. O que falta

### Etapa 8a — Dev build (próximo passo) — ver `09-dev-build.md`
`eas.json` já está no repo com os perfis development/preview/production. Falta o que só o Carlos
pode fazer: criar a conta grátis em expo.dev, `npx eas-cli@latest login`, `npx eas-cli@latest init`
e colar o `projectId` no `app.config.ts` (config dinâmico — a CLI não escreve sozinha).
Depois: `npx eas-cli@latest build --platform android --profile development`.

### Etapa 8b — Monetização
1. (feito) ~~Gerar dev build~~ → passou a ser a Etapa 8a.
2. RevenueCat (`react-native-purchases`) implementando `PurchaseService` — o contrato já existe em `src/types/services.ts`; hoje o registro usa `createMockPurchaseService`.
3. AdMob (`react-native-google-mobile-ads`) implementando `AdsService` (interstitial com as regras já testadas em `src/utils/adRules.ts`).
4. Play Console: criar o produto não consumível `pvm_pro_lifetime` (R$ 19,90) e o entitlement `pro` no RevenueCat.

### Etapa 9 — Lançamento
PostHog (`AnalyticsService`) · Sentry (`CrashService`) · EAS Update · ícone e splash definitivos · política de privacidade hospedada · screenshots e ficha da Play · checklist de release · remover/ocultar `/dev-doctor` e `/dev-canvas`.

### v1.1 (decidido na Etapa 1, fora do MVP)
Packs de templates · rewarded ads · favoritos · **histórico dos memes** · +50 presets · sazonais via OTA.

### Decisões em aberto (perguntas do Carlos)
1. **Histórico** — hoje não existe tela de "meus memes"; o que é salvo vai para a galeria do Android. Ele perguntou onde vê os salvos: decidir se antecipa o histórico para o MVP.
2. **Foto persistente nos cards** — depois de criar um meme, a foto continua aparecendo em todos os templates (é proposital: mostra como ficaria). Avaliar se limpa ao voltar para a Home.

---

## 3. Armadilhas já encontradas (não repetir)

1. **Os testes mockam tudo que é nativo.** 150 testes verdes não provam que funciona no aparelho — o `@gorhom/bottom-sheet` passava nos testes e não renderizava no celular. Sempre validar fluxo novo no dispositivo.
2. **Sheets:** trocadas por `Modal` do React Native (`src/components/ui/Sheet.tsx`). Não voltar para biblioteca de sheet sem necessidade real.
3. **Gestos dentro de ScrollView:** usar o `ScrollView` do `react-native-gesture-handler` + `blocksExternalGesture(ref)`, senão a rolagem engole o arraste.
4. **Worklets:** todos os callbacks de um gesto precisam ser inline e marcados `'worklet'`. Passar referência de função quebra o conjunto.
5. **Nada de controle por cima da arte:** o preview tem que ser idêntico ao arquivo exportado.
6. **Edições por script:** sempre `assert` que a substituição aconteceu antes de reportar pronto.
7. **React Compiler (SDK 57):** proíbe `setState` dentro de efeito — usar store/estado derivado.
