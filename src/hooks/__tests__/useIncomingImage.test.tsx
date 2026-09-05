import { renderHook, waitFor } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';
import { useIncomingImage } from '@/hooks/useIncomingImage';
import { configureServices, services } from '@/services';
import { createMockAnalyticsService, type MockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockImageService } from '@/services/mock/mockImageService';
import { useCreationStore } from '@/store/creationStore';
import { useToastStore } from '@/store/toastStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }) }));

const clearSharedPayloads = jest.fn();
const share = (payloads: unknown[], resolved: unknown[] = []) =>
  (Sharing.useIncomingShare as jest.Mock).mockReturnValue({
    sharedPayloads: payloads,
    resolvedSharedPayloads: resolved,
    clearSharedPayloads,
    isResolving: false,
    error: null,
    refreshSharePayloads: jest.fn(),
  });

const events = () => (services.analytics as unknown as MockAnalyticsService).events.map((e) => e.name);

beforeEach(() => {
  mockReplace.mockClear();
  clearSharedPayloads.mockClear();
  useCreationStore.getState().reset();
  useToastStore.getState().hide();
  configureServices({ image: createMockImageService(), analytics: createMockAnalyticsService() });
});

describe('useIncomingImage', () => {
  it('imagem compartilhada vira a foto da criação e abre o catálogo', async () => {
    share([{ value: 'content://foto.jpg', shareType: 'image', mimeType: 'image/jpeg' }]);
    await renderHook(() => useIncomingImage());
    await waitFor(() => expect(useCreationStore.getState().image).toBeTruthy());
    expect(useCreationStore.getState().image?.source).toBe('share_intent');
    expect(mockReplace).toHaveBeenCalledWith('/templates');
    expect(clearSharedPayloads).toHaveBeenCalled();
    expect(events()).toEqual(expect.arrayContaining(['app_open', 'image_selected']));
  });

  it('texto compartilhado só mostra o aviso', async () => {
    share([{ value: 'oi', shareType: 'text', mimeType: 'text/plain' }]);
    await renderHook(() => useIncomingImage());
    expect(useToastStore.getState().message).toBe('Compartilhe uma imagem para virar meme');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('sem payload não faz nada', async () => {
    share([]);
    await renderHook(() => useIncomingImage());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(useToastStore.getState().message).toBeNull();
  });
});
