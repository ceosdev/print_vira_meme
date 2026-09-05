import fs from 'node:fs';
import path from 'node:path';
import { validateCatalog } from '../src/content/schema';

const root = path.join(__dirname, '../src/content');
const readDir = (dir: string): unknown[] =>
  fs
    .readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => {
      const json = JSON.parse(fs.readFileSync(path.join(root, dir, f), 'utf8')) as unknown;
      return Array.isArray(json) ? (json as unknown[]) : [json];
    });

const report = validateCatalog(
  {
    layouts: readDir('layouts'),
    presets: readDir('presets'),
    phrases: readDir('phrases'),
    categories: JSON.parse(fs.readFileSync(path.join(root, 'categories.json'), 'utf8')) as unknown[],
  },
  { strict: true },
);

for (const w of report.warnings) console.warn(`aviso: ${w}`);
for (const e of report.errors) console.error(`erro: ${e}`);
const { layouts, presets, phrases, categories } = report.counts;
console.log(`catálogo: ${layouts} layouts · ${presets} presets · ${phrases} frases · ${categories} categorias → ${report.ok ? 'OK' : 'FALHOU'}`);
process.exit(report.ok ? 0 : 1);
