import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import SettingsScreen from '@/app/settings';
import { configureServices, services } from '@/services';
import { createMockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockImageService } from '@/services/mock/mockImageService';
import { createMockPurchaseService } from '@/services/mock/mockPurchaseService';
import { createMockShareService } from '@/services/mock/mockShareService';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePrefsStore } from '@/store/prefsStore';
import { useToastStore } from '@/store/toastStore';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }) }));

beforeEach(() => {
  mockPush.mockClear();
  useEntitlementStore.getState().setEntitlements({ isPro: false, packIds: [] });
  usePrefsStore.getState().setAnalyticsEnabled(true);
  useToastStore.getState().hide();
  configureServices({
    analytics: createMockAnalyticsService(),
    purchase: createMockPurchaseService({ delayMs: 0 }),
    share: createMockShareService(),
    image: createMockImageService(),
  });
});

describe('Configurações', () => {
  it('Free mostra "Conheça o PRO" e abre o paywall', async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('pro-status'));
    expect(mockPush).toHaveBeenCalledWith('/pro');
  });

  it('em desenvolvimento, o atalho de PRO vira o entitlement nos dois lados', async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('dev-toggle-pro'));
    expect(useEntitlementStore.getState().isPro).toBe(true);
    expect(await services.purchase.restore()).toEqual({ status: 'restored' });
    await fireEvent.press(screen.getByTestId('dev-toggle-pro'));
    expect(useEntitlementStore.getState().isPro).toBe(false);
    expect(await services.purchase.restore()).toEqual({ status: 'none' });
  });

  it('fora de __DEV__ o atalho de PRO não existe — Configurações é tela de usuário', async () => {
    const dev = (globalThis as { __DEV__?: boolean }).__DEV__;
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    try {
      await render(<SettingsScreen />);
      expect(screen.queryByTestId('dev-toggle-pro')).toBeNull();
      expect(screen.getByTestId('restore')).toBeTruthy();
    } finally {
      (globalThis as { __DEV__?: boolean }).__DEV__ = dev;
    }
  });

  it('PRO mostra o status e não navega', async () => {
    useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
    await render(<SettingsScreen />);
    expect(screen.getByText('✓ Você é PRO')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pro-status'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opt-out desliga o analytics', async () => {
    const analytics = createMockAnalyticsService();
    configureServices({ analytics });
    await render(<SettingsScreen />);
    await fireEvent(screen.getByTestId('analytics-switch'), 'valueChange', false);
    expect(usePrefsStore.getState().analyticsEnabled).toBe(false);
    analytics.track({ name: 'remake_same_photo' });
    expect(analytics.events).toHaveLength(0);
  });

  it('limpar cache avisa; convidar abre o WhatsApp', async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId('clear-cache'));
    expect(useToastStore.getState().message).toBe('Cache limpo ✓');
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await fireEvent.press(screen.getByTestId('share-app'));
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('whatsapp://send?text='));
    openURL.mockRestore();
  });
});
