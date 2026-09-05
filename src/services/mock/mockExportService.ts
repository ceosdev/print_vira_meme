import type { ExportService } from '@/types/services';
import { canvasHeight } from '@/utils/templateEngine';

export function createMockExportService(): ExportService {
  let seq = 0;
  return {
    exportMeme: async (req) => {
      const factor = req.quality === 'hd' ? 2 : 1;
      return {
        uri: `mock://export-${++seq}.${req.quality === 'hd' ? 'png' : 'jpg'}`,
        width: 1080 * factor,
        height: canvasHeight(req.layout, req.showBrand) * factor,
        format: req.quality === 'hd' ? 'png' : 'jpg',
        quality: req.quality,
        hasBrand: req.showBrand,
      };
    },
  };
}
