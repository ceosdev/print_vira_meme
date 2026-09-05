import type { AdsService } from '@/types/services';

/** Sem anúncio real: nunca fica "pronto" por padrão, então o AdGate segue sem esperar. */
export function createMockAdsService(opts: { alwaysReady?: boolean } = {}): AdsService {
  let ready = Boolean(opts.alwaysReady);
  return {
    init: () => {},
    isInterstitialReady: () => ready,
    preloadInterstitial: () => {
      ready = Boolean(opts.alwaysReady);
    },
    showInterstitial: async () => {
      if (!ready) return 'not_ready';
      ready = false;
      return 'shown';
    },
  };
}
