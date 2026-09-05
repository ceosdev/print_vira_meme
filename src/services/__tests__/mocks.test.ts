import { configureServices, services } from '@/services';
import { createMockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockPurchaseService } from '@/services/mock/mockPurchaseService';

describe('mockPurchaseService', () => {
  it('compra vira PRO e avisa os ouvintes; restore devolve restored', async () => {
    const svc = createMockPurchaseService({ delayMs: 0 });
    const seen: boolean[] = [];
    const unsub = svc.onEntitlementsChange((e) => seen.push(e.isPro));
    await svc.init();
    expect(await svc.getProPrice()).toBe('R$ 19,90');
    expect(await svc.restore()).toEqual({ status: 'none' });
    expect(await svc.purchasePro()).toEqual({ status: 'purchased' });
    expect(seen).toEqual([true]);
    expect(await svc.restore()).toEqual({ status: 'restored' });
    unsub();
  });
  it('pode simular cancelamento', async () => {
    const svc = createMockPurchaseService({ delayMs: 0, nextOutcome: { status: 'cancelled' } });
    expect(await svc.purchasePro()).toEqual({ status: 'cancelled' });
  });
});

describe('mockAnalyticsService', () => {
  it('guarda eventos tipados e respeita setEnabled', () => {
    const svc = createMockAnalyticsService();
    svc.track({ name: 'app_open', entry: 'launcher' });
    svc.setEnabled(false);
    svc.track({ name: 'remake_same_photo' });
    expect(svc.events.map((e) => e.name)).toEqual(['app_open']);
  });
});

describe('registro de serviços', () => {
  it('expõe as 8 áreas e permite trocar uma', () => {
    expect(Object.keys(services).sort()).toEqual(['ads', 'analytics', 'crash', 'export', 'image', 'media', 'purchase', 'share']);
    const analytics = createMockAnalyticsService();
    configureServices({ analytics });
    services.analytics.track({ name: 'remake_same_photo' });
    expect(analytics.events).toHaveLength(1);
  });
});
