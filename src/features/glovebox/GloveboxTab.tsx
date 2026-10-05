import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSignedUrl } from '@/data/hooks';
import { DOC_TYPES, type VDocument } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { isPdf } from '@/lib/image';
import { docLabel, documentStatus, splitCurrentAndHistory } from '@/lib/status';
import { Button, EmptyState, StatusLine } from '@/ui/atoms';
import { CaretRight, UploadSimple } from '@/ui/icons';
import { useDesktop, useSheet } from '@/ui/hooks';
import { useVehicleBundle } from '../vehicle/useVehicleBundle';
import { DocViewer } from './DocViewer';

export function GloveboxTab() {
  const { vehicle: v, documents } = useVehicleBundle();
  const { docId } = useParams();
  const navigate = useNavigate();
  const sheet = useSheet();
  const desktop = useDesktop();
  const today = todayISO();
  const { current, history } = splitCurrentAndHistory(documents, today);
  const selected = documents.find((d) => d.id === docId) ?? null;
  // On desktop the first document opens beside the list; on a phone it opens full screen on tap.
  const pane = desktop ? selected ?? current[0] ?? null : null;
  const upload = () => sheet.open('document', { v: v.id });

  const close = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(`/vehicles/${v.id}/glovebox`, { replace: true });
  };

  return (
    <div className={`glovebox${desktop ? ' glovebox--split' : ''}`}>
      <div className="glovebox__list">
        <div className="sectionhead">
          <h2 className="t-section">Glovebox</h2>
          {documents.length > 0 && (
            <Button variant="secondary" className="desktop-only" onClick={upload}>
              <UploadSimple size={18} aria-hidden /> Upload
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <EmptyState
            title="Nothing in the Glovebox yet."
            body="Keep the RC, insurance and PUC here, with their dates, so the right one is always one tap away."
            action={
              <Button variant="primary" onClick={upload}>
                <UploadSimple size={18} aria-hidden /> Upload a document
              </Button>
            }
          />
        ) : (
          <>
            <ul className="docs">
              {current.map((d) => (
                <li key={d.id}>
                  <DocRow doc={d} active={pane?.id === d.id} today={today} to={`/vehicles/${v.id}/glovebox/${d.id}`} />
                </li>
              ))}
            </ul>
            {history.length > 0 && (
              <details className="history">
                <summary className="t-title">History ({history.length})</summary>
                <ul className="docs">
                  {history.map((d) => (
                    <li key={d.id}>
                      <DocRow doc={d} active={pane?.id === d.id} today={today} to={`/vehicles/${v.id}/glovebox/${d.id}`} quiet />
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </div>

      {desktop && pane && (
        <div className="glovebox__pane">
          <DocViewer key={pane.id} doc={pane} />
        </div>
      )}
      {!desktop && selected && (
        <div className="docview-screen">
          <DocViewer key={selected.id} doc={selected} onClose={close} />
        </div>
      )}
      {!desktop && docId && !selected && (
        <div className="docview-screen">
          <EmptyState title="That document is not here any more." action={<Link className="btn btn--primary" to={`/vehicles/${v.id}/glovebox`} replace>Back to the Glovebox</Link>} />
        </div>
      )}
    </div>
  );
}

function DocRow({ doc, active, today, to, quiet }: { doc: VDocument; active: boolean; today: string; to: string; quiet?: boolean }) {
  const status = documentStatus(doc, today);
  const secondary = [doc.issuer, doc.reference_number].filter(Boolean).join(' · ');
  return (
    <Link to={to} className={`docrow${active ? ' is-active' : ''}${quiet ? ' docrow--quiet' : ''}`} aria-current={active ? 'true' : undefined}>
      <DocThumb doc={doc} />
      <span className="docrow__text">
        <span className="t-title docrow__title">{docLabel(doc)}</span>
        <StatusLine severity={status.severity} className="docrow__status">
          {status.label}
          {status.dateText && <span className="status__date"> · {status.dateText}</span>}
        </StatusLine>
        {secondary && <span className="docrow__meta t-ink-3">{secondary}</span>}
      </span>
      <CaretRight size={16} aria-hidden className="row__go" />
    </Link>
  );
}

/** A small paper-like preview: the first page for photos, a monogram for PDFs. */
function DocThumb({ doc }: { doc: VDocument }) {
  const pdf = isPdf({ type: doc.mime_type, name: doc.file_name });
  const url = useSignedUrl('documents', pdf ? null : doc.thumb_path ?? doc.file_path);
  const short = DOC_TYPES.find((t) => t.value === doc.doc_type)?.short ?? 'DOC';
  return (
    <span className="docthumb" aria-hidden="true">
      {url ? <img src={url} alt="" loading="lazy" decoding="async" /> : <span className="docthumb__mono fig">{short}</span>}
    </span>
  );
}
