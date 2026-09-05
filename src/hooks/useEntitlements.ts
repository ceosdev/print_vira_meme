import { useCallback } from 'react';
import { useEntitlementStore } from '@/store/entitlementStore';
import type { Preset } from '@/types/catalog';
import { isPresetUnlocked } from '@/utils/paywallRules';

export function useEntitlements() {
  const isPro = useEntitlementStore((s) => s.isPro);
  const packIds = useEntitlementStore((s) => s.packIds);
  const isUnlocked = useCallback(
    (preset: Pick<Preset, 'premium' | 'packId'>) => isPresetUnlocked(preset, { isPro, packIds }),
    [isPro, packIds],
  );
  return { isPro, packIds, entitlements: { isPro, packIds }, isUnlocked };
}
