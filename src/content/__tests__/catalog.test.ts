import { catalog } from '@/content';

describe('catalog', () => {
  it('carrega 12 categorias, 19 layouts, 75 presets e 400 frases', () => {
    expect(catalog.categories).toHaveLength(12);
    expect(catalog.layouts).toHaveLength(19);
    expect(catalog.presets).toHaveLength(75);
    expect(catalog.phrases).toHaveLength(400);
  });

  it('categorias vêm ordenadas por order', () => {
    expect(catalog.categories.map((c) => c.id)).toEqual([
      'humor', 'trabalho', 'relacionamento', 'dinheiro', 'futebol', 'familia', 'faculdade', 'role',
      'politicagem', 'pet', 'comida', 'tecnologia',
    ]);
  });

  it('todo preset aponta para um layout existente', () => {
    for (const p of catalog.presets) expect(catalog.layoutOf(p).id).toBe(p.layoutId);
  });

  it('presetsForCategory traz primários primeiro e depois os com tag', () => {
    const list = catalog.presetsForCategory('faculdade');
    const primary = list.filter((p) => p.category === 'faculdade');
    expect(primary.map((p) => p.order)).toEqual([1, 2, 3, 4, 5]);
    expect(list.length).toBeGreaterThan(5);
    expect(list.slice(0, 5).every((p) => p.category === 'faculdade')).toBe(true);
    expect(list.slice(5).every((p) => p.tags?.includes('faculdade'))).toBe(true);
  });

  it('popularPresets são todos free e são 15', () => {
    const pop = catalog.popularPresets();
    expect(pop).toHaveLength(15);
    expect(pop.every((p) => !p.premium)).toBe(true);
  });

  it('newPresets respeita a janela de dias', () => {
    expect(catalog.newPresets(new Date('2026-09-10T12:00:00Z'))).toHaveLength(75);
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
