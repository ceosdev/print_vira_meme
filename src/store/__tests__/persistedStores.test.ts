import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCountersStore } from '@/store/countersStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import { waitForHydration } from '@/store/hydration';
import { usePrefsStore } from '@/store/prefsStore';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('stores persistidos', () => {
  beforeAll(() => waitForHydration());

  it('counters: export e ad', async () => {
    const c = useCountersStore.getState();
    c.recordExport();
    c.recordExport();
    expect(useCountersStore.getState()).toMatchObject({ exports: 2, exportsSinceAd: 2, lastAdAt: null });
    useCountersStore.getState().recordAdShown(1000);
    expect(useCountersStore.getState()).toMatchObject({ exportsSinceAd: 0, lastAdAt: 1000 });
    useCountersStore.getState().recordAdClosed();
    useCountersStore.getState().recordShare();
    useCountersStore.getState().recordSave();
    useCountersStore.getState().markShareMilestoneShown();
    expect(useCountersStore.getState()).toMatchObject({ adCloseCount: 1, shares: 1, saves: 1, shareMilestoneShown: true });
    await flush();
    const raw = await AsyncStorage.getItem('pvm.counters');
    expect(raw).toContain('"exports":2');
  });

  it('entitlements: setEntitlements grava e marca updatedAt', async () => {
    useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: ['futebol'] });
    const s = useEntitlementStore.getState();
    expect(s.isPro).toBe(true);
    expect(s.packIds).toEqual(['futebol']);
    expect(typeof s.updatedAt).toBe('number');
    await flush();
    expect(await AsyncStorage.getItem('pvm.entitlements')).toContain('"isPro":true');
  });

  it('prefs: analytics ligado por padrão, categoria lembrada', async () => {
    expect(usePrefsStore.getState().analyticsEnabled).toBe(true);
    usePrefsStore.getState().setAnalyticsEnabled(false);
    usePrefsStore.getState().setLastCategory('futebol');
    expect(usePrefsStore.getState()).toMatchObject({ analyticsEnabled: false, lastCategory: 'futebol' });
  });

  it('waitForHydration resolve', async () => {
    await expect(waitForHydration()).resolves.toBeUndefined();
  });
});
