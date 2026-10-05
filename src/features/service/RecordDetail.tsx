import type { ServiceRecord } from '@/data/types';
import { formatDate } from '@/lib/dates';
import { formatInr, formatKm } from '@/lib/format';
import { Button } from '@/ui/atoms';
import { PencilSimple } from '@/ui/icons';
import { useSheet } from '@/ui/hooks';

/** One logbook entry in full. */
export function RecordDetail({ record }: { record: ServiceRecord }) {
  const sheet = useSheet();
  const lines = (s: string | null) => (s ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  const carry = lines(record.carry_forward);
  const block = (title: string, body: string | null) =>
    body?.trim() ? (
      <div className="record__block">
        <h3 className="t-title">{title}</h3>
        <p className="record__text">{body}</p>
      </div>
    ) : null;

  return (
    <article className="record" aria-label={`Service on ${formatDate(record.serviced_on)}`}>
      <header className="record__head">
        <div>
          <h2 className="t-section">{formatDate(record.serviced_on)}</h2>
          <p className="t-ink-2">{record.service_type}{record.workshop ? ` at ${record.workshop}` : ''}</p>
        </div>
        <Button variant="secondary" onClick={() => sheet.open('service-edit', { v: record.vehicle_id, id: record.id })}>
          <PencilSimple size={16} aria-hidden /> Edit
        </Button>
      </header>
      <dl className="details__list">
        {record.odometer_km != null && (
          <div className="details__row"><dt>Odometer</dt><dd><span className="fig fig-s">{formatKm(record.odometer_km)}</span></dd></div>
        )}
        {record.cost_inr != null && <div className="details__row"><dt>Cost</dt><dd>{formatInr(record.cost_inr)}</dd></div>}
      </dl>
      {block('Work done', record.work_performed)}
      {block('Problems found', record.problems_found)}
      {carry.length > 0 && (
        <div className="record__block">
          <h3 className="t-title">To address next time</h3>
          <ul className="record__list">{carry.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      )}
      {block('Notes', record.notes)}
    </article>
  );
}
