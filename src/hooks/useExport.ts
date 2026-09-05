import { useCallback, useState } from 'react';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useCountersStore } from '@/store/countersStore';
import { selectLayout, useCreationStore } from '@/store/creationStore';
import { useEntitlementStore } from '@/store/entitlementStore';
import type { ExportResult } from '@/types/creation';

/** Exporta a criação atual: Free = JPEG 1080 com brand; PRO = PNG 2160 sem brand. */
export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (): Promise<ExportResult | null> => {
    const s = useCreationStore.getState();
    const layout = selectLayout(s);
    if (!s.image || !layout || !s.presetId) return null;
    const isPro = useEntitlementStore.getState().isPro;
    setExporting(true);
    setError(null);
    const started = Date.now();
    try {
      const result = await services.export.exportMeme({
        layout,
        values: s.values,
        positions: s.positions,
        extraTexts: s.extraTexts,
        image: s.image,
        imageTransform: s.imageTransform,
        style: s.style,
        showBrand: !isPro,
        quality: isPro ? 'hd' : 'standard',
      });
      useCreationStore.getState().setLastExport(result);
      useCountersStore.getState().recordExport();
      services.analytics.track({
        name: 'meme_exported',
        presetId: s.presetId,
        quality: result.quality,
        hasBrand: result.hasBrand,
        durationMs: Date.now() - started,
      });
      return result;
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'unknown';
      services.analytics.track({ name: 'export_failed', reason });
      services.crash.captureException(e, { where: 'useExport' });
      setError(strings.editor.exportFailed);
      return null;
    } finally {
      setExporting(false);
    }
  }, []);

  return { run, exporting, error };
}
