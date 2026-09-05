import { AD_RULES, shouldPromptProAfterAd, shouldShowInterstitial, shouldShowShareMilestone } from '@/utils/adRules';

const base = { isPro: false, exports: 5, exportsSinceAd: 5, lastAdAt: null, now: 1_000_000, adReady: true };

describe('shouldShowInterstitial', () => {
  it('nunca para PRO nem sem anúncio pronto', () => {
    expect(shouldShowInterstitial({ ...base, isPro: true })).toBe(false);
    expect(shouldShowInterstitial({ ...base, adReady: false })).toBe(false);
  });
  it('primeiro anúncio só a partir da 2ª exportação', () => {
    expect(shouldShowInterstitial({ ...base, exports: 1, exportsSinceAd: 1 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, exports: 2, exportsSinceAd: 2 })).toBe(true);
  });
  it('depois do primeiro, a cada 3 exportações', () => {
    expect(shouldShowInterstitial({ ...base, lastAdAt: 0, exportsSinceAd: 2 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, lastAdAt: 0, exportsSinceAd: 3 })).toBe(true);
  });
  it('respeita o intervalo mínimo de 3 minutos', () => {
    const lastAdAt = base.now - AD_RULES.minIntervalMs + 1;
    expect(shouldShowInterstitial({ ...base, lastAdAt, exportsSinceAd: 9 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, lastAdAt: base.now - AD_RULES.minIntervalMs, exportsSinceAd: 9 })).toBe(true);
  });
});

describe('shouldPromptProAfterAd', () => {
  it('a cada 5 anúncios fechados', () => {
    expect([0, 1, 4, 5, 6, 10].map(shouldPromptProAfterAd)).toEqual([false, false, false, true, false, true]);
  });
});

describe('shouldShowShareMilestone', () => {
  it('no 3º compartilhamento, uma vez, só Free', () => {
    expect(shouldShowShareMilestone({ isPro: false, shares: 2, alreadyShown: false })).toBe(false);
    expect(shouldShowShareMilestone({ isPro: false, shares: 3, alreadyShown: false })).toBe(true);
    expect(shouldShowShareMilestone({ isPro: false, shares: 7, alreadyShown: true })).toBe(false);
    expect(shouldShowShareMilestone({ isPro: true, shares: 3, alreadyShown: false })).toBe(false);
  });
});
