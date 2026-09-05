import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { completeExport, failExport, subscribeExportJobs, type ExportJob } from '@/services/exportQueue';
import { captureCanvas } from '@/services/exportService';
import { resolveLayout } from '@/utils/templateEngine';
import { MemeCanvas, RENDER_SCALE } from './MemeCanvas';

/** Monte uma vez no layout raiz. Renderiza o canvas fora da tela só enquanto há um job de exportação. */
export function ExportHost() {
  const [job, setJob] = useState<ExportJob | null>(null);
  useEffect(() => subscribeExportJobs(setJob), []);
  if (!job) return null;
  return <ExportRenderer key={job.id} job={job} />;
}

function ExportRenderer({ job }: { job: ExportJob }) {
  const ref = useRef<View>(null);
  const [imageReady, setImageReady] = useState(false);
  const { req } = job;
  const scale = RENDER_SCALE * (req.quality === 'hd' ? 2 : 1);
  const resolved = useMemo(
    () =>
      resolveLayout({
        layout: req.layout,
        values: req.values,
        style: req.style,
        positions: req.positions,
        extraTexts: req.extraTexts,
        showBrand: req.showBrand,
      }),
    [req],
  );

  useEffect(() => {
    if (!imageReady) return;
    let cancelled = false;
    // dois frames: um para o layout, outro para a pintura
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        captureCanvas(ref, req).then(
          (result) => completeExport(job.id, result),
          (e: unknown) => failExport(job.id, e instanceof Error ? e : new Error(String(e))),
        );
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [imageReady, job.id, req]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -20000, top: 0 }}>
      <MemeCanvas
        ref={ref}
        testID="export-canvas"
        resolved={resolved}
        image={req.image}
        imageTransform={req.imageTransform}
        scale={scale}
        onImageLoad={() => setImageReady(true)}
        onImageError={() => failExport(job.id, new Error('image_load'))}
      />
    </View>
  );
}
