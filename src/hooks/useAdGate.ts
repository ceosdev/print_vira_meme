import { useCallback } from 'react';
import { services } from '@/services';
import { useCountersStore } from '@/store/countersStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import { useProLiteStore } from '@/store/proLiteStore';
import { shouldPromptProAfterAd, shouldShowInterstitial } from '@/utils/adRules';

/** Único ponto de decisão de interstitial (UX §4.1). Nunca espera anúncio que não está pronto. */
export function useAdGate() {
  const runGuarded = useCallback(async (action: () => void) => {
    const counters = useCountersStore.getState();
    const isPro = useEntitlementStore.getState().isPro;
    const show = shouldShowInterstitial({
      isPro,
      exports: counters.exports,
      exportsSinceAd: counters.exportsSinceAd,
      lastAdAt: counters.lastAdAt,
      now: Date.now(),
      adReady: services.ads.isInterstitialReady(),
    });
    if (show) {
      const outcome = await services.ads.showInterstitial();
      if (outcome === 'shown') {
        counters.recordAdShown();
        counters.recordAdClosed();
        services.analytics.track({ name: 'ad_shown', type: 'interstitial' });
        services.ads.preloadInterstitial();
        if (shouldPromptProAfterAd(useCountersStore.getState().adCloseCount)) useProLiteStore.getState().show('ad_close');
      }
    }
    action();
  }, []);

  return { runGuarded };
}
