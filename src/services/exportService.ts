import * as FileSystem from 'expo-file-system/legacy';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { CANVAS_WIDTH } from '@/types/catalog';
import type { ExportResult } from '@/types/creation';
import type { ExportRequest, ExportService } from '@/types/services';
import { canvasHeight } from '@/utils/templateEngine';
import { enqueueExport, failExport } from './exportQueue';

export const EXPORTS_DIR = `${FileSystem.cacheDirectory ?? ''}exports/`;
export const EXPORT_TIMEOUT_MS = 8000;

async function ensureDir(dir: string) {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

/** Captura o nó do canvas em pixels exatos e move o arquivo para o cache de exportações. */
export async function captureCanvas(ref: RefObject<View | null>, req: ExportRequest): Promise<ExportResult> {
  const factor = req.quality === 'hd' ? 2 : 1;
  const width = CANVAS_WIDTH * factor;
  const height = canvasHeight(req.layout, req.showBrand) * factor;
  const format = req.quality === 'hd' ? 'png' : 'jpg';
  const tmp = await captureRef(ref, { format, quality: 0.9, width, height, result: 'tmpfile' });
  await ensureDir(EXPORTS_DIR);
  const uri = `${EXPORTS_DIR}meme-${Date.now()}.${format}`;
  await FileSystem.moveAsync({ from: tmp, to: uri });
  return { uri, width, height, format, quality: req.quality, hasBrand: req.showBrand };
}

export function createExportService(opts: { timeoutMs?: number } = {}): ExportService {
  const timeoutMs = opts.timeoutMs ?? EXPORT_TIMEOUT_MS;
  return {
    exportMeme: (req) => {
      const { id, promise } = enqueueExport(req);
      return new Promise<ExportResult>((resolve, reject) => {
        const timer = setTimeout(() => failExport(id, new Error('timeout')), timeoutMs);
        promise.then(
          (r) => {
            clearTimeout(timer);
            resolve(r);
          },
          (e: Error) => {
            clearTimeout(timer);
            reject(e);
          },
        );
      });
    },
  };
}
