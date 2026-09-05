import type { ShareService } from '@/types/services';

export function createMockShareService(): ShareService {
  return {
    shareImage: async () => 'opened',
    shareText: async () => 'opened',
  };
}
