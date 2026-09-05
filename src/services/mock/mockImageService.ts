import type { ImportedImage } from '@/types/creation';
import type { ImageService } from '@/types/services';

/** Foto fictícia: 1600×1200 (paisagem). As URIs não existem; servem para testes de fluxo. */
export const MOCK_IMAGE: ImportedImage = {
  uri: 'mock://image-1600.jpg',
  thumbUri: 'mock://image-480.jpg',
  width: 1600,
  height: 1200,
  source: 'gallery',
};

export function createMockImageService(): ImageService {
  return {
    pick: async () => ({ status: 'ok', image: MOCK_IMAGE }),
    importUri: async (uri, source) => ({ ...MOCK_IMAGE, uri, source }),
    cleanupCache: async () => {},
    clearCache: async () => {},
  };
}
