import { fireEvent, render, screen } from '@testing-library/react-native';
import { PremiumBadge } from '@/components/PremiumBadge';
import { ProPill } from '@/components/ProPill';

describe('badges', () => {
  it('PremiumBadge mostra PRO; variante lock não tem texto', async () => {
    await render(<PremiumBadge />);
    expect(screen.getByText('PRO')).toBeTruthy();
    await render(<PremiumBadge variant="lock" testID="lock" />);
    expect(screen.getByTestId('lock')).toBeTruthy();
  });
  it('ProPill alterna entre PRO e ✓ PRO e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<ProPill isPro={false} onPress={onPress} />);
    await fireEvent.press(screen.getByText('PRO'));
    expect(onPress).toHaveBeenCalled();
    await render(<ProPill isPro onPress={onPress} />);
    expect(screen.getByText('✓ PRO')).toBeTruthy();
  });
});
