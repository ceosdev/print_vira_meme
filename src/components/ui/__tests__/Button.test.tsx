import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('chama onPress e mostra o rótulo', async () => {
    const onPress = jest.fn();
    await render(<Button label="Gerar meme" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Gerar meme'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('em loading esconde o rótulo, mostra o spinner e não dispara', async () => {
    const onPress = jest.fn();
    await render(<Button label="Gerar meme" onPress={onPress} loading testID="btn" />);
    expect(screen.queryByText('Gerar meme')).toBeNull();
    expect(screen.getByTestId('btn-spinner')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
  it('desabilitado não dispara', async () => {
    const onPress = jest.fn();
    await render(<Button label="x" onPress={onPress} disabled testID="btn" />);
    await fireEvent.press(screen.getByTestId('btn'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
