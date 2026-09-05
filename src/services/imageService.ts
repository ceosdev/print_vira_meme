import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import type { ImageSource, ImportedImage } from '@/types/creation';
import type { ImageService, PickResult } from '@/types/services';
import { EXPORTS_DIR } from './exportService';

export const IMAGES_DIR = `${FileSystem.cacheDirectory ?? ''}images/`;
export const MAX_IMAGE_SIDE = 1600;
export const THUMB_SIDE = 480;

/** Tamanho com o lado maior limitado a maxSide, sem ampliar. */
export function targetSize(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const f = maxSide / longest;
  return { width: Math.round(width * f), height: Math.round(height * f) };
}

async function ensureDir(dir: string) {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

async function resizeToCache(uri: string, width: number, height: number, maxSide: number, name: string, compress: number) {
  const size = targetSize(width, height, maxSide);
  const ctx = ImageManipulator.manipulate(uri);
  if (size.width !== width || size.height !== height) {
    ctx.resize(width >= height ? { width: size.width } : { height: size.height });
  }
  const ref = await ctx.renderAsync();
  try {
    const saved = await ref.saveAsync({ format: SaveFormat.JPEG, compress });
    await ensureDir(IMAGES_DIR);
    const dest = `${IMAGES_DIR}${name}`;
    await FileSystem.moveAsync({ from: saved.uri, to: dest });
    return { uri: dest, width: saved.width, height: saved.height };
  } finally {
    ref.release();
  }
}

async function probeSize(uri: string): Promise<{ width: number; height: number }> {
  const ref = await ImageManipulator.manipulate(uri).renderAsync();
  try {
    return { width: ref.width, height: ref.height };
  } finally {
    ref.release();
  }
}

async function importImage(uri: string, width: number, height: number, source: ImageSource): Promise<ImportedImage> {
  const stamp = Date.now();
  const full = await resizeToCache(uri, width, height, MAX_IMAGE_SIDE, `img-${stamp}-${MAX_IMAGE_SIDE}.jpg`, 0.9);
  const thumb = await resizeToCache(uri, width, height, THUMB_SIDE, `img-${stamp}-${THUMB_SIDE}.jpg`, 0.85);
  return { uri: full.uri, thumbUri: thumb.uri, width: full.width, height: full.height, source };
}

/** Apaga arquivos do diretório mais velhos que maxAgeMs (maxAgeMs < 0 apaga todos). */
async function removeOlderThan(dir: string, maxAgeMs: number, now: number) {
  let names: string[];
  try {
    names = await FileSystem.readDirectoryAsync(dir);
  } catch {
    return; // diretório ainda não existe
  }
  for (const name of names) {
    const file = `${dir}${name}`;
    const stat = await FileSystem.getInfoAsync(file);
    if (stat.exists && !stat.isDirectory && now - stat.modificationTime * 1000 > maxAgeMs) {
      await FileSystem.deleteAsync(file, { idempotent: true });
    }
  }
}

export function createImageService(): ImageService {
  return {
    pick: async (source): Promise<PickResult> => {
      try {
        if (source === 'camera') {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return { status: 'denied' };
        }
        const res =
          source === 'gallery'
            ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsMultipleSelection: false, exif: false })
            : await ImagePicker.launchCameraAsync({ quality: 1, exif: false });
        if (res.canceled) return { status: 'cancelled' };
        const asset = res.assets[0];
        if (!asset) return { status: 'error' };
        return { status: 'ok', image: await importImage(asset.uri, asset.width, asset.height, source) };
      } catch (e) {
        // O usuário vê a mensagem amigável; o motivo real vai para o log/crash.
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[imageService.pick]', e);
        return { status: 'error' };
      }
    },
    importUri: async (uri, source) => {
      const { width, height } = await probeSize(uri);
      return importImage(uri, width, height, source);
    },
    cleanupCache: async (maxAgeMs) => {
      const now = Date.now();
      await removeOlderThan(IMAGES_DIR, maxAgeMs, now);
      await removeOlderThan(EXPORTS_DIR, maxAgeMs, now);
    },
    clearCache: async () => {
      const now = Date.now();
      await removeOlderThan(IMAGES_DIR, -1, now);
      await removeOlderThan(EXPORTS_DIR, -1, now);
    },
  };
}
