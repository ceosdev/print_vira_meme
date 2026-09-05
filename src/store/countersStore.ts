import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';

export interface Counters {
  exports: number;
  shares: number;
  saves: number;
  /** exportações desde o último interstitial (ou desde sempre, se nunca houve) */
  exportsSinceAd: number;
  lastAdAt: number | null;
  adCloseCount: number;
  shareMilestoneShown: boolean;
}

interface CountersState extends Counters {
  recordExport(): void;
  recordShare(): void;
  recordSave(): void;
  recordAdShown(now?: number): void;
  recordAdClosed(): void;
  markShareMilestoneShown(): void;
}

const initial: Counters = {
  exports: 0,
  shares: 0,
  saves: 0,
  exportsSinceAd: 0,
  lastAdAt: null,
  adCloseCount: 0,
  shareMilestoneShown: false,
};

export const useCountersStore = create<CountersState>()(
  persist(
    (set) => ({
      ...initial,
      recordExport: () => set((s) => ({ exports: s.exports + 1, exportsSinceAd: s.exportsSinceAd + 1 })),
      recordShare: () => set((s) => ({ shares: s.shares + 1 })),
      recordSave: () => set((s) => ({ saves: s.saves + 1 })),
      recordAdShown: (now = Date.now()) => set({ exportsSinceAd: 0, lastAdAt: now }),
      recordAdClosed: () => set((s) => ({ adCloseCount: s.adCloseCount + 1 })),
      markShareMilestoneShown: () => set({ shareMilestoneShown: true }),
    }),
    {
      name: 'pvm.counters',
      storage: jsonStorage,
      partialize: (s) => ({
        exports: s.exports,
        shares: s.shares,
        saves: s.saves,
        exportsSinceAd: s.exportsSinceAd,
        lastAdAt: s.lastAdAt,
        adCloseCount: s.adCloseCount,
        shareMilestoneShown: s.shareMilestoneShown,
      }),
    },
  ),
);
