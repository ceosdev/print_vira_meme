import type { MediaService } from '@/types/services';

type MediaLibraryModule = typeof import('expo-media-library/legacy');

/**
 * Carregado sob demanda: `expo-media-library` imprime um aviso no Expo Go assim que é importado,
 * e ele só é necessário quando o usuário toca em "Salvar". `require` dentro da função é lazy no Metro.
 */
function mediaLibrary(): MediaLibraryModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-media-library/legacy') as MediaLibraryModule;
}

export function createMediaService(): MediaService {
  return {
    saveToGallery: async (uri) => {
      try {
        const MediaLibrary = mediaLibrary();
        const perm = await MediaLibrary.requestPermissionsAsync(true);
        if (!perm.granted) return 'denied';
        await MediaLibrary.saveToLibraryAsync(uri);
        return 'saved';
      } catch (e) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[mediaService.save]', e);
        return 'error';
      }
    },
  };
}
