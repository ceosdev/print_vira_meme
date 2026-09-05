import type { AnalyticsEvent } from '@/types/analytics';
import type { AnalyticsService } from '@/types/services';

export interface MockAnalyticsService extends AnalyticsService {
  events: AnalyticsEvent[];
}

export function createMockAnalyticsService(): MockAnalyticsService {
  let enabled = true;
  const events: AnalyticsEvent[] = [];
  return {
    events,
    track: (event) => {
      if (!enabled) return;
      events.push(event);
      if (typeof __DEV__ !== 'undefined' && __DEV__ && process.env.NODE_ENV !== 'test') console.log('[analytics]', event);
    },
    setEnabled: (v) => {
      enabled = v;
    },
  };
}
