import { isFontUnlocked, isPresetUnlocked, paywallContext } from '@/utils/paywallRules';

describe('paywallContext', () => {
  it('usa o nome do template no gatilho premium_template', () => {
    expect(paywallContext('premium_template', 'Pódio')).toBe('Para usar "Pódio" você precisa do PRO');
  });
  it('gatilhos sem contexto retornam null', () => {
    expect(paywallContext('home_card')).toBeNull();
    expect(paywallContext('settings')).toBeNull();
  });
  it('demais gatilhos têm frase fixa', () => {
    expect(paywallContext('remove_watermark')).toMatch(/sem a marca/);
  });
});

describe('isPresetUnlocked', () => {
  const free = { premium: false };
  const pro = { premium: true };
  const pack = { premium: true, packId: 'futebol' };
  it('free sempre; premium só PRO ou pack comprado', () => {
    expect(isPresetUnlocked(free, { isPro: false, packIds: [] })).toBe(true);
    expect(isPresetUnlocked(pro, { isPro: false, packIds: [] })).toBe(false);
    expect(isPresetUnlocked(pro, { isPro: true, packIds: [] })).toBe(true);
    expect(isPresetUnlocked(pack, { isPro: false, packIds: ['futebol'] })).toBe(true);
    expect(isPresetUnlocked(pack, { isPro: false, packIds: ['humor'] })).toBe(false);
  });
});

describe('isFontUnlocked', () => {
  it('fontes free sempre; PRO só com PRO', () => {
    expect(isFontUnlocked('anton', false)).toBe(true);
    expect(isFontUnlocked('bangers', false)).toBe(false);
    expect(isFontUnlocked('bangers', true)).toBe(true);
  });
});
