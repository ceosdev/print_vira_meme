import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entitlements } from '@/types/entitlements';
import { jsonStorage } from './storage';

interface EntitlementState extends Entitlements {
  updatedAt: number | null;
  setEntitlements(e: Entitlements): void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set) => ({
      isPro: false,
      packIds: [],
      updatedAt: null,
      setEntitlements: (e) => set({ isPro: e.isPro, packIds: [...e.packIds], updatedAt: Date.now() }),
    }),
    {
      name: 'pvm.entitlements',
      storage: jsonStorage,
      partialize: (s) => ({ isPro: s.isPro, packIds: s.packIds, updatedAt: s.updatedAt }),
    },
  ),
);
