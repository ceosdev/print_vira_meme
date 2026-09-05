import { useIncomingShare } from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useCreationStore } from '@/store/creationStore';
import { useToastStore } from '@/store/toastStore';

/**
 * Entrada por "Compartilhar → Print Vira Meme" (UX §3.8). Imagem: importa, grava e vai para o catálogo.
 * Qualquer outro conteúdo: avisa e fica onde está. Só funciona em build nativo (o Expo Go ignora).
 */
export function useIncomingImage() {
  const router = useRouter();
  const { sharedPayloads, resolvedSharedPayloads, clearSharedPayloads } = useIncomingShare();
  const handling = useRef(false);

  useEffect(() => {
    if (handling.current) return;
    const resolved = resolvedSharedPayloads[0];
    const raw = sharedPayloads[0];
    const payload = resolved ?? raw;
    if (!payload) return;

    const mimeType = (resolved?.contentMimeType ?? payload.mimeType ?? '').toLowerCase();
    const uri = resolved?.contentUri ?? payload.value;
    const isImage = mimeType.startsWith('image/') || payload.shareType === 'image';

    handling.current = true;
    clearSharedPayloads();

    if (!isImage || !uri) {
      useToastStore.getState().show(strings.shareIntent.notImage);
      handling.current = false;
      return;
    }

    services.image
      .importUri(uri, 'share_intent')
      .then((image) => {
        useCreationStore.getState().setImage(image);
        services.analytics.track({ name: 'app_open', entry: 'share_intent' });
        services.analytics.track({ name: 'image_selected', source: 'share_intent' });
        router.replace('/templates');
      })
      .catch(() => useToastStore.getState().show(strings.photoSheet.invalidImage))
      .finally(() => {
        handling.current = false;
      });
  }, [clearSharedPayloads, resolvedSharedPayloads, router, sharedPayloads]);
}
