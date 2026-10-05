import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from './icons';
import { useSheet } from './hooks';

interface SheetProps {
  title: string;
  /** Defaults to closing the URL-driven sheet. */
  onClose?: () => void;
  children: ReactNode;
  /** Pinned action area: the primary action stays within thumb reach. */
  footer?: ReactNode;
  /** 'dialog' stays a centred dialog on every screen (for the command palette and the like). */
  tall?: boolean;
  /** Visually hide the title (it is still the dialog's accessible name). */
  quietTitle?: boolean;
}

/**
 * A modal sheet built on the native <dialog>: focus trap, Escape, inert background and screen-reader
 * semantics come from the platform. Bottom sheet on phones, centred dialog on desktop (CSS only).
 */
export function Sheet({ title, onClose: onCloseProp, children, footer, tall, quietTitle }: SheetProps) {
  const { close } = useSheet();
  const onClose = onCloseProp ?? close;
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const drag = useRef<{ y: number; dy: number } | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    return () => {
      if (d.open) d.close();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { y: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    ref.current.style.transform = `translateY(${drag.current.dy}px)`;
    ref.current.style.transition = 'none';
  };
  const onPointerUp = () => {
    const d = ref.current;
    if (!drag.current || !d) return;
    const dy = drag.current.dy;
    drag.current = null;
    d.style.transition = '';
    d.style.transform = '';
    if (dy > 90) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`sheet${tall ? ' sheet--tall' : ''}`}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet__grab" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} aria-hidden="true">
        <span />
      </div>
      <header className="sheet__head">
        <h2 id={id} className={quietTitle ? 'sr-only' : 't-section sheet__title'}>
          {title}
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden />
        </button>
      </header>
      <div className="sheet__body">{children}</div>
      {footer && <div className="sheet__foot">{footer}</div>}
    </dialog>
  );
}
