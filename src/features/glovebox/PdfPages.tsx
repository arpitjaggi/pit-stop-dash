import { useEffect, useRef, useState } from 'react';
import { loadPdfjs } from '@/lib/pdfjs';
import { Notice, Spinner } from '@/ui/atoms';

/**
 * Renders a PDF as stacked pages sized to the container, so it reads well on a phone.
 * pdf.js is loaded only when a PDF is opened, so it never weighs on the first load.
 */
export function PdfPages({ url, onFail }: { url: string; onFail?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    el.replaceChildren();
    setState('loading');

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const doc = await pdfjs.getDocument({ url }).promise;
        const width = el.clientWidth || 360;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        for (let n = 1; n <= Math.min(doc.numPages, 30); n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * dpr });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.className = 'pdf-page';
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `Page ${n} of ${doc.numPages}`);
          el.appendChild(canvas);
          await page.render({ canvas, viewport }).promise;
          if (n === 1) setState('ready');
        }
        setState('ready');
      } catch {
        if (!cancelled) {
          setState('error');
          onFail?.();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, onFail]);

  return (
    <div className="pdf">
      {state === 'loading' && (
        <div className="pdf__loading">
          <Spinner label="Opening document" />
        </div>
      )}
      {state === 'error' && <Notice tone="error">This PDF could not be shown here. Use Open or Download instead.</Notice>}
      <div ref={host} className="pdf__pages" />
    </div>
  );
}
