import { catalog } from '@/content';
import { selectCanEdit, selectLayout, useCreationStore } from '@/store/creationStore';
import { defaultValues } from '@/utils/templateEngine';

const image = { uri: 'file:///a.jpg', thumbUri: 'file:///a-thumb.jpg', width: 1600, height: 1200, source: 'gallery' as const };

beforeEach(() => useCreationStore.getState().reset());

describe('creationStore', () => {
  it('começa vazio e sem condições de editar', () => {
    const s = useCreationStore.getState();
    expect(s.image).toBeUndefined();
    expect(s.presetId).toBeUndefined();
    expect(selectCanEdit(s)).toBe(false);
  });

  it('setPreset preenche os valores padrão e o fit do layout', () => {
    useCreationStore.getState().setPreset('humor-academia-segunda');
    const s = useCreationStore.getState();
    const preset = catalog.presetById.get('humor-academia-segunda')!;
    expect(s.layoutId).toBe('noticia');
    expect(s.values).toEqual(defaultValues(preset, catalog.layoutOf(preset)));
    expect(s.imageTransform).toEqual({ scale: 1, offsetX: 0, offsetY: 0, fit: 'cover' });
    expect(selectLayout(s)?.id).toBe('noticia');
  });

  it('trocar de preset migra o título editado e zera posições/extras', () => {
    const st = useCreationStore.getState();
    st.setPreset('humor-academia-segunda');
    st.setValue('title', 'MEU TÍTULO');
    st.setPosition('title-text', { x: 1, y: 2 });
    st.addExtraText('x');
    useCreationStore.getState().setPreset('fam-manchete-tia');
    const s = useCreationStore.getState();
    expect(s.values.title).toBe('MEU TÍTULO');
    expect(s.positions).toEqual({});
    expect(s.extraTexts).toEqual([]);
  });

  it('setImage guarda a foto, mantém o fit e zera zoom/pan e lastExport', () => {
    const st = useCreationStore.getState();
    st.setPreset('humor-dormir-cedo');
    st.setImageTransform({ fit: 'contain-blur', scale: 1, offsetX: 0, offsetY: 0 });
    st.setLastExport({ uri: 'x', width: 1, height: 1, format: 'jpg', quality: 'standard', hasBrand: true });
    useCreationStore.getState().setImage(image);
    const s = useCreationStore.getState();
    expect(s.image).toEqual(image);
    expect(s.imageTransform.fit).toBe('contain-blur');
    expect(s.imageTransform.scale).toBe(1);
    expect(s.lastExport).toBeUndefined();
    expect(selectCanEdit(s)).toBe(true);
  });

  it('qualquer edição invalida lastExport', () => {
    const st = useCreationStore.getState();
    st.setPreset('humor-dormir-cedo');
    st.setLastExport({ uri: 'x', width: 1, height: 1, format: 'jpg', quality: 'standard', hasBrand: true });
    useCreationStore.getState().setStyle({ caps: true });
    expect(useCreationStore.getState().lastExport).toBeUndefined();
  });

  it('extraTexts: adiciona, atualiza e remove', () => {
    const st = useCreationStore.getState();
    const id = st.addExtraText('oi');
    useCreationStore.getState().updateExtraText(id, { x: 10, y: 20 });
    expect(useCreationStore.getState().extraTexts).toEqual([{ id, content: 'oi', x: 10, y: 20 }]);
    useCreationStore.getState().removeExtraText(id);
    expect(useCreationStore.getState().extraTexts).toEqual([]);
  });

  it('setPreset com id inexistente não muda nada', () => {
    useCreationStore.getState().setPreset('nao-existe');
    expect(useCreationStore.getState().presetId).toBeUndefined();
  });
});
