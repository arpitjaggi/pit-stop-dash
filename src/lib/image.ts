// Client-side image preparation. Photos and image documents are resized before upload so tiles
// and previews stay fast, and phones don't push 12 MP originals over a mobile connection.

import type { PreparedImage } from '@/data/api';

async function encode(canvas: HTMLCanvasElement | OffscreenCanvas, quality: number): Promise<{ blob: Blob; ext: 'webp' | 'jpg' }> {
  const toBlob = (type: string): Promise<Blob | null> =>
    'convertToBlob' in canvas
      ? canvas.convertToBlob({ type, quality })
      : new Promise((res) => (canvas as HTMLCanvasElement).toBlob(res, type, quality));
  const webp = await toBlob('image/webp');
  if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp' };
  const jpg = await toBlob('image/jpeg');
  if (!jpg) throw new Error('This image could not be processed.');
  return { blob: jpg, ext: 'jpg' };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

async function resize(bitmap: ImageBitmap, maxEdge: number, quality: number) {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new Error('This image could not be processed.');
  ctx.fillStyle = '#ffffff'; // flatten transparency; documents and photos are opaque
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  return encode(canvas, quality);
}

export interface ImageSpec {
  maxEdge: number;
  thumbEdge: number;
  quality?: number;
}

/** Vehicle photo: 1440 px on the long edge, with a 320 px thumbnail. */
export const PHOTO_SPEC: ImageSpec = { maxEdge: 1440, thumbEdge: 320, quality: 0.8 };
/** Image documents stay legible at 2400 px, with a 360 px preview. */
export const DOCUMENT_SPEC: ImageSpec = { maxEdge: 2400, thumbEdge: 360, quality: 0.86 };

export async function prepareImage(file: Blob, spec: ImageSpec): Promise<PreparedImage & { width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('That file could not be read as an image.');
  }
  try {
    const full = await resize(bitmap, spec.maxEdge, spec.quality ?? 0.82);
    const thumb = await resize(bitmap, spec.thumbEdge, 0.76);
    return { full: full.blob, thumb: thumb.blob, ext: full.ext, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export const isPdf = (f: { type: string; name?: string }) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name ?? '');
export const isImage = (f: { type: string }) => f.type.startsWith('image/');

/** Rough luminance test used to pick readable text colour over a paint swatch. */
export function isLightColour(hex: string): boolean {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
}
