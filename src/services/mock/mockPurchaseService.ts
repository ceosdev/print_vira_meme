import type { Entitlements } from '@/types/entitlements';
import type { PurchaseOutcome, PurchaseService } from '@/types/services';

export interface MockPurchaseOptions {
  delayMs?: number;
  /** Resultado forçado da próxima compra (padrão: compra concluída). */
  nextOutcome?: PurchaseOutcome;
  initialEntitlements?: Entitlements;
}

export interface MockPurchaseService extends PurchaseService {
  /** Ajuda de teste: força o estado. */
  setEntitlements(e: Entitlements): void;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createMockPurchaseService(opts: MockPurchaseOptions = {}): MockPurchaseService {
  let entitlements: Entitlements = opts.initialEntitlements ?? { isPro: false, packIds: [] };
  const listeners = new Set<(e: Entitlements) => void>();
  const notify = () => listeners.forEach((cb) => cb({ ...entitlements, packIds: [...entitlements.packIds] }));
  const delay = opts.delayMs ?? 300;

  return {
    init: async () => {},
    getProPrice: async () => 'R$ 19,90',
    purchasePro: async () => {
      await sleep(delay);
      if (opts.nextOutcome) return opts.nextOutcome;
      entitlements = { ...entitlements, isPro: true };
      notify();
      return { status: 'purchased' };
    },
    restore: async () => {
      await sleep(delay);
      if (!entitlements.isPro && entitlements.packIds.length === 0) return { status: 'none' };
      notify();
      return { status: 'restored' };
    },
    onEntitlementsChange: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    setEntitlements: (e) => {
      entitlements = { ...e };
      notify();
    },
  };
}
