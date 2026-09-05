import { create } from 'zustand';
import type { PaywallTrigger } from '@/types/analytics';

interface PaywallState {
  trigger: PaywallTrigger | null;
  presetName?: string;
  continuation?: () => void;
  open(trigger: PaywallTrigger, continuation?: () => void, presetName?: string): void;
  /** Devolve e limpa a continuação (executada pela tela PRO após a compra). */
  takeContinuation(): (() => void) | undefined;
  clear(): void;
}

export const usePaywallStore = create<PaywallState>()((set, get) => ({
  trigger: null,
  presetName: undefined,
  continuation: undefined,
  open: (trigger, continuation, presetName) => set({ trigger, continuation, presetName }),
  takeContinuation: () => {
    const c = get().continuation;
    set({ continuation: undefined });
    return c;
  },
  clear: () => set({ trigger: null, continuation: undefined, presetName: undefined }),
}));
