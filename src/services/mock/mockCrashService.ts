import type { CrashService } from '@/types/services';

export function createMockCrashService(): CrashService {
  return {
    captureException: (error, context) => {
      if (process.env.NODE_ENV !== 'test') console.warn('[crash]', error, context ?? '');
    },
  };
}
