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
