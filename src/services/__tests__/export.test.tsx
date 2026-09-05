import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { captureRef } from 'react-native-view-shot';
import { ExportHost } from '@/components/canvas/ExportHost';
import { catalog } from '@/content';
import { EXPORTS_DIR, createExportService } from '@/services/exportService';
import type { ExportRequest } from '@/types/services';
import { identityTransform } from '@/utils/imageTransform';

const layout = catalog.layoutById.get('noticia')!;
const req: ExportRequest = {
  layout,
  values: { title: 'Teste' },
  positions: {},
  extraTexts: [],
  image: { uri: 'file:///a.jpg', thumbUri: 'file:///a-thumb.jpg', width: 1600, height: 1200, source: 'gallery' },
  imageTransform: identityTransform('cover'),
  style: { caps: false },
  showBrand: true,
  quality: 'standard',
};

describe('exportação', () => {
  it('renderiza o canvas fora da tela, captura em 1080 px e move para exports/', async () => {
    await render(<ExportHost />);
    const svc = createExportService();
    const promise = svc.exportMeme(req);
    await waitFor(() => expect(screen.getByTestId('export-canvas')).toBeTruthy());
    await fireEvent(screen.getByTestId('export-canvas-image-main'), 'load');
    const result = await promise;
    expect(captureRef).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ format: 'jpg', width: 1080, height: 1350, result: 'tmpfile' }),
    );
    expect(result).toMatchObject({ width: 1080, height: 1350, format: 'jpg', quality: 'standard', hasBrand: true });
    expect(result.uri.startsWith(EXPORTS_DIR)).toBe(true);
    await waitFor(() => expect(screen.queryByTestId('export-canvas')).toBeNull());
  });

  it('HD exporta PNG em 2160 e sem brand encolhe a altura', async () => {
    await render(<ExportHost />);
    const svc = createExportService();
    const promise = svc.exportMeme({ ...req, quality: 'hd', showBrand: false });
    await waitFor(() => expect(screen.getByTestId('export-canvas')).toBeTruthy());
    await fireEvent(screen.getByTestId('export-canvas-image-main'), 'load');
    const result = await promise;
    expect(result).toMatchObject({ width: 2160, height: 2572, format: 'png', hasBrand: false });
  });

  it('estoura o timeout se a imagem nunca carrega', async () => {
    await render(<ExportHost />);
    const svc = createExportService({ timeoutMs: 50 });
    await expect(svc.exportMeme(req)).rejects.toThrow('timeout');
    await waitFor(() => expect(screen.queryByTestId('export-canvas')).toBeNull());
  });
});
