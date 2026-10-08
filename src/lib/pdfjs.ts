import './polyfills';

/** pdf.js with a worker that works in older browsers too. Loaded only when a PDF is opened. */
export async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL('./pdfWorker.ts', import.meta.url), { type: 'module' });
  }
  return pdfjs;
}
