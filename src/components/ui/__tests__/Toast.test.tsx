import { act, render, screen } from '@testing-library/react-native';
import { ToastHost } from '@/components/ui/Toast';
import { useToastStore } from '@/store/toastStore';

describe('Toast', () => {
  it('mostra a mensagem e some depois do tempo', async () => {
    jest.useFakeTimers();
    await render(<ToastHost />);
    await act(async () => {
      useToastStore.getState().show('Salvo na galeria ✓', 'success');
    });
    expect(screen.getByText('Salvo na galeria ✓')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.queryByText('Salvo na galeria ✓')).toBeNull();
    jest.useRealTimers();
  });
});
