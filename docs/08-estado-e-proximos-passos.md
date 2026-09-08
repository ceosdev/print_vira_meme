# Print Vira Meme — Estado atual e o que falta

**Atualizado:** 2026-09-05 · **Leia isto primeiro ao retomar o projeto.**

---

## Retomando (sessão de 2026-09-06 em diante)

Tudo commitado e pushado. Nada em andamento, nenhuma branch aberta, nenhum arquivo solto.

```bash
cd ~/projects/cartech/print_vira_meme
git pull                    # deve dizer "Already up to date"
npm test && npm run typecheck && npx expo lint && npm run validate:catalog
```
Esperado: **158 testes / 30 suítes · tsc limpo · lint exit 0 · 19 layouts · 75 presets · 400 frases · 12 categorias**.
Se algum número mudou sem ninguém ter mexido, pare e descubra por quê antes de seguir.

**As duas coisas que travam o avanço, e as duas são do Carlos:**

1. **Revisão visual dos 5 layouts novos** (carimbo, procurado, perfil, carteirinha, recibo).
   Roda em Expo Go, não precisa de dev build:
   ```bash
   npm run start
   ```
   e abrir `exp://192.168.0.59:8081/--/dev-canvas` no celular (ver armadilha 11 antes). Procurar texto encavalando em
   `rect`, carimbo torto demais, contraste ruim. Os 25 textos novos estão na seção 7 de
   `06-conteudo.md` para ler antes, se preferir.

2. **Conta Expo, para o dev build** (`09-dev-build.md`):
   ```bash
   npx eas-cli@latest login     # conta grátis em expo.dev
   npx eas-cli@latest init      # imprime o projectId
   ```
   O `app.config.ts` é config **dinâmico**, então a CLI não escreve o `projectId` sozinha —
   é preciso colar à mão em `extra.eas.projectId`. Depois:
   `npx eas-cli@latest build --platform android --profile development`.

Sem essas duas, o que dá para fazer sem depender de ninguém: antecipar o **histórico de memes**
(decisão em aberto nº 1 da seção 2) ou escrever mais presets — as duas rodam em Expo Go.

---

## 0. Onde está o código

| | |
|---|---|
| Repositório | `git@github.com:ceosdev/print_vira_meme.git` |
| Branch estável | **`main`** — tudo integrado e pushado (Etapas 1 a 7 + correções do aparelho + segunda leva do catálogo) |
| Último commit | ver `git log --oneline -1` |
| Branch aberta | nenhuma |

O `gh` CLI não está autenticado nesta máquina; o push usa SSH (chave já funciona).

### Como rodar no celular

```bash
cd ~/projects/cartech/print_vira_meme
npm run start          # exige o WSL em modo mirrored — ver armadilha 11
```

⚠️ **Esta máquina (WSL2) não tem toolchain Android**: sem JDK 17, sem Android SDK e sem `adb`
(o único Java no lado Windows é um JDK 1.7). Então `adb reverse` e `npx expo run:android` **não
funcionam aqui** — por isso o dev build vai por EAS Build na nuvem (ver `09-dev-build.md`).

⚠️ **`--tunnel` não é mais alternativa:** o ngrok desligou as sessões anônimas
(`ERR_NGROK_4018`). O Expo mascara isso como
`TypeError: Cannot read properties of undefined (reading 'body')`. Ou se cria conta no ngrok e
se configura um authtoken, ou se usa a LAN (que é o caminho adotado). Ver armadilha 11.

O IP da máquina na LAN é o da **Ethernet, `192.168.0.59`** (o Wi-Fi está desconectado; `192.168.0.58`
é IP dele e não responde). Se o QR sair com o IP errado — no modo mirrored o WSL enxerga também
`10.0.8.10` e `54.232.189.113`, de VPN/proxy — force:
`REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.59 npm run start`.

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
| — | `11-conta-play-e-distribuicao.md` | **conta Play (pessoal vs organização), trilhas de teste, distribuição do APK e cronogramas** |

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

- `/dev-doctor`: **10/10 passos OK**, incluindo exportar meme 1080×1080 em 181 ms. (O link na Home saiu em `e5ecf56`; ver acima como chegar na rota.)
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

⚠️ A conta de desenvolvedor antiga foi encerrada por inatividade (03/2024) — precisa de conta nova.
A rota escolhida muda a ordem desta etapa: na conta **pessoal**, ícone/splash/política/ficha viram
caminho crítico (sem ficha completa o relógio de 12 testadores × 14 dias não começa).
Ver `11-conta-play-e-distribuicao.md`. **Decisão pendente.**
PostHog (`AnalyticsService`) · Sentry (`CrashService`) · EAS Update · ícone e splash definitivos · política de privacidade hospedada · screenshots e ficha da Play · checklist de release. (Ocultar `/dev-doctor` e `/dev-canvas` já foi feito em `e5ecf56`: fora de `__DEV__` as rotas redirecionam para a Home.)

### v1.1 (decidido na Etapa 1, fora do MVP)
Packs de templates · rewarded ads · favoritos · **histórico dos memes** · +50 presets · sazonais via OTA.

### Decisões em aberto (perguntas do Carlos)
1. **Histórico** — hoje não existe tela de "meus memes"; o que é salvo vai para a galeria do Android. Ele perguntou onde vê os salvos: decidir se antecipa o histórico para o MVP.
2. **Foto persistente nos cards** — depois de criar um meme, a foto continua aparecendo em todos os templates (é proposital: mostra como ficaria). Avaliar se limpa ao voltar para a Home.

---

## 3. Armadilhas já encontradas (não repetir)

1. **Os testes mockam tudo que é nativo.** 151 testes verdes não provam que funciona no aparelho — o `@gorhom/bottom-sheet` passava nos testes e não renderizava no celular. Sempre validar fluxo novo no dispositivo.
2. **Sheets:** trocadas por `Modal` do React Native (`src/components/ui/Sheet.tsx`). Não voltar para biblioteca de sheet sem necessidade real.
3. **Gestos dentro de ScrollView:** usar o `ScrollView` do `react-native-gesture-handler` + `blocksExternalGesture(ref)`, senão a rolagem engole o arraste.
4. **Worklets:** todos os callbacks de um gesto precisam ser inline e marcados `'worklet'`. Passar referência de função quebra o conjunto.
5. **Nada de controle por cima da arte:** o preview tem que ser idêntico ao arquivo exportado.
6. **Edições por script:** sempre `assert` que a substituição aconteceu antes de reportar pronto.
7. **React Compiler (SDK 57):** proíbe `setState` dentro de efeito — usar store/estado derivado.
8. **Conteúdo político é risco de produto, não de gosto.** O layout `noticia` gera manchete falsa; manchete falsa + política real = Deturpação na Play Store (derruba o app) e restringe demanda no AdMob. A categoria 🗳️ Politicagem existe justamente para dar essa piada sem o risco: vocabulário político apontado para síndico e churrasco. Ver regra 2 em `06-conteudo.md`.
9. **`src/content/__tests__/catalog.test.ts` tem contagens fixas.** Todo preset, frase, layout ou categoria nova quebra 5 testes de propósito — é a rede que pega arquivo JSON criado e não registrado em `src/content/index.ts`. Atualize os números, não afrouxe a asserção.
10. **Ao mexer no canvas, os componentes estão em `src/components/canvas/elements/`**, não em `src/components/canvas/`. Um `grep` no diretório de cima não acha `CanvasRect`/`CanvasText`/`CanvasImage` e dá a impressão errada de que algo não é aplicado.

11. **Rede: o celular não alcança o Metro sem o WSL em modo mirrored.** Diagnosticado em
    2026-09-07, depois de um dia inteiro achando que era o app. Duas portas fecharam ao mesmo tempo:
    - **LAN:** em modo NAT (padrão), o WSL2 fica em `172.30.240.0/20` e o `expo start` anuncia
      esse IP no QR. O celular está em `192.168.0.x` e não tem rota. Comprovado: nem o próprio
      Windows alcança (`Test-NetConnection 172.30.247.209 -Port 8081` → `False`, firewall do
      Hyper-V). O Expo Go abre `http://172.30.x.x:8081/_expo/loading` e fica em branco para sempre —
      **não é erro de bundle, é o pacote nunca chegando**.
    - **Tunnel:** o ngrok passou a exigir conta (`ERR_NGROK_4018`). Antes rodava anônimo.

    **Correção aplicada:** `C:\Users\carlo\.wslconfig` com `networkingMode=mirrored`,
    `firewall=false`, `dnsTunneling=true` e `[experimental] hostAddressLoopback=true`;
    mais a regra de entrada TCP 8081 no firewall do Windows (as redes desta máquina estão todas
    com perfil **Public**, que bloqueia entrada por padrão):
    ```powershell
    New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -Protocol TCP `
      -LocalPort 8081 -Action Allow -Profile Any
    wsl --shutdown
    ```
    **Reverter,** se o mirrored brigar com a VPN (há um "Topaz Loopback"/`Ethernet 2` nesta
    máquina): apagar o `.wslconfig` e `wsl --shutdown`.

12. **O mock de compras guarda a própria cópia dos entitlements.** `createMockPurchaseService`
    (`src/services/mock/mockPurchaseService.ts`) mantém `entitlements` num closure, **separado** do
    `useEntitlementStore` (persistido em `pvm.entitlements`). Quem virar o entitlement na mão
    mexendo só no store dessincroniza os dois: o mock continua achando que é PRO, e o
    "Restaurar compra" de Configurações ressuscita o PRO sozinho — `restore()` chama `notify()`
    e empurra o valor antigo de volta pelo `useEntitlementSync`. Zerar **os dois lados**; o mock
    expõe `setEntitlements` justamente para isso. Mesma atenção quando o RevenueCat entrar no lugar.
    **Já resolvido na prática:** em desenvolvimento, **Configurações** tem "DEV · Virar PRO /
    Voltar para free" (e o `/dev-doctor` também), que mexe nos dois lados
    (`src/services/devEntitlements.ts`) — é assim que se testa o PRO sem paywall.
    Ver `07-pendencias-deploy.md`.
