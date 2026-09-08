import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SUGGESTION_COUNT } from '@/components/editor/TextSheet';
import EditorScreen from '@/app/editor';
import { configureServices, services } from '@/services';
import { createMockAnalyticsService, type MockAnalyticsService } from '@/services/mock/mockAnalyticsService';
import { createMockExportService } from '@/services/mock/mockExportService';
import { MOCK_IMAGE } from '@/services/mock/mockImageService';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePaywallStore } from '@/store/paywallStore';
import { sizes } from '@/theme/tokens';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }) }));

const events = () => (services.analytics as unknown as MockAnalyticsService).events.map((e) => e.name);

const setup = (presetId: string, isPro = false) => {
  useCreationStore.getState().reset();
  useCreationStore.getState().setImage(MOCK_IMAGE);
  useCreationStore.getState().setPreset(presetId);
  useEntitlementStore.getState().setEntitlements({ isPro, packIds: [] });
};

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  usePaywallStore.getState().clear();
  configureServices({ analytics: createMockAnalyticsService(), export: createMockExportService() });
});

describe('Editor', () => {
  it('mostra slots do layout e gera o meme (Free em preset free)', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    expect(screen.getByTestId('slot-top')).toBeTruthy();
    expect(screen.getByTestId('slot-bottom')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('generate'));
    expect(useCreationStore.getState().lastExport).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith('/result');
    expect(events()).toContain('meme_exported');
  });

  it('preset PRO no Free: CTA de desbloqueio e paywall com continuação', async () => {
    setup('humor-podio-desculpas');
    await render(<EditorScreen />);
    expect(screen.getByText('Desbloquear PRO e gerar')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('generate'));
    expect(mockPush).toHaveBeenCalledWith('/pro');
    expect(usePaywallStore.getState().trigger).toBe('premium_template');
    expect(useCreationStore.getState().lastExport).toBeUndefined();
  });

  it('fonte PRO abre o paywall; fonte free aplica', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    await fireEvent.press(screen.getByTestId('font-bangers'));
    expect(usePaywallStore.getState().trigger).toBe('premium_font');
    expect(useCreationStore.getState().style.font).toBeUndefined();
    await fireEvent.press(screen.getByTestId('font-bebas'));
    expect(useCreationStore.getState().style.font).toBe('bebas');
  });

  it('CAPS é livre; cor é PRO', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    await fireEvent.press(screen.getByTestId('style-caps'));
    expect(useCreationStore.getState().style.caps).toBe(true);
    await fireEvent.press(screen.getByTestId('style-color-#EF4444'));
    expect(usePaywallStore.getState().trigger).toBe('premium_style');
    expect(useCreationStore.getState().style.color).toBeUndefined();
  });

  it('toca no slot, aplica sugestão e o valor muda', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    await fireEvent.press(screen.getByTestId('slot-top'));
    expect(screen.getByTestId('text-input')).toBeTruthy();
    const suggestion = screen.getAllByTestId(/^suggestion-/)[0];
    await fireEvent.press(suggestion);
    expect(useCreationStore.getState().values.top).not.toBe('EU: HOJE VOU DORMIR CEDO');
    expect(events()).toContain('suggestion_used');
    await fireEvent.press(screen.getByTestId('text-done'));
    expect(screen.queryByTestId('text-input')).toBeNull();
  });

  it('a lista de sugestões dá o que folhear e cada uma é clicável de dedo', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    await fireEvent.press(screen.getByTestId('slot-top'));
    const suggestions = screen.getAllByTestId(/^suggestion-/);
    expect(suggestions).toHaveLength(SUGGESTION_COUNT);
    for (const item of suggestions) {
      expect(StyleSheet.flatten(item.props.style).minHeight).toBeGreaterThanOrEqual(sizes.touchTarget);
    }
  });

  it('mover textos no Free abre o paywall', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    await fireEvent.press(screen.getByTestId('move-texts'));
    expect(usePaywallStore.getState().trigger).toBe('premium_style');
    expect(screen.queryByText('Movendo textos')).toBeNull();
  });

  it('mover textos no PRO ativa o modo', async () => {
    setup('humor-dormir-cedo', true);
    await render(<EditorScreen />);
    await fireEvent.press(screen.getByTestId('move-texts'));
    expect(screen.getByText('Movendo textos')).toBeTruthy();
  });

  it('a dica de enquadrar aparece antes de mexer na foto', async () => {
    setup('humor-dormir-cedo');
    await render(<EditorScreen />);
    expect(screen.getByText('Arraste ou dê pinça para enquadrar a foto')).toBeTruthy();
  });

  it('PRO exporta sem marca e alterna o enquadramento', async () => {
    setup('humor-dormir-cedo', true);
    await render(<EditorScreen />);
    expect(screen.queryByText('printvirameme')).toBeNull();
    await fireEvent.press(screen.getByTestId('toggle-fit'));
    expect(useCreationStore.getState().imageTransform.fit).toBe('contain-blur');
  });
});
