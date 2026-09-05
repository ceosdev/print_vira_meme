import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { IMAGES_DIR, MAX_IMAGE_SIDE, THUMB_SIDE, createImageService, targetSize } from '@/services/imageService';

const fsMock = FileSystem as unknown as { __files: Map<string, { modificationTime: number }> };

describe('targetSize', () => {
  it('reduz pelo lado maior e nunca amplia', () => {
    expect(targetSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(targetSize(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
    expect(targetSize(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('imageService.pick', () => {
  beforeEach(() => fsMock.__files.clear());

  it('galeria: redimensiona para 1600 e gera thumb de 480 dentro de images/', async () => {
    const svc = createImageService();
    const r = await svc.pick('gallery');
    if (r.status !== 'ok') throw new Error(r.status);
    expect(r.image).toMatchObject({ width: MAX_IMAGE_SIDE, height: 1200, source: 'gallery' });
    expect(r.image.uri.startsWith(IMAGES_DIR)).toBe(true);
    expect(r.image.thumbUri.startsWith(IMAGES_DIR)).toBe(true);
    expect(r.image.thumbUri).toContain(`${THUMB_SIDE}`);
    expect(fsMock.__files.size).toBe(2);
  });

  it('câmera negada e cancelamento', async () => {
    const svc = createImageService();
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    expect(await svc.pick('camera')).toEqual({ status: 'denied' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({ canceled: true, assets: null });
    expect(await svc.pick('gallery')).toEqual({ status: 'cancelled' });
  });

  it('cleanupCache apaga só arquivos antigos', async () => {
    const svc = createImageService();
    const now = Date.now() / 1000;
    fsMock.__files.set(`${IMAGES_DIR}old.jpg`, { modificationTime: now - 2 * 86400 });
    fsMock.__files.set(`${IMAGES_DIR}new.jpg`, { modificationTime: now - 60 });
    await svc.cleanupCache(24 * 60 * 60 * 1000);
    expect([...fsMock.__files.keys()]).toEqual([`${IMAGES_DIR}new.jpg`]);
  });
});
