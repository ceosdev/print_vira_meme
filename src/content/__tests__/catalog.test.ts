import { catalog } from '@/content';

describe('catalog', () => {
  it('carrega 8 categorias, 14 layouts, 50 presets e 311 frases', () => {
    expect(catalog.categories).toHaveLength(8);
    expect(catalog.layouts).toHaveLength(14);
    expect(catalog.presets).toHaveLength(50);
    expect(catalog.phrases).toHaveLength(311);
  });

  it('categorias vêm ordenadas por order', () => {
    expect(catalog.categories.map((c) => c.id)).toEqual([
      'humor', 'trabalho', 'relacionamento', 'dinheiro', 'futebol', 'familia', 'faculdade', 'role',
    ]);
  });

  it('todo preset aponta para um layout existente', () => {
    for (const p of catalog.presets) expect(catalog.layoutOf(p).id).toBe(p.layoutId);
  });

  it('presetsForCategory traz primários primeiro e depois os com tag', () => {
    const list = catalog.presetsForCategory('faculdade');
    const primary = list.filter((p) => p.category === 'faculdade');
    expect(primary.map((p) => p.order)).toEqual([1, 2, 3]);
    expect(list.length).toBeGreaterThan(3);
    expect(list.slice(0, 3).every((p) => p.category === 'faculdade')).toBe(true);
    expect(list.slice(3).every((p) => p.tags?.includes('faculdade'))).toBe(true);
  });

  it('popularPresets são todos free e são 10', () => {
    const pop = catalog.popularPresets();
    expect(pop).toHaveLength(10);
    expect(pop.every((p) => !p.premium)).toBe(true);
  });

  it('newPresets respeita a janela de dias', () => {
    expect(catalog.newPresets(new Date('2026-09-10T12:00:00Z'))).toHaveLength(50);
    expect(catalog.newPresets(new Date('2026-12-01T12:00:00Z'))).toHaveLength(0);
  });

  it('suggestionsFor filtra por tipo e tamanho e prioriza a categoria', () => {
    const s = catalog.suggestionsFor({ slotType: 'option', maxChars: 40, category: 'trabalho' });
    expect(s.length).toBeGreaterThan(0);
    expect(s.every((p) => p.slotTypes.includes('option') && p.text.length <= 40)).toBe(true);
    expect(s[0].categories).toContain('trabalho');
    const short = catalog.suggestionsFor({ slotType: 'label', maxChars: 5, category: 'humor' });
    expect(short.every((p) => p.text.length <= 5)).toBe(true);
  });

  it('suggestionsFor exclui o texto atual', () => {
    const s = catalog.suggestionsFor({ slotType: 'top', maxChars: 80, category: 'humor', exclude: 'EU: HOJE VOU DORMIR CEDO' });
    expect(s.some((p) => p.text === 'EU: HOJE VOU DORMIR CEDO')).toBe(false);
  });
});
