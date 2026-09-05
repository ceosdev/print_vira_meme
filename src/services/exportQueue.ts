import type { ExportResult } from '@/types/creation';
import type { ExportRequest } from '@/types/services';

export interface ExportJob {
  id: number;
  req: ExportRequest;
  resolve(r: ExportResult): void;
  reject(e: Error): void;
}

type Listener = (job: ExportJob | null) => void;

let seq = 0;
let current: ExportJob | null = null;
const queue: ExportJob[] = [];
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(current));

function next() {
  if (current || queue.length === 0) return;
  current = queue.shift() ?? null;
  emit();
}

/** Enfileira um job; o ExportHost renderiza e captura um de cada vez. */
export function enqueueExport(req: ExportRequest): { id: number; promise: Promise<ExportResult> } {
  const id = ++seq;
  const promise = new Promise<ExportResult>((resolve, reject) => {
    queue.push({ id, req, resolve, reject });
    next();
  });
  return { id, promise };
}

export function subscribeExportJobs(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

function settle(id: number, fn: (job: ExportJob) => void) {
  if (!current || current.id !== id) return;
  const job = current;
  current = null;
  fn(job);
  emit();
  next();
}

export function completeExport(id: number, result: ExportResult): void {
  settle(id, (job) => job.resolve(result));
}

export function failExport(id: number, error: Error): void {
  settle(id, (job) => job.reject(error));
}
