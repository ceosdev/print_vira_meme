import { useCallback, useState } from 'react';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useCreationStore } from '@/store/creationStore';

/** Escolhe uma foto (galeria/câmera), importa para o cache e grava na criação. */
export function usePhotoFlow() {
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async (source: 'gallery' | 'camera'): Promise<boolean> => {
    setPicking(true);
    setError(null);
    try {
      const result = await services.image.pick(source);
      if (result.status === 'ok') {
        useCreationStore.getState().setImage(result.image);
        services.analytics.track({ name: 'image_selected', source });
        return true;
      }
      if (result.status === 'denied') {
        setError(source === 'gallery' ? strings.photoSheet.galleryDenied : strings.photoSheet.cameraDenied);
      } else if (result.status === 'error') {
        setError(strings.photoSheet.invalidImage);
      }
      return false;
    } finally {
      setPicking(false);
    }
  }, []);

  return { pick, picking, error, clearError: () => setError(null) };
}
