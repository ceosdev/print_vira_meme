/** Regras de anúncio (UX §4.1). Funções puras: recebem contadores, devolvem decisão. */
export const AD_RULES = {
  firstAdAfterExports: 2,
  exportsBetweenAds: 3,
  minIntervalMs: 3 * 60 * 1000,
  proPromptEveryAds: 5,
  shareMilestone: 3,
} as const;

export interface AdDecisionInput {
  isPro: boolean;
  exports: number;
  exportsSinceAd: number;
  lastAdAt: number | null;
  now: number;
  adReady: boolean;
}

export function shouldShowInterstitial(i: AdDecisionInput): boolean {
  if (i.isPro || !i.adReady) return false;
  if (i.exports < AD_RULES.firstAdAfterExports) return false;
  if (i.lastAdAt === null) return true; // primeiro anúncio da vida: só a regra acima
  if (i.exportsSinceAd < AD_RULES.exportsBetweenAds) return false;
  if (i.now - i.lastAdAt < AD_RULES.minIntervalMs) return false;
  return true;
}

export function shouldPromptProAfterAd(adCloseCount: number): boolean {
  return adCloseCount > 0 && adCloseCount % AD_RULES.proPromptEveryAds === 0;
}

export function shouldShowShareMilestone(i: { isPro: boolean; shares: number; alreadyShown: boolean }): boolean {
  return !i.isPro && !i.alreadyShown && i.shares >= AD_RULES.shareMilestone;
}
