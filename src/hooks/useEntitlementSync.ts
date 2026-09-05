import { useEffect } from 'react';
import { services } from '@/services';
import { useEntitlementStore } from '@/store/entitlementStore';

/** Mantém o store de entitlements alinhado com a loja (init + mudanças). */
export function useEntitlementSync() {
  useEffect(() => {
    let alive = true;
    void services.purchase.init().catch(() => {});
    const unsubscribe = services.purchase.onEntitlementsChange((entitlements) => {
      if (alive) useEntitlementStore.getState().setEntitlements(entitlements);
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);
}
