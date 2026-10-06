// Copies the OCR engine and its English data into public/ocr, so reading a photo of a document works
// offline and never calls a third-party CDN. Runs before dev and build; the output is not committed.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'ocr');
const from = (p) => join(root, 'node_modules', p);
const files = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['tesseract.js-core/tesseract-core.wasm.js', 'tesseract-core.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd.wasm.js', 'tesseract-core-simd.wasm.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd.wasm.js', 'tesseract-core-relaxedsimd.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'eng.traineddata.gz'],
];
mkdirSync(out, { recursive: true });
for (const [src, name] of files) {
  if (!existsSync(from(src))) {
    console.warn(`copy-ocr: ${src} is missing; run npm install`);
    continue;
  }
  copyFileSync(from(src), join(out, name));
}
