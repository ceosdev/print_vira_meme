# Etapa 8a — Dev build Android (EAS Build)

**Por que:** o Expo Go não carrega módulos nativos. Sem dev build não dá para testar
salvar na galeria, receber imagem por "Compartilhar", nem implementar compras e anúncios.

**Rota escolhida:** EAS Build (nuvem). A máquina de desenvolvimento (WSL2) não tem JDK 17,
Android SDK nem `adb` — compilar localmente exigiria ~6–8 GB de setup e `usbipd` para o USB.

---

## O que você precisa fazer (uma vez)

1. **Criar conta grátis** em https://expo.dev (pode entrar com o Google).
2. Autenticar a CLI:
   ```bash
   cd ~/projects/cartech/print_vira_meme
   npx eas-cli@latest login
   ```
3. Vincular o projeto à sua conta:
   ```bash
   npx eas-cli@latest init
   ```
   ⚠️ Como o config é **dinâmico** (`app.config.ts`, não `app.json`), a CLI **não escreve sozinha**
   o `projectId`. Ela vai imprimir algo como
   `extra: { eas: { projectId: "xxxxxxxx-xxxx-..." } }` — **cole o ID aqui no chat** que eu adiciono
   no `app.config.ts`.

## Gerar o build

```bash
npx eas-cli@latest build --platform android --profile development
```

- Na primeira vez a CLI pergunta se pode **gerar a keystore de assinatura** — responda **sim**
  (ela fica guardada na sua conta Expo; a mesma keystore serve para a Play depois).
- O build roda no servidor. Ao terminar sai um **QR code / link**: abra no celular e instale o APK.
- Perfis já configurados em `eas.json`:
  | perfil | saída | para quê |
  |---|---|---|
  | `development` | APK com dev client | desenvolvimento (este) |
  | `preview` | APK standalone | mandar para alguém testar |
  | `production` | AAB | subir na Play Console |

## Rodar depois de instalado

```bash
npx expo start --dev-client
```
Abra o app instalado no celular e aponte para o servidor (QR code ou o IP na tela).

## Quando refazer o build

Só quando mudar código **nativo**: instalar biblioteca com parte nativa, mexer em `app.config.ts`
ou subir de SDK. Mudança de JS/TS vai pelo servidor de desenvolvimento, sem rebuild.

---

## Checklist do primeiro teste no aparelho

Coisas que nunca foram validadas ou que o Expo Go não permitia:

- [ ] **Gestos do editor** — arraste e pinça da foto, e "Mover textos · PRO".
      Corrigido em `e1406a1` e **ainda sem confirmação no aparelho**.
- [ ] **Salvar na galeria** — ⚠️ risco conhecido: `app.config.ts` bloqueia `READ_MEDIA_IMAGES`
      de propósito (política de fotos da Play) e `src/services/mediaService.ts` chama
      `requestPermissionsAsync(true)` (write-only). No Android 13+ o `expo-media-library` declara
      `WRITE_EXTERNAL_STORAGE` com `maxSdkVersion=32`, então no Android 16 essa permissão não existe.
      Se o salvamento falhar, a correção é escrever direto via MediaStore/`expo-file-system`
      em vez de pedir permissão.
- [ ] **Receber imagem** — "Compartilhar → Print Vira Meme" a partir da galeria do Android
      (plugin `expo-sharing` com `singleShareMimeTypes: ['image/*']`).
- [ ] **Diagnóstico** — os links de QA saíram da Home; abra por deep link:
      `adb shell am start -a android.intent.action.VIEW -d "printvirameme://dev-doctor"`
      ou digite o link em qualquer app de mensagem e toque. Esperado: 10/10.
- [ ] **Home limpa** — confirmar que "QA dos layouts" e "🩺 Diagnóstico" não aparecem mais.

Só depois desse checklist faz sentido entrar em RevenueCat e AdMob (Etapa 8b).
