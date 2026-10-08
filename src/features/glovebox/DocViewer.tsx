import { useState } from 'react';
import { useApi } from '@/data/api';
import { useSignedUrl } from '@/data/hooks';
import { docTypeLabel, type VDocument } from '@/data/types';
import { formatDate, todayISO } from '@/lib/dates';
import { formatBytes } from '@/lib/format';
import { isPdf } from '@/lib/image';
import { documentStatus, docLabel } from '@/lib/status';
import { Button, Notice, Spinner, StatusLine } from '@/ui/atoms';
import { ArrowLeft, ArrowSquareOut, DownloadSimple, MagnifyingGlassMinus, MagnifyingGlassPlus, PencilSimple, ShareNetwork } from '@/ui/icons';
import { useSheet, useToast } from '@/ui/hooks';
import { PdfPages } from './PdfPages';
import { downloadDocument, openDocument, shareDocument } from './docActions';

/** Opens a document: the file first, then what it says. Works as a phone screen or a desktop pane. */
export function DocViewer({ doc, onClose }: { doc: VDocument; onClose?: () => void }) {
  const api = useApi();
  const url = useSignedUrl('documents', doc.file_path);
  const toast = useToast();
  const sheet = useSheet();
  const [zoomed, setZoomed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const status = documentStatus(doc, todayISO());
  const pdf = isPdf({ type: doc.mime_type, name: doc.file_name });
  const src = (f: string) => doc.extracted_fields.includes(f) ? 'From the document' : 'Entered by you';

  const run = async (name: string, fn: () => Promise<unknown>) => {
    setBusy(name);
    try {
      await fn();
    } catch (e) {
      toast((e as Error).message || 'That did not work.');
    } finally {
      setBusy(null);
    }
  };

  const fields: [string, string | null, string][] = [
    ['Type', docTypeLabel(doc.doc_type), 'doc_type'],
    ['Issued by', doc.issuer, 'issuer'],
    ['Reference', doc.reference_number, 'reference_number'],
    ['Issued', doc.issued_on ? formatDate(doc.issued_on) : null, 'issued_on'],
    ['Expires', doc.expires_on ? formatDate(doc.expires_on) : doc.doc_type === 'rc' ? 'Does not expire' : null, 'expires_on'],
    ['Notes', doc.notes, 'notes'],
  ];

  return (
    <article className="docview" aria-label={docLabel(doc)}>
      <header className="docview__bar">
        {onClose && (
          <button type="button" className="icon-btn" aria-label="Back to the Glovebox" onClick={onClose}>
            <ArrowLeft size={22} aria-hidden />
          </button>
        )}
        <div className="docview__title">
          <h2 className="t-title">{docLabel(doc)}</h2>
          <StatusLine severity={status.severity}>
            {status.label}
            {status.dateText && <span className="status__date"> · {status.dateText}</span>}
          </StatusLine>
        </div>
        <button type="button" className="icon-btn" aria-label="Edit document details" onClick={() => sheet.open('document-edit', { v: doc.vehicle_id, id: doc.id })}>
          <PencilSimple size={20} aria-hidden />
        </button>
      </header>

      <div className="docview__actions">
        <Button variant="primary" busy={busy === 'share'} onClick={() => run('share', async () => { if ((await shareDocument(api, doc, docLabel(doc))) === 'downloaded') toast('Saved to your device.'); })}>
          <ShareNetwork size={18} aria-hidden /> Share
        </Button>
        <Button variant="secondary" busy={busy === 'download'} onClick={() => run('download', () => downloadDocument(api, doc))}>
          <DownloadSimple size={18} aria-hidden /> Download
        </Button>
        <Button variant="secondary" onClick={() => run('open', () => openDocument(api, doc))}>
          <ArrowSquareOut size={18} aria-hidden /> Open
        </Button>
      </div>

      <div className="docview__paper">
        {!url ? (
          <div className="docview__wait"><Spinner label="Opening document" /></div>
        ) : pdf ? (
          <PdfPages url={url} />
        ) : (
          <>
            <div className={`docview__scroll${zoomed ? ' is-zoomed' : ''}`}>
              <img src={url} alt={`${docLabel(doc)}, uploaded ${formatDate(doc.created_at.slice(0, 10))}`} className="docview__img" decoding="async" />
            </div>
            <Button variant="secondary" className="docview__zoom" onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed}>
              {zoomed ? <MagnifyingGlassMinus size={18} aria-hidden /> : <MagnifyingGlassPlus size={18} aria-hidden />} {zoomed ? 'Fit to screen' : 'Zoom in'}
            </Button>
          </>
        )}
      </div>

      <section className="docview__details" aria-label="Details">
        <h3 className="t-title">Details</h3>
        <dl className="details__list">
          {fields.filter((f) => f[1]).map(([k, v, key]) => (
            <div key={k} className="details__row details__row--prov">
              <dt>{k}</dt>
              <dd>
                {v}
                <span className="prov">{src(key)}</span>
              </dd>
            </div>
          ))}
          <div className="details__row">
            <dt>Uploaded</dt>
            <dd>{formatDate(doc.created_at.slice(0, 10))}, {formatBytes(doc.size_bytes)}</dd>
          </div>
        </dl>
        {!doc.issued_on && !doc.expires_on && doc.doc_type !== 'rc' && <Notice>No dates yet. Add the expiry date and the Pit Board will watch it for you.</Notice>}
      </section>
    </article>
  );
}
