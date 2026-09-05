import { useCallback, useState } from 'react';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useCountersStore } from '@/store/countersStore';
import { useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import { useProLiteStore } from '@/store/proLiteStore';
import { useToastStore } from '@/store/toastStore';
import { shouldShowShareMilestone } from '@/utils/adRules';

/** Compartilhar e salvar o meme já exportado, com contadores, marco do 3º share e toasts. */
export function useShareFlow() {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);

  const share = useCallback(async () => {
    const s = useCreationStore.getState();
    if (!s.lastExport || !s.presetId) return;
    setBusy('share');
    try {
      const outcome = await services.share.shareImage(s.lastExport.uri, s.lastExport.format === 'png' ? 'image/png' : 'image/jpeg');
      if (outcome !== 'opened') {
        useToastStore.getState().show(strings.result.shareUnavailable);
        return;
      }
      useCountersStore.getState().recordShare();
      services.analytics.track({ name: 'meme_shared', presetId: s.presetId });
      const counters = useCountersStore.getState();
      const isPro = useEntitlementStore.getState().isPro;
      if (shouldShowShareMilestone({ isPro, shares: counters.shares, alreadyShown: counters.shareMilestoneShown })) {
        counters.markShareMilestoneShown();
        useProLiteStore.getState().show('share_milestone');
      }
    } finally {
      setBusy(null);
    }
  }, []);

  const save = useCallback(async () => {
    const s = useCreationStore.getState();
    if (!s.lastExport || !s.presetId) return;
    setBusy('save');
    try {
      const outcome = await services.media.saveToGallery(s.lastExport.uri);
      if (outcome === 'saved') {
        setSaved(true);
        useCountersStore.getState().recordSave();
        services.analytics.track({ name: 'meme_saved', presetId: s.presetId });
        useToastStore.getState().show(strings.result.savedToast, 'success');
      } else {
        useToastStore.getState().show(outcome === 'denied' ? strings.result.saveDenied : strings.result.saveFailed);
      }
    } finally {
      setBusy(null);
    }
  }, []);

  return { share, save, saved, busy };
}
