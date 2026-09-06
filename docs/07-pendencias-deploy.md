# Pendências de deploy — trocar antes de publicar

Coisas que hoje são **placeholder** no código e precisam de valor real no lançamento.
Cada item aponta para o arquivo onde mora a constante.

| # | O quê | Onde | Situação hoje |
|---|---|---|---|
| 1 | **Link do app** usado no convite ("Chamar alguém para fazer o seu") e em Configurações → Compartilhar o app | `src/config/app.ts` → `APP_SHARE_URL` / `PLAY_URL` | aponta para `play.google.com/store/apps/details?id=com.cartech.printvirameme`, que só resolve depois de publicar. Marcar `APP_PUBLISHED = true` quando resolver |
| 2 | **Política de privacidade** (exigida pela Play) | `src/config/app.ts` → `PRIVACY_URL` | `printvirameme.com.br/privacidade` — domínio ainda não existe |
| 3 | **SKU da compra PRO** | `src/config/app.ts` → `PRO_SKU` | `pvm_pro_lifetime` — precisa ser criado igual na Play Console |
| 4 | **RevenueCat / AdMob** (chaves e IDs de unidade) | Etapa 8 (Plano 2) | serviços ainda são mocks |
| 5 | **PostHog / Sentry** (chaves) | Etapa 9 (Plano 3) | idem |
| 6 | **Ícone e splash definitivos** | `assets/` | ainda são os do template do Expo |
| 7 | **Telas de diagnóstico** (`/dev-doctor`, `/dev-canvas`) | `src/app/` | só aparecem em `__DEV__`; conferir que não vão para produção |

## Sobre compartilhar meme + link junto

No Android não dá para enviar **imagem e texto na mesma ação** com as APIs do Expo:
`Sharing.shareAsync` manda só o arquivo, e o `Share` do React Native manda só texto
(WhatsApp e Instagram ignoram o texto quando há imagem). Por isso o produto usa duas ações:

- **Compartilhar** → manda o meme como imagem (é o que viraliza);
- **Chamar alguém para fazer o seu** → manda o convite com o link.

O canal de descoberta dentro do próprio meme continua sendo a marca d'água (`printvirameme`),
que no lançamento pode virar o domínio curto, se você registrar um.
