import type { MediaService } from '@/types/services';

export function createMockMediaService(): MediaService {
  return { saveToGallery: async () => 'saved' };
}
