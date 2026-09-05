import { render, screen } from '@testing-library/react-native';
import HomeScreen from '@/app/index';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Link: ({ children, ...props }: { children: React.ReactNode }) => React.createElement(Text, props, children),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  };
});

describe('Home placeholder', () => {
  it('mostra o wordmark e os totais do catálogo', async () => {
    await render(<HomeScreen />);
    expect(screen.getByLabelText('Print Vira Meme')).toBeTruthy();
    expect(screen.getByText('14 layouts · 50 templates · 311 frases')).toBeTruthy();
  });
});
