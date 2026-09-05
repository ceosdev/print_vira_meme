import { fireEvent, render, screen } from '@testing-library/react-native';
import { Chip } from '@/components/ui/Chip';
import { colors } from '@/theme/tokens';

describe('Chip', () => {
  it('mostra emoji + rótulo e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Chip label="Humor" emoji="😂" onPress={onPress} testID="chip" />);
    expect(screen.getByText('😂 Humor')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('chip'));
    expect(onPress).toHaveBeenCalled();
  });
  it('selecionado fica amarelo e marca accessibilityState', async () => {
    await render(<Chip label="Humor" selected onPress={() => {}} testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toBeSelected();
    expect(chip).toHaveStyle({ backgroundColor: colors.primary });
  });
});
