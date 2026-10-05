import { Link } from 'react-router-dom';
import { docTypeLabel } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { pitBoard, upcomingItems } from '@/lib/status';
import { StatusLine } from '@/ui/atoms';
import { CaretRight, UploadSimple } from '@/ui/icons';
import { useSheet } from '@/ui/hooks';
import { VehicleDetails } from './VehicleDetails';
import { useVehicleBundle } from './useVehicleBundle';

export function OverviewTab() {
  const bundle = useVehicleBundle();
  const sheet = useSheet();
  const today = todayISO();
  const board = pitBoard(bundle, today);
  const upcoming = upcomingItems(bundle, today);
  const rest = board.items.slice(1);

  const wanted = (['rc', 'insurance', 'puc'] as const).filter((t) => !(t === 'puc' && bundle.vehicle.fuel_type === 'electric'));
  const missing = wanted.filter((t) => !bundle.documents.some((d) => d.doc_type === t));

  return (
    <div className="overview">
      {rest.length > 0 && (
        <section className="block">
          <h2 className="t-section">Also on the list</h2>
          <ul className="rows">
            {rest.map((i) => (
              <li key={i.id}>
                <Link to={i.docId ? `glovebox/${i.docId}` : i.tab} className="row">
                  <StatusLine severity={i.severity}>{i.sentence}</StatusLine>
                  <CaretRight size={16} aria-hidden className="row__go" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="block">
          <h2 className="t-section">Coming up</h2>
          <ul className="rows">
            {upcoming.map((u) => (
              <li key={u.id}>
                <Link to={u.tab === 'glovebox' ? `glovebox/${u.id}` : u.tab} className="row row--split">
                  <span className="t-title">{u.title}</span>
                  <span className="row__detail">{u.detail}</span>
                  <CaretRight size={16} aria-hidden className="row__go" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {missing.length > 0 && (
        <section className="block">
          <h2 className="t-section">Finish setting up</h2>
          <p className="t-ink-2 block__lede">Put the paperwork in the Glovebox and the Pit Board can start watching the dates for you.</p>
          <ul className="rows">
            {missing.map((t) => (
              <li key={t}>
                <button type="button" className="row row--split row--button" onClick={() => sheet.open('document', { v: bundle.vehicle.id, id: t })}>
                  <span className="t-title">{docTypeLabel(t)}</span>
                  <span className="row__detail row__detail--action"><UploadSimple size={16} aria-hidden /> Upload</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="block block--narrow">
        <h2 className="t-section">Details</h2>
        <VehicleDetails bundle={bundle} />
      </section>
    </div>
  );
}
