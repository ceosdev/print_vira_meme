# Pendências de deploy — trocar antes de publicar

Coisas que hoje são **placeholder** no código e precisam de valor real no lançamento.
Cada item aponta para o arquivo onde mora a constante.

| # | O quê | Onde | Situação hoje |
|---|---|---|---|
| 1 | **Link do app** usado no convite ("Chamar alguém para fazer o seu") e em Configurações → Compartilhar o app | `src/config/app.ts` → `APP_SHARE_URL` / `PLAY_URL` | aponta para `play.google.com/store/apps/details?id=com.cartech.printvirameme`, que só resolve depois de publicar. Marcar `APP_PUBLISHED = true` quando resolver |
| 2 | **Política de privacidade** (exigida pela Play) | `src/config/app.ts` → `PRIVACY_URL` | `printvirameme.com.br/privacidade` — domínio ainda não existe |
| 3 | **SKU da compra PRO** | `src/config/app.ts` → `PRO_SKU` | `pvm_pro_lifetime` — precisa ser criado igual na Play Console |
| 4 | **RevenueCat / AdMob** (chaves e IDs de unidade) | Etapa 8 (Plano 2) | serviços ainda são mocks. Ao trocar o mock de compra, `src/services/devEntitlements.ts` **para de compilar de propósito** — ver abaixo |
| 5 | **PostHog / Sentry** (chaves) | Etapa 9 (Plano 3) | idem |
| 6 | **Ícone e splash definitivos** | `assets/` | ainda são os do template do Expo |
| 7 | ~~Telas de diagnóstico~~ (`/dev-doctor`, `/dev-canvas`) | `src/app/` | ✅ **resolvido** — sem link na Home; fora de `__DEV__` a rota redireciona para a Home. Em desenvolvimento continuam acessíveis por deep link (`printvirameme://dev-doctor` no dev build; `exp://<ip>:8081/--/dev-doctor` no Expo Go) |

## Toggle de PRO do `/dev-doctor` (item 4)

Para testar o PRO sem passar pelo paywall existe "Virar PRO / Voltar para free"
(`src/services/devEntitlements.ts`), em **dois lugares**: em Configurações, como
"DEV · Virar PRO" logo acima de "Restaurar compra" (é onde a pessoa procura), e no `/dev-doctor`.
Ele é seguro para a loja por três motivos empilhados:

1. o `/dev-doctor` inteiro redireciona para a Home fora de `__DEV__` (item 7); e em Configurações
   — que é tela de usuário — a linha só existe sob `canForceEntitlements()`, com teste dedicado
   (`src/app/__tests__/settings.test.tsx`) que renderiza a tela com `__DEV__ = false` e exige que
   o atalho suma;
2. `canForceEntitlements()` exige `__DEV__` **e** que a compra ainda seja o mock;
3. `setEntitlements` só existe no mock, e `src/services/index.ts` usa `satisfies Services` para
   manter o tipo concreto: no dia em que o RevenueCat ocupar `services.purchase`, o
   `npm run typecheck` quebra apontando para `devEntitlements.ts`. **Não afrouxe com `as`** —
   o certo é apagar o toggle, que a essa altura já não serve para nada.

O toggle vira o entitlement nos **dois** lados (a cópia do mock e o `useEntitlementStore`), que é
a armadilha 12 de `08-estado-e-proximos-passos.md`. Coberto por
`src/services/__tests__/devEntitlements.test.ts`.

## Mecanismo de convite

Como não dá para mandar imagem e texto juntos, o convite é uma **ação própria** (`src/hooks/useInvite.ts`):
abre direto a conversa do WhatsApp com o texto pronto (`whatsapp://send?text=…`) e, se o WhatsApp
não estiver instalado, cai na share sheet do sistema. Aparece em dois lugares: no Resultado
("Convidar pelo WhatsApp", logo abaixo de compartilhar/salvar) e em Configurações
("Convidar amigos para o app"). O texto e o link saem de `shareInvite()` / `APP_SHARE_URL`.

## Sobre compartilhar meme + link junto

No Android não dá para enviar **imagem e texto na mesma ação** com as APIs do Expo:
`Sharing.shareAsync` manda só o arquivo, e o `Share` do React Native manda só texto
(WhatsApp e Instagram ignoram o texto quando há imagem). Por isso o produto usa duas ações:

- **Compartilhar** → manda o meme como imagem (é o que viraliza);
- **Chamar alguém para fazer o seu** → manda o convite com o link.

O canal de descoberta dentro do próprio meme continua sendo a marca d'água (`printvirameme`),
que no lançamento pode virar o domínio curto, se você registrar um.
