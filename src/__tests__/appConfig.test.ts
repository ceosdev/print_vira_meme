/**
 * @jest-environment node
 */
import config from '../../app.config';
import { FONT_FILES } from '@/theme/fonts';

describe('app.config.ts', () => {
  it('plugin expo-font embarca exatamente as fontes do catálogo (mesma ordem)', () => {
    const plugin = config.plugins?.find((p): p is [string, { fonts: string[] }] => Array.isArray(p) && p[0] === 'expo-font');
    expect(plugin?.[1].fonts).toEqual(FONT_FILES);
  });

  it('identidade Android fixa', () => {
    expect(config.android?.package).toBe('com.cartech.printvirameme');
    expect(config.scheme).toBe('printvirameme');
  });
});
