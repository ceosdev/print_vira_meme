import { act, renderHook } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { useInvite } from '@/hooks/useInvite';
import { configureServices, services } from '@/services';
import { createMockShareService } from '@/services/mock/mockShareService';

beforeEach(() => {
  configureServices({ share: createMockShareService() });
  jest.restoreAllMocks();
});

describe('useInvite', () => {
  it('abre o WhatsApp com o texto e o link do app', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { result } = await renderHook(() => useInvite());
    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.invite();
    });
    expect(outcome).toBe('whatsapp');
    const url = openURL.mock.calls[0][0];
    expect(url.startsWith('whatsapp://send?text=')).toBe(true);
    const text = decodeURIComponent(url.replace('whatsapp://send?text=', ''));
    expect(text).toContain('Print Vira Meme');
    expect(text).toContain('play.google.com');
  });

  it('sem WhatsApp instalado, cai na share sheet', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('No Activity found'));
    const shareText = jest.spyOn(services.share, 'shareText');
    const { result } = await renderHook(() => useInvite());
    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.invite();
    });
    expect(outcome).toBe('sheet');
    expect(shareText).toHaveBeenCalledWith(expect.stringContaining('play.google.com'));
  });
});
