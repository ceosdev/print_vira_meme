/** Identificadores e links do produto. O SKU precisa bater com o produto criado na Play Console. */
export const PRO_SKU = 'pvm_pro_lifetime';
export const PACKAGE_NAME = 'com.cartech.printvirameme';
export const PLAY_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`;
export const PRIVACY_URL = 'https://printvirameme.com.br/privacidade';
/**
 * TROCAR NO DEPLOY. Enquanto o app não está publicado, o link da Play ainda não resolve.
 * Ao publicar, confirme (ou troque por um link curto próprio) e marque APP_PUBLISHED = true.
 * Ver docs/07-pendencias-deploy.md.
 */
export const APP_SHARE_URL = PLAY_URL;
export const APP_PUBLISHED = false;

/** Convite que acompanha o compartilhamento do app (o meme em si vai como imagem pura). */
export const shareInvite = (url: string = APP_SHARE_URL) =>
  `Fiz esse meme no Print Vira Meme 😂\nCrie o seu: ${url}`;

/** Idade máxima dos arquivos de cache (imagens e exportações). */
export const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
