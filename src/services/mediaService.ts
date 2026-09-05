import * as MediaLibrary from 'expo-media-library/legacy';
import type { MediaService } from '@/types/services';

export function createMediaService(): MediaService {
  return {
    saveToGallery: async (uri) => {
      try {
        const perm = await MediaLibrary.requestPermissionsAsync(true);
        if (!perm.granted) return 'denied';
        await MediaLibrary.saveToLibraryAsync(uri);
        return 'saved';
      } catch {
        return 'error';
      }
    },
  };
}
