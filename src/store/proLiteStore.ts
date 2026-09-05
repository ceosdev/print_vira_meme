import { create } from 'zustand';

export type ProLiteTrigger = 'share_milestone' | 'ad_close';

interface ProLiteState {
  trigger: ProLiteTrigger | null;
  show(t: ProLiteTrigger): void;
  hide(): void;
}

export const useProLiteStore = create<ProLiteState>()((set) => ({
  trigger: null,
  show: (trigger) => set({ trigger }),
  hide: () => set({ trigger: null }),
}));
