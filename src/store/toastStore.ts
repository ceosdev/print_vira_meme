import { create } from 'zustand';

export type ToastIcon = 'success' | 'none';

interface ToastState {
  message: string | null;
  icon: ToastIcon;
  show(message: string, icon?: ToastIcon): void;
  hide(): void;
}

export const TOAST_MS = 2500;
let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  icon: 'none',
  show: (message, icon = 'none') => {
    if (timer) clearTimeout(timer);
    set({ message, icon });
    timer = setTimeout(() => set({ message: null }), TOAST_MS);
  },
  hide: () => {
    if (timer) clearTimeout(timer);
    timer = null;
    set({ message: null });
  },
}));
