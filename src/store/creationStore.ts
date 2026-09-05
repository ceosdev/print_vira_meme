import { create } from 'zustand';
import { catalog } from '@/content';
import type { Layout, Preset } from '@/types/catalog';
import type { Creation, ExportResult, ExtraText, ImageTransform, ImportedImage, StyleChoice } from '@/types/creation';
import { identityTransform } from '@/utils/imageTransform';
import { defaultValues, imageElementOf, migrateValues } from '@/utils/templateEngine';

interface CreationState extends Creation {
  setImage(image: ImportedImage): void;
  /** Escolhe o preset; se já havia um, migra os valores editados por tipo de slot. */
  setPreset(presetId: string): void;
  setValue(slotId: string, text: string): void;
  setStyle(patch: Partial<StyleChoice>): void;
  setImageTransform(t: ImageTransform): void;
  setPosition(elementId: string, pos: { x: number; y: number }): void;
  addExtraText(content: string): string;
  updateExtraText(id: string, patch: Partial<Omit<ExtraText, 'id'>>): void;
  removeExtraText(id: string): void;
  setLastExport(result: ExportResult | undefined): void;
  /** "Criar outro meme": limpa tudo, inclusive a foto. */
  reset(): void;
}

const initial: Creation = {
  image: undefined,
  presetId: undefined,
  layoutId: undefined,
  values: {},
  positions: {},
  extraTexts: [],
  imageTransform: identityTransform('cover'),
  style: { caps: false },
  lastExport: undefined,
};

let extraSeq = 0;

export const useCreationStore = create<CreationState>()((set) => ({
  ...initial,

  setImage: (image) =>
    set((s) => ({ image, imageTransform: identityTransform(s.imageTransform.fit), lastExport: undefined })),

  setPreset: (presetId) =>
    set((s) => {
      const preset = catalog.presetById.get(presetId);
      if (!preset) return {};
      const layout = catalog.layoutOf(preset);
      const toDefaults = defaultValues(preset, layout);
      const fromPreset = s.presetId ? catalog.presetById.get(s.presetId) : undefined;
      const fromLayout = s.layoutId ? catalog.layoutById.get(s.layoutId) : undefined;
      const values =
        fromPreset && fromLayout
          ? migrateValues({ from: fromLayout, to: layout, values: s.values, fromDefaults: defaultValues(fromPreset, fromLayout), toDefaults })
          : toDefaults;
      return {
        presetId,
        layoutId: layout.id,
        values,
        positions: {},
        extraTexts: [],
        imageTransform: identityTransform(imageElementOf(layout).defaultFit),
        lastExport: undefined,
      };
    }),

  setValue: (slotId, text) => set((s) => ({ values: { ...s.values, [slotId]: text }, lastExport: undefined })),
  setStyle: (patch) => set((s) => ({ style: { ...s.style, ...patch }, lastExport: undefined })),
  setImageTransform: (imageTransform) => set({ imageTransform, lastExport: undefined }),
  setPosition: (id, pos) => set((s) => ({ positions: { ...s.positions, [id]: pos }, lastExport: undefined })),

  addExtraText: (content) => {
    const id = `extra-${++extraSeq}`;
    set((s) => ({ extraTexts: [...s.extraTexts, { id, content, x: 40, y: 400 }], lastExport: undefined }));
    return id;
  },
  updateExtraText: (id, patch) =>
    set((s) => ({ extraTexts: s.extraTexts.map((t) => (t.id === id ? { ...t, ...patch } : t)), lastExport: undefined })),
  removeExtraText: (id) => set((s) => ({ extraTexts: s.extraTexts.filter((t) => t.id !== id), lastExport: undefined })),

  setLastExport: (lastExport) => set({ lastExport }),
  reset: () => set({ ...initial }),
}));

export const selectLayout = (s: Creation): Layout | undefined => (s.layoutId ? catalog.layoutById.get(s.layoutId) : undefined);
export const selectPreset = (s: Creation): Preset | undefined => (s.presetId ? catalog.presetById.get(s.presetId) : undefined);
export const selectCanEdit = (s: Creation): boolean => Boolean(s.image && s.presetId && s.layoutId);
