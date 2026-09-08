import { canForceEntitlements, forceEntitlements } from '@/services/devEntitlements';
import { configureServices, services } from '@/services';
import { createMockPurchaseService } from '@/services/mock/mockPurchaseService';
import { useEntitlementStore } from '@/store/entitlementStore';
import type { Entitlements } from '@/types/entitlements';
import type { PurchaseService } from '@/types/services';

const FREE: Entitlements = { isPro: false, packIds: [] };
const PRO: Entitlements = { isPro: true, packIds: [] };

/** Uma compra "de verdade" (RevenueCat): sem a porta de teste do mock. */
const realPurchase: PurchaseService = {
  init: async () => {},
  getProPrice: async () => 'R$ 19,90',
  purchasePro: async () => ({ status: 'purchased' }),
  restore: async () => ({ status: 'restored' }),
  onEntitlementsChange: () => () => {},
};

beforeEach(() => {
  configureServices({ purchase: createMockPurchaseService({ delayMs: 0 }) });
  useEntitlementStore.getState().setEntitlements(FREE);
});

describe('toggle de PRO do dev-doctor', () => {
  it('liga o PRO nos dois lados: o store e a loja concordam', async () => {
    expect(forceEntitlements(PRO)).toBe(true);
    expect(useEntitlementStore.getState().isPro).toBe(true);
    expect(await services.purchase.restore()).toEqual({ status: 'restored' });
  });

  it('desligar o PRO não deixa o "Restaurar compra" ressuscitá-lo (armadilha 12)', async () => {
    forceEntitlements(PRO);
    forceEntitlements(FREE);
    expect(useEntitlementStore.getState().isPro).toBe(false);
    expect(await services.purchase.restore()).toEqual({ status: 'none' });
  });

  it('não faz nada quando a compra deixa de ser o mock — o botão some', () => {
    configureServices({ purchase: realPurchase });
    expect(canForceEntitlements()).toBe(false);
    expect(forceEntitlements(PRO)).toBe(false);
    expect(useEntitlementStore.getState().isPro).toBe(false);
  });

  it('está disponível enquanto a compra for o mock', () => {
    expect(canForceEntitlements()).toBe(true);
  });
});
