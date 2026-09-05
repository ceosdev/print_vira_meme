import { fireEvent, render, screen } from '@testing-library/react-native';
import TemplatesScreen from '@/app/templates';
import { configureServices, services } from '@/services';
import { createMockAnalyticsService, type MockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockImageService, MOCK_IMAGE } from '@/services/mock/mockImageService';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';

const mockPush = jest.fn();
const mockParams: { category?: string; filter?: string } = {};
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const events = () => (services.analytics as unknown as MockAnalyticsService).events;

beforeEach(() => {
  mockPush.mockClear();
  delete mockParams.category;
  delete mockParams.filter;
  useCreationStore.getState().reset();
  useEntitlementStore.getState().setEntitlements({ isPro: false, packIds: [] });
  configureServices({ image: createMockImageService(), analytics: createMockAnalyticsService() });
});

describe('Templates', () => {
  it('mostra os filtros e todos os presets por padrão', async () => {
    await render(<TemplatesScreen />);
    expect(screen.getByTestId('filter-all')).toBeTruthy();
    expect(screen.getByTestId('filter-humor')).toBeTruthy();
    expect(screen.getByLabelText('Hoje vou dormir cedo')).toBeTruthy();
  });

  it('pré-seleciona a categoria vinda da rota e filtra', async () => {
    mockParams.category = 'futebol';
    await render(<TemplatesScreen />);
    expect(screen.getByTestId('filter-futebol')).toBeSelected();
    expect(screen.getByLabelText('Placar da pelada')).toBeTruthy();
    expect(screen.queryByLabelText('Hoje vou dormir cedo')).toBeNull();
  });

  it('com foto, tocar num card grava o preset, emite preset_selected e vai para /editor', async () => {
    useCreationStore.getState().setImage(MOCK_IMAGE);
    await render(<TemplatesScreen />);
    await fireEvent.press(screen.getByLabelText('Hoje vou dormir cedo'));
    expect(useCreationStore.getState().presetId).toBe('humor-dormir-cedo');
    expect(events().map((e) => e.name)).toContain('preset_selected');
    expect(mockPush).toHaveBeenCalledWith('/editor');
  });

  it('sem foto, tocar num card abre a sheet e só depois navega', async () => {
    await render(<TemplatesScreen />);
    await fireEvent.press(screen.getByLabelText('Hoje vou dormir cedo'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText('De onde vem a foto?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pick-gallery'));
    expect(mockPush).toHaveBeenCalledWith('/editor');
  });
});
