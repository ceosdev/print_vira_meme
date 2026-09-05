import { fireEvent, render, screen } from '@testing-library/react-native';
import HomeScreen from '@/app/index';
import { configureServices } from '@/services';
import { createMockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockImageService } from '@/services/mock/mockImageService';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';

const mockPush = jest.fn();
const mockParams: { pick?: string } = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

beforeEach(() => {
  mockPush.mockClear();
  delete mockParams.pick;
  useCreationStore.getState().reset();
  useEntitlementStore.getState().setEntitlements({ isPro: false, packIds: [] });
  configureServices({ image: createMockImageService(), analytics: createMockAnalyticsService() });
});

describe('Home', () => {
  it('mostra herói, categorias, populares e o card PRO no Free', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('CRIAR MEME')).toBeTruthy();
    expect(screen.getByTestId('chip-humor')).toBeTruthy();
    expect(screen.getByTestId('chip-role')).toBeTruthy();
    expect(screen.getByText('🔥 Populares')).toBeTruthy();
    expect(screen.getByText(/sem marca, sem anúncios/)).toBeTruthy();
  });

  it('esconde o card PRO quando já é PRO', async () => {
    useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
    await render(<HomeScreen />);
    expect(screen.queryByText(/sem marca, sem anúncios/)).toBeNull();
    expect(screen.getByText('✓ PRO')).toBeTruthy();
  });

  it('herói abre a sheet de foto; escolher galeria grava a foto e navega para /templates', async () => {
    await render(<HomeScreen />);
    expect(screen.queryByText('De onde vem a foto?')).toBeNull();
    await fireEvent.press(screen.getByText('CRIAR MEME'));
    expect(screen.getByText('De onde vem a foto?')).toBeTruthy();
    expect(screen.getByText('Suas fotos ficam no seu celular. Nada é enviado.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pick-gallery'));
    expect(useCreationStore.getState().image).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith('/templates');
  });

  it('permissão negada mostra a mensagem e não navega', async () => {
    configureServices({ image: { ...createMockImageService(), pick: async () => ({ status: 'denied' }) } });
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByText('CRIAR MEME'));
    await fireEvent.press(screen.getByTestId('pick-gallery'));
    expect(screen.getByText('Sem acesso à galeria. Você pode liberar em Configurações.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('vindo de "Criar outro meme" (?pick=1) já abre a sheet', async () => {
    mockParams.pick = '1';
    await render(<HomeScreen />);
    expect(screen.getByText('De onde vem a foto?')).toBeTruthy();
  });

  it('chip de categoria navega com o parâmetro', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByTestId('chip-futebol'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/templates', params: { category: 'futebol' } });
  });
});
