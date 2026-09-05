import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { createMediaService } from '@/services/mediaService';
import { createShareService } from '@/services/shareService';

describe('shareService', () => {
  it('abre a share sheet com mime e título', async () => {
    const svc = createShareService();
    expect(await svc.shareImage('file:///m.jpg', 'image/jpeg')).toBe('opened');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///m.jpg',
      expect.objectContaining({ mimeType: 'image/jpeg', dialogTitle: 'Compartilhar meme' }),
    );
  });
  it('sem app disponível → unavailable; erro → error', async () => {
    const svc = createShareService();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    expect(await svc.shareImage('file:///m.jpg', 'image/jpeg')).toBe('unavailable');
    (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('x'));
    expect(await svc.shareImage('file:///m.jpg', 'image/jpeg')).toBe('error');
  });
});

describe('mediaService', () => {
  it('salva com permissão só de escrita; negada → denied; erro → error', async () => {
    const svc = createMediaService();
    expect(await svc.saveToGallery('file:///m.jpg')).toBe('saved');
    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true);
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    expect(await svc.saveToGallery('file:///m.jpg')).toBe('denied');
    (MediaLibrary.saveToLibraryAsync as jest.Mock).mockRejectedValueOnce(new Error('x'));
    expect(await svc.saveToGallery('file:///m.jpg')).toBe('error');
  });
});
