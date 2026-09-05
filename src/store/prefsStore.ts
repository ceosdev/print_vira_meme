import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CategoryId } from '@/types/catalog';
import { jsonStorage } from './storage';

interface PrefsState {
  analyticsEnabled: boolean;
  lastCategory?: CategoryId;
  setAnalyticsEnabled(v: boolean): void;
  setLastCategory(c?: CategoryId): void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      analyticsEnabled: true,
      lastCategory: undefined,
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      setLastCategory: (lastCategory) => set({ lastCategory }),
    }),
    {
      name: 'pvm.prefs',
      storage: jsonStorage,
      partialize: (s) => ({ analyticsEnabled: s.analyticsEnabled, lastCategory: s.lastCategory }),
    },
  ),
);
