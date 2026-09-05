import { act, renderHook } from '@testing-library/react-native';
import { useAdGate } from '@/hooks/useAdGate';
import { useExport } from '@/hooks/useExport';
import { usePaywall } from '@/hooks/usePaywall';
import { configureServices, services } from '@/services';
import { createMockAdsService } from '@/services/mock/mockAdsService';
import { createMockAnalyticsService, type MockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockExportService } from '@/services/mock/mockExportService';
import { useCountersStore } from '@/store/countersStore';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePaywallStore } from '@/store/paywallStore';
import { useProLiteStore } from '@/store/proLiteStore';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }) }));

const image = { uri: 'file:///a.jpg', thumbUri: 'file:///t.jpg', width: 1600, height: 1200, source: 'gallery' as const };
const analyticsEvents = () => (services.analytics as unknown as MockAnalyticsService).events.map((e) => e.name);

beforeEach(() => {
  mockPush.mockClear();
  useCreationStore.getState().reset();
  useEntitlementStore.getState().setEntitlements({ isPro: false, packIds: [] });
  useCountersStore.setState({ exports: 0, shares: 0, saves: 0, exportsSinceAd: 0, lastAdAt: null, adCloseCount: 0, shareMilestoneShown: false });
  usePaywallStore.getState().clear();
  useProLiteStore.getState().hide();
  configureServices({ analytics: createMockAnalyticsService(), export: createMockExportService(), ads: createMockAdsService() });
});

describe('usePaywall', () => {
  it('Free: abre /pro, guarda a continuação e registra paywall_shown', async () => {
    const { result } = await renderHook(() => usePaywall());
    const cont = jest.fn();
    await act(async () => result.current.require('premium_template', cont, 'Pódio'));
    expect(cont).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/pro');
    expect(usePaywallStore.getState()).toMatchObject({ trigger: 'premium_template', presetName: 'Pódio' });
    usePaywallStore.getState().takeContinuation()?.();
    expect(cont).toHaveBeenCalledTimes(1);
    expect(analyticsEvents()).toContain('paywall_shown');
  });
  it('PRO: executa na hora sem abrir o paywall', async () => {
    useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
    const { result } = await renderHook(() => usePaywall());
    const cont = jest.fn();
    await act(async () => result.current.require('remove_watermark', cont));
    expect(cont).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('useAdGate', () => {
  it('sem anúncio pronto executa direto', async () => {
    useCountersStore.setState({ exports: 5, exportsSinceAd: 5 });
    const { result } = await renderHook(() => useAdGate());
    const action = jest.fn();
    await act(() => result.current.runGuarded(action));
    expect(action).toHaveBeenCalledTimes(1);
    expect(useCountersStore.getState().lastAdAt).toBeNull();
  });
  it('com anúncio pronto e regra satisfeita mostra, registra e depois executa', async () => {
    configureServices({ ads: createMockAdsService({ alwaysReady: true }) });
    useCountersStore.setState({ exports: 5, exportsSinceAd: 5 });
    const { result } = await renderHook(() => useAdGate());
    const action = jest.fn();
    await act(() => result.current.runGuarded(action));
    expect(action).toHaveBeenCalledTimes(1);
    const c = useCountersStore.getState();
    expect(c.lastAdAt).not.toBeNull();
    expect(c.exportsSinceAd).toBe(0);
    expect(c.adCloseCount).toBe(1);
    expect(analyticsEvents()).toContain('ad_shown');
  });
  it('a cada 5 anúncios abre a sheet PRO leve', async () => {
    configureServices({ ads: createMockAdsService({ alwaysReady: true }) });
    useCountersStore.setState({ exports: 5, exportsSinceAd: 5, adCloseCount: 4 });
    const { result } = await renderHook(() => useAdGate());
    await act(() => result.current.runGuarded(() => {}));
    expect(useProLiteStore.getState().trigger).toBe('ad_close');
  });
});

describe('useExport', () => {
  it('exporta com brand para Free em standard, grava lastExport e contadores', async () => {
    const st = useCreationStore.getState();
    st.setImage(image);
    st.setPreset('humor-dormir-cedo');
    const { result } = await renderHook(() => useExport());
    let out: unknown;
    await act(async () => {
      out = await result.current.run();
    });
    expect(out).toMatchObject({ hasBrand: true, quality: 'standard', width: 1080 });
    expect(useCreationStore.getState().lastExport).toBeTruthy();
    expect(useCountersStore.getState().exports).toBe(1);
    expect(analyticsEvents()).toContain('meme_exported');
  });
  it('PRO exporta HD sem brand', async () => {
    useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
    const st = useCreationStore.getState();
    st.setImage(image);
    st.setPreset('humor-dormir-cedo');
    const { result } = await renderHook(() => useExport());
    let out: unknown;
    await act(async () => {
      out = await result.current.run();
    });
    expect(out).toMatchObject({ hasBrand: false, quality: 'hd', width: 2160 });
  });
  it('sem foto/preset devolve null sem exportar', async () => {
    const { result } = await renderHook(() => useExport());
    let out: unknown = 'x';
    await act(async () => {
      out = await result.current.run();
    });
    expect(out).toBeNull();
    expect(useCountersStore.getState().exports).toBe(0);
  });
  it('falha vira error legível e export_failed', async () => {
    configureServices({
      export: {
        exportMeme: async () => {
          throw new Error('boom');
        },
      },
    });
    const st = useCreationStore.getState();
    st.setImage(image);
    st.setPreset('humor-dormir-cedo');
    const { result } = await renderHook(() => useExport());
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.error).toBe('Deu ruim ao gerar. Tentar de novo?');
    expect(analyticsEvents()).toContain('export_failed');
  });
});
