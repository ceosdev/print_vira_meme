import { services } from '@/services';
import { useEntitlementStore } from '@/store/entitlementStore';
import type { Entitlements } from '@/types/entitlements';

/**
 * Porta de teste do PRO (só `__DEV__`, só enquanto a compra for o mock): vira o entitlement
 * **nos dois lados** — a cópia que o mock guarda no closure e o `useEntitlementStore` persistido.
 * Mexer só no store dessincroniza os dois e o "Restaurar compra" ressuscita o PRO sozinho
 * (armadilha 12 do handoff).
 *
 * ⚠️ Trava proposital: `setEntitlements` só existe no mock. Quando o RevenueCat ocupar o lugar
 * dele em `services.purchase`, este arquivo **para de compilar** — é o lembrete de revisar o
 * toggle junto com o item 4 de `docs/07-pendencias-deploy.md`.
 */
const mockPurchase = () => (typeof services.purchase.setEntitlements === 'function' ? services.purchase : null);

/** O toggle só aparece quando dá para mexer nos dois lados. */
export function canForceEntitlements(): boolean {
  return __DEV__ && mockPurchase() !== null;
}

/** Devolve `false` quando não há como forçar — aí nada é alterado. */
export function forceEntitlements(entitlements: Entitlements): boolean {
  const purchase = mockPurchase();
  if (!__DEV__ || !purchase) return false;
  purchase.setEntitlements(entitlements);
  useEntitlementStore.getState().setEntitlements(entitlements);
  return true;
}
