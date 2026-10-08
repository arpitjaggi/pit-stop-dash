import { useEffect, useRef, useState } from 'react';
import { MAX_ZOOM, PHOTO_ASPECT, cropRect } from '@/lib/crop';
import { Button, Notice } from '@/ui/atoms';

const VIEW_W = 960;
const VIEW_H = Math.round(VIEW_W / PHOTO_ASPECT);
const OUT_MAX_W = 1440;

/**
 * Frame a photo before it is uploaded: drag to move, slide or scroll to zoom. The frame is the
 * shape the app shows photos in, so what you see here is what the garage will show.
 */
export function CropDialog({ file, onCancel, onDone }: { file: File; onCancel: () => void; onDone: (cropped: File) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [centre, setCentre] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    return () => {
      if (d?.open) d.close();
    };
  }, []);

  useEffect(() => {
    let live = true;
    let made: ImageBitmap | null = null;
    createImageBitmap(file, { imageOrientation: 'from-image' })
      .then((b) => {
        if (!live) return b.close();
        made = b;
        setBitmap(b);
        setCentre({ x: b.width / 2, y: b.height / 2 });
      })
      .catch(() => live && setError('That file could not be read as an image.'));
    return () => {
      live = false;
      made?.close();
    };
  }, [file]);

  const rect = bitmap && centre ? cropRect(bitmap.width, bitmap.height, zoom, centre.x, centre.y) : null;

  useEffect(() => {
    const c = canvas.current?.getContext('2d');
    if (!c || !bitmap || !rect) return;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, VIEW_W, VIEW_H);
    c.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h, 0, 0, VIEW_W, VIEW_H);
  }, [bitmap, rect?.x, rect?.y, rect?.w, rect?.h]); // eslint-disable-line react-hooks/exhaustive-deps

  function move(dxImg: number, dyImg: number) {
    if (!bitmap || !centre) return;
    const next = cropRect(bitmap.width, bitmap.height, zoom, centre.x + dxImg, centre.y + dyImg);
    setCentre({ x: next.x + next.w / 2, y: next.y + next.h / 2 });
  }

  function changeZoom(z: number) {
    if (!bitmap || !centre) return;
    const clamped = Math.min(MAX_ZOOM, Math.max(1, z));
    const next = cropRect(bitmap.width, bitmap.height, clamped, centre.x, centre.y);
    setZoom(clamped);
    setCentre({ x: next.x + next.w / 2, y: next.y + next.h / 2 });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!centre) return;
    drag.current = { x: e.clientX, y: e.clientY, cx: centre.x, cy: centre.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const box = frame.current?.getBoundingClientRect();
    if (!d || !box || !rect || !bitmap) return;
    const perPx = rect.w / box.width;
    const next = cropRect(bitmap.width, bitmap.height, zoom, d.cx - (e.clientX - d.x) * perPx, d.cy - (e.clientY - d.y) * perPx);
    setCentre({ x: next.x + next.w / 2, y: next.y + next.h / 2 });
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (!rect) return;
    const step = rect.w * 0.05;
    const keys: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (keys[e.key]) {
      e.preventDefault();
      move(...keys[e.key]);
    } else if (e.key === '+' || e.key === '=') changeZoom(zoom + 0.2);
    else if (e.key === '-') changeZoom(zoom - 0.2);
  }

  async function confirm() {
    if (!bitmap || !rect) return;
    setBusy(true);
    try {
      const w = Math.max(1, Math.min(OUT_MAX_W, Math.round(rect.w)));
      const h = Math.max(1, Math.round(w / PHOTO_ASPECT));
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const c = out.getContext('2d');
      if (!c) throw new Error('no canvas');
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, w, h);
      c.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((res) => out.toBlob(res, 'image/jpeg', 0.92));
      if (!blob) throw new Error('no blob');
      onDone(new File([blob], 'vehicle-photo.jpg', { type: 'image/jpeg' }));
    } catch {
      setError('The photo could not be cropped. Try another picture.');
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} className="crop" aria-labelledby="crop-title" onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      <div className="crop__body">
        <h2 className="t-section" id="crop-title">Crop the photo</h2>
        <p className="t-ink-2">Drag to move it, slide to zoom. The garage shows photos wide, like this frame.</p>
        <div
          ref={frame}
          className="crop__frame"
          tabIndex={0}
          role="group"
          aria-label="Photo frame. Use the arrow keys to move the photo and plus or minus to zoom."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onWheel={(e) => changeZoom(zoom - Math.sign(e.deltaY) * 0.15)}
          onKeyDown={onKeyDown}
        >
          <canvas ref={canvas} className="crop__canvas" width={VIEW_W} height={VIEW_H} />
          <span className="crop__line crop__line--v1" aria-hidden="true" />
          <span className="crop__line crop__line--v2" aria-hidden="true" />
          <span className="crop__line crop__line--h1" aria-hidden="true" />
          <span className="crop__line crop__line--h2" aria-hidden="true" />
        </div>
        <label className="crop__zoom">
          <span className="field__label">Zoom</span>
          <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={zoom} onChange={(e) => changeZoom(Number(e.target.value))} disabled={!bitmap} />
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="crop__actions">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" busy={busy} disabled={!bitmap} onClick={confirm}>Use this crop</Button>
        </div>
      </div>
    </dialog>
  );
}
