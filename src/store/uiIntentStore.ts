import { create } from 'zustand';

interface UiIntentState {
  /** a Home deve abrir o seletor de foto assim que aparecer (vindo de "Criar outro meme") */
  wantsPhoto: boolean;
  requestPhoto(): void;
  clearPhoto(): void;
}

export const useUiIntentStore = create<UiIntentState>()((set) => ({
  wantsPhoto: false,
  requestPhoto: () => set({ wantsPhoto: true }),
  clearPhoto: () => set({ wantsPhoto: false }),
}));
