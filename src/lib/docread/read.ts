// Gets the words out of a file, on this device. A PDF with a text layer (what insurers and the
// parivahan site produce) is read directly. A photo or scanned PDF goes through OCR (Tesseract, in
// a background worker). Nothing is uploaded: only OCR's language data is downloaded, once.

import { isImage, isPdf } from '../image';
import { loadPdfjs } from '../pdfjs';

export type ReadResult =
  | { status: 'ok'; text: string; method: 'pdf' | 'ocr' }
  | { status: 'password'; wrong: boolean }
  | { status: 'failed'; reason: string };

export interface ReadOptions {
  password?: string;
  /** 0 to 1, for the slow OCR path. */
  onProgress?: (fraction: number, stage: string) => void;
  signal?: AbortSignal;
}

const MAX_PAGES = 4;
/** Fewer characters than this on a page means it is a picture of text, not text. */
const MIN_TEXT = 60;

async function loadPdf(data: ArrayBuffer, password?: string) {
  const pdfjs = await loadPdfjs();
  return pdfjs.getDocument({ data: new Uint8Array(data), password }).promise;
}

type PdfDoc = Awaited<ReturnType<typeof loadPdf>>;

/** Text items grouped into lines by their vertical position, so "label  value" stays on one line. */
async function pdfText(doc: PdfDoc): Promise<string> {
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, MAX_PAGES); n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const rows = new Map<number, { x: number; s: string }[]>();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3);
      const row = rows.get(y) ?? [];
      row.push({ x: item.transform[4], s: item.str });
      rows.set(y, row);
    }
    const lines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, cells]) => cells.sort((a, b) => a.x - b.x).map((c) => c.s).join('  '));
    pages.push(lines.join('\n'));
  }
  return pages.join('\n\n');
}

async function pdfToCanvases(doc: PdfDoc): Promise<HTMLCanvasElement[]> {
  const out: HTMLCanvasElement[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, 2); n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(2.5, 2000 / base.width) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvas, viewport }).promise;
    out.push(canvas);
  }
  return out;
}

/** A photo as a canvas: upright, no bigger than OCR needs, flattened to grey with the contrast lifted. */
async function imageToCanvas(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('no canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const c = Math.max(0, Math.min(255, (g - 128) * 1.35 + 128));
      d[i] = d[i + 1] = d[i + 2] = c;
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  } finally {
    bitmap.close();
  }
}

async function ocr(canvases: HTMLCanvasElement[], opts: ReadOptions): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  let done = 0;
  // The engine and its English data are served from this app (public/ocr), not a third-party CDN.
  const base = new URL(`${import.meta.env.BASE_URL}ocr`, window.location.href).href.replace(/\/$/, '');
  const worker = await createWorker('eng', 1, {
    workerPath: `${base}/worker.min.js`,
    corePath: base,
    langPath: base,
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') opts.onProgress?.((done + m.progress) / canvases.length, 'Reading the text');
      else if (/loading|initializ/.test(m.status)) opts.onProgress?.(0, 'Getting the reader ready');
    },
  });
  try {
    const parts: string[] = [];
    for (const c of canvases) {
      if (opts.signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      const { data } = await worker.recognize(c);
      parts.push(data.text);
      done++;
    }
    return parts.join('\n\n');
  } finally {
    await worker.terminate();
  }
}

export async function readDocument(file: File, opts: ReadOptions = {}): Promise<ReadResult> {
  try {
    if (isPdf(file)) {
      let doc: PdfDoc;
      try {
        doc = await loadPdf(await file.arrayBuffer(), opts.password);
      } catch (e) {
        const err = e as { name?: string; code?: number };
        if (err.name === 'PasswordException') return { status: 'password', wrong: err.code === 2 };
        return { status: 'failed', reason: 'That PDF could not be opened.' };
      }
      const text = await pdfText(doc);
      if (text.replace(/\s/g, '').length >= MIN_TEXT) return { status: 'ok', text, method: 'pdf' };
      opts.onProgress?.(0, 'This PDF is a picture, so it is being read as one');
      return { status: 'ok', text: await ocr(await pdfToCanvases(doc), opts), method: 'ocr' };
    }
    if (isImage(file)) {
      opts.onProgress?.(0, 'Preparing the photo');
      return { status: 'ok', text: await ocr([await imageToCanvas(file)], opts), method: 'ocr' };
    }
    return { status: 'failed', reason: 'Only photos and PDFs can be read.' };
  } catch (e) {
    if ((e as Error).name === 'AbortError') return { status: 'failed', reason: 'Cancelled.' };
    console.warn('Reading the file failed:', (e as Error).message);
    return { status: 'failed', reason: 'This file could not be read. You can still fill the details in by hand.' };
  }
}
