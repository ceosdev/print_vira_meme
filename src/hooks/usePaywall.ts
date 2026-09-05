import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { services } from '@/services';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePaywallStore } from '@/store/paywallStore';
import type { PaywallTrigger } from '@/types/analytics';

export function usePaywall() {
  const router = useRouter();
  const isPro = useEntitlementStore((s) => s.isPro);
  const open = usePaywallStore((s) => s.open);

  const require = useCallback(
    (trigger: PaywallTrigger, continuation: () => void, presetName?: string) => {
      if (isPro) {
        continuation();
        return;
      }
      open(trigger, continuation, presetName);
      services.analytics.track({ name: 'paywall_shown', trigger });
      router.push('/pro');
    },
    [isPro, open, router],
  );

  return { require };
}
