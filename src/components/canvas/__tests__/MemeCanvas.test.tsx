import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { CanvasImage } from '@/components/canvas/elements/CanvasImage';
import type { ResolvedImage } from '@/utils/templateEngine';
import { MemeCanvas, fitScale } from '@/components/canvas/MemeCanvas';
import { catalog } from '@/content';
import { identityTransform } from '@/utils/imageTransform';
import { resolveLayout } from '@/utils/templateEngine';

const layout = (id: string) => catalog.layoutById.get(id)!;
const image = { uri: 'file:///a.jpg', width: 1600, height: 1200 };
const t = identityTransform('cover');

describe('MemeCanvas', () => {
  it('fitScale escala pela largura de 1080', () => {
    expect(fitScale(360)).toBeCloseTo(1 / 3);
  });

  it('desenha texto substituído com 8 cópias de contorno + principal', async () => {
    const resolved = resolveLayout({ layout: layout('classic'), values: { top: 'oi' }, style: { caps: false }, showBrand: false });
    await render(<MemeCanvas resolved={resolved} image={image} imageTransform={t} scale={0.5} />);
    expect(screen.getAllByText('OI')).toHaveLength(9);
  });

  it('brand footer e pill aparecem só com showBrand', async () => {
    const withBrand = resolveLayout({ layout: layout('noticia'), values: { title: 't' }, style: { caps: false }, showBrand: true });
    await render(<MemeCanvas resolved={withBrand} image={image} imageTransform={t} scale={0.5} />);
    expect(screen.getByText('PRINT VIRA MEME')).toBeTruthy();

    const noBrand = resolveLayout({ layout: layout('noticia'), values: { title: 't' }, style: { caps: false }, showBrand: false });
    await render(<MemeCanvas resolved={noBrand} image={image} imageTransform={t} scale={0.5} />);
    expect(screen.queryByText('PRINT VIRA MEME')).toBeNull();

    const pill = resolveLayout({ layout: layout('classic'), values: { top: 'a' }, style: { caps: false }, showBrand: true });
    await render(<MemeCanvas resolved={pill} image={image} imageTransform={t} scale={0.5} />);
    expect(screen.getByText('printvirameme')).toBeTruthy();
  });

  it('a foto respeita rotation e opacity do elemento', async () => {
    const el: ResolvedImage = {
      kind: 'image', id: 'photo', x: 0, y: 0, width: 100, height: 100,
      radius: 0, defaultFit: 'cover', rotation: -8, opacity: 0.5,
    };
    await render(<CanvasImage el={el} scale={1} image={image} transform={t} testID="photo" />);
    const style = StyleSheet.flatten(screen.getByTestId('photo').props.style);
    expect(style.transform).toEqual([{ rotate: '-8deg' }]);
    expect(style.opacity).toBe(0.5);
  });

  it('sem foto mostra o placeholder do slot de imagem', async () => {
    const resolved = resolveLayout({ layout: layout('legenda'), values: { caption: 'x' }, style: { caps: false }, showBrand: false });
    await render(<MemeCanvas resolved={resolved} image={null} imageTransform={t} scale={0.5} testID="canvas" />);
    expect(screen.getByTestId('canvas-image-placeholder')).toBeTruthy();
  });

  it('canvas tem o tamanho resolvido × escala', async () => {
    const resolved = resolveLayout({ layout: layout('noticia'), values: { title: 't' }, style: { caps: false }, showBrand: false });
    await render(<MemeCanvas resolved={resolved} image={image} imageTransform={t} scale={0.5} testID="canvas" />);
    expect(screen.getByTestId('canvas')).toHaveStyle({ width: 540, height: 643 });
  });
});
