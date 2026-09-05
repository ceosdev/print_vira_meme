import { fireEvent, render, screen } from '@testing-library/react-native';
import ResultScreen from '@/app/result';
import { configureServices, services } from '@/services';
import { createMockAdsService } from '@/services/mock/mockAdsService';
import { createMockAnalyticsService, type MockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockExportService } from '@/services/mock/mockExportService';
import { MOCK_IMAGE } from '@/services/mock/mockImageService';
import { createMockMediaService } from '@/services/mock/mockMediaService';
import { createMockShareService } from '@/services/mock/mockShareService';
import { useCountersStore } from '@/store/countersStore';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import { useProLiteStore } from '@/store/proLiteStore';
import { useUiIntentStore } from '@/store/uiIntentStore';
import { useToastStore } from '@/store/toastStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }) }));

const events = () => (services.analytics as unknown as MockAnalyticsService).events.map((e) => e.name);

beforeEach(async () => {
  mockReplace.mockClear();
  useCreationStore.getState().reset();
  useEntitlementStore.getState().setEntitlements({ isPro: false, packIds: [] });
  useCountersStore.setState({ exports: 0, shares: 0, saves: 0, exportsSinceAd: 0, lastAdAt: null, adCloseCount: 0, shareMilestoneShown: false });
  useProLiteStore.getState().hide();
  useUiIntentStore.getState().clearPhoto();
  useToastStore.getState().hide();
  configureServices({
    analytics: createMockAnalyticsService(),
    export: createMockExportService(),
    share: createMockShareService(),
    media: createMockMediaService(),
    ads: createMockAdsService(),
  });
  useCreationStore.getState().setImage(MOCK_IMAGE);
  useCreationStore.getState().setPreset('humor-dormir-cedo');
  useCreationStore.getState().setLastExport({ uri: 'mock://m.jpg', width: 1080, height: 1080, format: 'jpg', quality: 'standard', hasBrand: true });
});

describe('Result', () => {
  it('mostra o meme, o link de tirar a marca (Free) e compartilha', async () => {
    await render(<ResultScreen />);
    expect(screen.getByTestId('result-image')).toBeTruthy();
    expect(screen.getByTestId('remove-watermark')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('share'));
    expect(useCountersStore.getState().shares).toBe(1);
    expect(events()).toContain('meme_shared');
  });

  it('3º compartilhamento abre a sheet PRO leve uma única vez', async () => {
    useCountersStore.setState({ shares: 2 });
    await render(<ResultScreen />);
    await fireEvent.press(screen.getByTestId('share'));
    expect(useProLiteStore.getState().trigger).toBe('share_milestone');
    expect(useCountersStore.getState().shareMilestoneShown).toBe(true);
    useProLiteStore.getState().hide();
  useUiIntentStore.getState().clearPhoto();
    await fireEvent.press(screen.getByTestId('share'));
    expect(useProLiteStore.getState().trigger).toBeNull();
  });

  it('salvar mostra o toast e vira "Salvo ✓"; negado avisa', async () => {
    await render(<ResultScreen />);
    await fireEvent.press(screen.getByTestId('save'));
    expect(useToastStore.getState().message).toBe('Salvo na galeria ✓');
    expect(screen.getByText('Salvo ✓')).toBeTruthy();

    configureServices({ media: { saveToGallery: async () => 'denied' } });
    await fireEvent.press(screen.getByTestId('save'));
    expect(useToastStore.getState().message).toMatch(/Sem acesso à galeria/);
  });

  it('"Outro template" volta ao catálogo sem anúncio; "Criar outro" passa pelo AdGate e limpa a criação', async () => {
    configureServices({ ads: createMockAdsService({ alwaysReady: true }) });
    useCountersStore.setState({ exports: 5, exportsSinceAd: 5 });
    await render(<ResultScreen />);

    await fireEvent.press(screen.getByTestId('another-template'));
    expect(mockReplace).toHaveBeenCalledWith('/templates');
    expect(useCountersStore.getState().lastAdAt).toBeNull();
    expect(events()).toContain('remake_same_photo');

    await fireEvent.press(screen.getByTestId('create-another'));
    expect(useCountersStore.getState().lastAdAt).not.toBeNull();
    expect(useCreationStore.getState().image).toBeUndefined();
    expect(useUiIntentStore.getState().wantsPhoto).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('PRO mostra HD e não mostra o link da marca', async () => {
    useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
    await render(<ResultScreen />);
    expect(screen.getByText('HD ✓')).toBeTruthy();
    expect(screen.queryByTestId('remove-watermark')).toBeNull();
  });
});
