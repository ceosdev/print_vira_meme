import { render, screen } from '@testing-library/react-native';
import HomeScreen from '@/app/index';

describe('Home placeholder', () => {
  it('mostra o wordmark e os totais do catálogo', async () => {
    await render(<HomeScreen />);
    expect(screen.getByLabelText('Print Vira Meme')).toBeTruthy();
    expect(screen.getByText('14 layouts · 50 templates · 311 frases')).toBeTruthy();
  });
});
