import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Sheet } from '@/components/ui/Sheet';

describe('Sheet', () => {
  it('não monta os filhos quando fechada', async () => {
    await render(
      <Sheet open={false} onClose={() => {}}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(screen.queryByText('conteúdo')).toBeNull();
  });

  it('mostra os filhos quando aberta', async () => {
    await render(
      <Sheet open onClose={() => {}}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    expect(screen.getByText('conteúdo')).toBeTruthy();
  });

  it('toque no fundo fecha', async () => {
    const onClose = jest.fn();
    await render(
      <Sheet open onClose={onClose}>
        <Text>conteúdo</Text>
      </Sheet>,
    );
    await fireEvent.press(screen.getByTestId('sheet-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

});
