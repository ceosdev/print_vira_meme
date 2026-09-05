import { render, screen } from '@testing-library/react-native';
import HomeScreen from '@/app/index';

describe('scaffold', () => {
  it('renderiza a Home placeholder', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Print Vira Meme')).toBeTruthy();
  });
});
