// The maths behind the photo cropper. A crop is a window of fixed shape over the picture: how far
// it is zoomed in, and where its centre sits in the picture's own pixels. Pure, so it can be tested.

/** Photos are shown wide across the app (garage cards, vehicle header), so the crop is 16:9. */
export const PHOTO_ASPECT = 16 / 9;
export const MAX_ZOOM = 4;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The biggest window of this shape that fits inside the picture. */
export function fullWindow(imgW: number, imgH: number, aspect = PHOTO_ASPECT): { w: number; h: number } {
  return imgW / imgH > aspect ? { w: imgH * aspect, h: imgH } : { w: imgW, h: imgW / aspect };
}

/** The part of the picture inside the window, kept fully inside the picture. */
export function cropRect(imgW: number, imgH: number, zoom: number, cx: number, cy: number, aspect = PHOTO_ASPECT): Rect {
  const base = fullWindow(imgW, imgH, aspect);
  const z = Math.min(MAX_ZOOM, Math.max(1, zoom));
  const w = base.w / z;
  const h = base.h / z;
  const x = Math.min(imgW - w, Math.max(0, cx - w / 2));
  const y = Math.min(imgH - h, Math.max(0, cy - h / 2));
  return { x, y, w, h };
}
