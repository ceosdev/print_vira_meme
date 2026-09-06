# Anúncios — como funciona na prática (AdMob)

Documento de **negócio/operação**, não de produto. As regras de *quando* o app mostra anúncio já
estão em [`02-ux.md` §4.1](02-ux.md) e no código (`src/utils/adRules.ts`). Aqui está o resto:
de onde vem o anúncio, o que precisa ser feito fora do repositório, e quanto isso realistamente rende.

---

## 1. Você não procura anunciante

Ninguém liga para uma marca pedindo patrocínio. Você aluga o espaço para uma **rede de anúncios** —
para app pequeno, na prática, o **Google AdMob**. A rede já tem milhões de anunciantes cadastrados;
a cada espaço que o app abre ela roda um leilão em tempo real e entrega quem pagou mais.
Você fica com uma fatia da receita (AdMob repassa ~68% do que o anunciante paga, em display).

**Venda direta** (você procurando quem paga) só faz sentido com audiência grande ou nicho muito
específico — e aí você passa a gerenciar contrato, criativo e faturamento na mão. Não é o nosso caso.

---

## 2. O que precisa ser feito fora do repositório

| # | Passo | Detalhe |
|---|---|---|
| 1 | **Criar conta AdMob** | admob.google.com, com a mesma conta Google do Play Console. Tem um AdSense por trás, que é quem paga |
| 2 | **Dados fiscais e bancários** | CPF ou CNPJ + conta bancária. Sem isso o dinheiro acumula e não sai |
| 3 | **Registrar o app no AdMob** | Gera o **App ID** (`ca-app-pub-XXXXXXXX~YYYYYYYY`). Dá para registrar antes de publicar na Play e vincular depois |
| 4 | **Criar os blocos (ad units)** | Um por formato/posição. Hoje o app precisa de **um só**: interstitial pós-exportação. Gera `ca-app-pub-XXXXXXXX/ZZZZZZZZ` |
| 5 | **Declarar na Play Console** | "Contém anúncios" na ficha + seção de Data Safety (o SDK coleta ID de publicidade) + URL de política de privacidade pública ([`07-pendencias-deploy.md`](07-pendencias-deploy.md) item 2) |
| 6 | **Consentimento (UMP)** | SDK de consentimento do Google, obrigatório para GDPR e correto para a LGPD. Sem consentimento o anúncio vira não-personalizado — continua rendendo, só menos |
| 7 | **`app-ads.txt`** | Arquivo público no domínio que você declarar na ficha da Play. É o que prova ao mercado que o AdMob pode vender o seu inventário; sem ele parte dos compradores não dá lance. Depende do domínio do item 2 existir |

**Pagamento:** só sai quando acumula o limite mínimo (equivalente a ~US$ 100 na moeda local),
por volta do dia 21 do mês seguinte.

---

## 3. Quanto rende — a conta honesta

Ordem de grandeza no Brasil, com variação enorme por época do ano e perfil de público:

| Formato | eCPM aproximado (R$ / mil impressões) |
|---|---|
| Banner | 1 – 4 |
| Interstitial | 8 – 25 |
| Premiado (rewarded) | 15 – 50 |

Conta com números **otimistas**: 1.000 usuários ativos/dia × 2 interstitials = 2.000 impressões/dia.
A R$ 10 de eCPM, isso dá **R$ 20/dia**. Sem alguns milhares de usuários ativos por dia, a receita de
anúncio é troco — e cobra caro em UX, complexidade (dev build, consentimento) e risco de política.

**Conclusão operacional:** publicar primeiro, medir retenção, e só então ligar o anúncio real.
O PRO (compra única, [`01-product-spec.md` §9.2](01-product-spec.md)) é a fonte de receita principal;
o anúncio é o que empurra para o PRO, não o contrário.

---

## 4. Formatos e onde encaixam neste app

- **Interstitial depois de salvar/compartilhar** — o único momento natural, e é exatamente o que o
  AdGate já faz. Nunca no meio da edição.
- **Premiado (rewarded)** para destravar um pack ou tirar a marca d'água — é o que mais paga e o
  usuário escolhe ver. Candidato para v1.1, junto com os packs ([`01-product-spec.md` §9.3](01-product-spec.md)).
- **Banner na Home** — o que menos paga e mais atrapalha. Fora.
- **App open** (anúncio na abertura) — rende, mas irrita e briga com o fluxo "abriu para fazer um meme rápido". Fora por ora.

**Risco de política que dá suspensão de conta:** banner colado em botão de ação → clique acidental →
"tráfego inválido". Outro: usar o ID de anúncio **real** durante o desenvolvimento. Em dev, sempre os
IDs de teste da Google.

---

## 5. O que já está pronto no código

| Peça | Onde | Estado |
|---|---|---|
| Regras de frequência (funções puras + testes) | `src/utils/adRules.ts`, `src/utils/__tests__/adRules.test.ts` | ✅ pronto |
| Ponto único de decisão | `src/hooks/useAdGate.ts` | ✅ pronto |
| Interface do serviço | `src/types/services.ts` → `AdsService` (`init` / `isInterstitialReady` / `preloadInterstitial` / `showInterstitial`) | ✅ pronto |
| Implementação | `src/services/mock/mockAdsService.ts` — nunca fica "pronto", então o AdGate segue sem anúncio | 🔸 mock |
| Upsell PRO a cada 5 anúncios | `src/hooks/useAdGate.ts` + `src/components/ProLiteSheet.tsx` | ✅ pronto |

Trocar mock por real é **uma linha** em `src/services/index.ts` (`ads: createAdMobService()`), porque
todas as telas falam com a interface, não com a implementação.

## 6. O que falta para ligar de verdade

1. Conta AdMob + App ID + ad unit (seção 2).
2. `react-native-google-mobile-ads` como dependência e config plugin em [`app.config.ts`](../app.config.ts),
   com o App ID de Android. **Antes de escrever código, conferir a doc versionada do Expo SDK 57**
   (https://docs.expo.dev/versions/v57.0.0/), conforme [`AGENTS.md`](../AGENTS.md).
3. **Dev build obrigatório** — a lib é módulo nativo e o Expo Go não carrega
   ([`09-dev-build.md`](09-dev-build.md)).
4. `createAdMobService()` implementando `AdsService`, com IDs de teste sob `__DEV__`.
5. SDK de consentimento (UMP) chamado no boot, antes do primeiro `preloadInterstitial()`.
6. Declarações na Play Console + política de privacidade publicada.

Enquanto 1–6 não acontecem, o app roda sem anúncio nenhum, sem quebrar nada — que é o comportamento
desenhado do mock.
