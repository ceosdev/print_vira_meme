import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ProScreen from '@/app/pro';
import { configureServices, services } from '@/services';
import { createMockAnalyticsService, type MockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockPurchaseService } from '@/services/mock/mockPurchaseService';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePaywallStore } from '@/store/paywallStore';
import { useToastStore } from '@/store/toastStore';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }) }));

const events = () => (services.analytics as unknown as MockAnalyticsService).events.map((e) => e.name);

beforeEach(() => {
  mockBack.mockClear();
  usePaywallStore.getState().clear();
  useToastStore.getState().hide();
  useEntitlementStore.getState().setEntitlements({ isPro: false, packIds: [] });
  configureServices({ analytics: createMockAnalyticsService(), purchase: createMockPurchaseService({ delayMs: 0 }) });
});

describe('Paywall', () => {
  it('mostra a frase do gatilho, os benefícios e o preço da loja', async () => {
    usePaywallStore.getState().open('premium_template', undefined, 'Pódio');
    await render(<ProScreen />);
    expect(screen.getByText('Para usar "Pódio" você precisa do PRO')).toBeTruthy();
    expect(screen.getByText('Pague uma vez. Use para sempre.')).toBeTruthy();
    expect(screen.getByText("Sem marca d'água")).toBeTruthy();
    await waitFor(() => expect(screen.getByText('LIBERAR TUDO · R$ 19,90')).toBeTruthy());
    expect(screen.getByText('compra única')).toBeTruthy();
  });

  it('compra libera o PRO, executa a continuação e fecha', async () => {
    const continuation = jest.fn();
    usePaywallStore.getState().open('remove_watermark', continuation);
    await render(<ProScreen />);
    await waitFor(() => expect(screen.getByTestId('buy')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('buy'));
    await waitFor(() => expect(useEntitlementStore.getState().isPro).toBe(true));
    expect(continuation).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalled();
    expect(useToastStore.getState().message).toBe('Bem-vindo ao PRO 🎉');
    expect(events()).toEqual(expect.arrayContaining(['purchase_started', 'purchase_completed']));
  });

  it('restaurar sem compra mostra a mensagem e não libera', async () => {
    await render(<ProScreen />);
    await fireEvent.press(screen.getByTestId('restore'));
    await waitFor(() => expect(screen.getByText('Nenhuma compra encontrada nesta conta Google.')).toBeTruthy());
    expect(useEntitlementStore.getState().isPro).toBe(false);
  });

  it('compra cancelada não mostra mensagem de erro', async () => {
    configureServices({ purchase: createMockPurchaseService({ delayMs: 0, nextOutcome: { status: 'cancelled' } }) });
    await render(<ProScreen />);
    await waitFor(() => expect(screen.getByTestId('buy')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('buy'));
    expect(screen.queryByText(/não concluiu/)).toBeNull();
    expect(useEntitlementStore.getState().isPro).toBe(false);
  });

  it('compra offline avisa', async () => {
    configureServices({ purchase: createMockPurchaseService({ delayMs: 0, nextOutcome: { status: 'offline' } }) });
    await render(<ProScreen />);
    await waitFor(() => expect(screen.getByTestId('buy')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('buy'));
    await waitFor(() => expect(screen.getByText('Sem conexão. O Google Play precisa de internet para a compra.')).toBeTruthy());
  });
});
