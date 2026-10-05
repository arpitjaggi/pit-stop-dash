import { useEffect, useState } from 'react';
import { ago, formatDate, formatDateShort, todayISO } from '@/lib/dates';
import { formatInr, formatKm, formatNumber } from '@/lib/format';
import { openIssues, serviceSchedule, serviceSentence } from '@/lib/status';
import type { ServiceRecord } from '@/data/types';
import { Button, EmptyState, StatusLine } from '@/ui/atoms';
import { ListChecks, Plus } from '@/ui/icons';
import { useDesktop, useSheet } from '@/ui/hooks';
import { useVehicleBundle } from '../vehicle/useVehicleBundle';
import { RecordDetail } from './RecordDetail';

export function ServiceTab() {
  const bundle = useVehicleBundle();
  const { vehicle: v, services } = bundle;
  const sheet = useSheet();
  const desktop = useDesktop();
  const today = todayISO();
  const sched = serviceSchedule(v, services, today);
  const open = openIssues(bundle.issues);
  const sorted = [...services].sort((a, b) => (a.serviced_on !== b.serviced_on ? (a.serviced_on < b.serviced_on ? 1 : -1) : a.created_at < b.created_at ? 1 : -1));
  const [sel, setSel] = useState<string | null>(null);
  const selected = sorted.find((s) => s.id === sel) ?? (desktop ? sorted[0] : undefined);

  useEffect(() => {
    if (sel && !sorted.some((s) => s.id === sel)) setSel(null);
  }, [sel, sorted]);

  const sentence = serviceSentence(sched);
  const winkable = sched.state === 'ok' && (sched.nextKm != null || sched.nextDate);
  const intervalText = [v.service_interval_km ? formatKm(v.service_interval_km) : null, v.service_interval_months ? `${v.service_interval_months} months` : null].filter(Boolean).join(' or ');

  return (
    <div className="service">
      <div className="sectionhead">
        <h2 className="t-section">Service</h2>
        <Button variant={desktop ? 'secondary' : 'ghost'} onClick={() => sheet.open('service', { v: v.id })}>
          <Plus size={18} aria-hidden /> Log a service
        </Button>
      </div>

      <div className="svc-summary">
        <section className="svc-summary__col" aria-labelledby="last-service">
          <h3 id="last-service" className="t-title">Last service</h3>
          {sched.last ? (
            <>
              <p className="svc-summary__big">{formatDate(sched.last.serviced_on)}</p>
              <p className="t-ink-2">{ago(sched.last.serviced_on, today)}{sched.last.workshop ? `, at ${sched.last.workshop}` : ''}</p>
              {sched.last.odometer_km != null && (
                <p className="svc-summary__fig"><span className="fig fig-m">{formatNumber(sched.last.odometer_km)}</span><span className="fig-unit">km</span></p>
              )}
            </>
          ) : (
            <p className="t-ink-2">No service logged yet. Add the last one you remember and the next one gets worked out for you.</p>
          )}
        </section>

        <section className="svc-summary__col" aria-labelledby="next-service">
          <h3 id="next-service" className="t-title">Next service</h3>
          {sched.state === 'unknown' ? (
            <p className="t-ink-2">{intervalText ? 'Appears once a service is logged.' : 'Set a service interval for this vehicle to see it here.'}</p>
          ) : (
            <>
              <dl className="svc-next">
                {sched.nextKm != null && (
                  <div>
                    <dt className="t-label t-ink-2">At</dt>
                    <dd><span className="fig fig-m">{formatNumber(sched.nextKm)}</span><span className="fig-unit">km</span></dd>
                  </div>
                )}
                {sched.nextDate && (
                  <div>
                    <dt className="t-label t-ink-2">{sched.nextKm != null ? 'or by' : 'By'}</dt>
                    <dd className="svc-next__date">{formatDate(sched.nextDate)}</dd>
                  </div>
                )}
              </dl>
              {sentence && (
                <StatusLine severity={sched.state === 'overdue' ? 'overdue' : sched.state === 'soon' ? 'soon' : 'clear'} as="p" className="svc-summary__status">
                  {sched.state === 'ok' && winkable ? (sched.nextKm != null ? `Pit window opens at ${formatKm(sched.nextKm)}.` : `Pit window opens ${formatDate(sched.nextDate as string)}.`) : sentence}
                </StatusLine>
              )}
              {sched.state === 'ok' && (
                <p className="t-ink-3">
                  {sched.kmRemaining != null
                    ? `${formatKm(sched.kmRemaining)} to go${sched.stale && sched.readingOn ? `, going by your reading from ${formatDateShort(sched.readingOn)}` : ''}.`
                    : sched.daysRemaining != null
                      ? `${sched.daysRemaining} days to go.`
                      : null}
                </p>
              )}
              {sched.binding === 'km' && sched.stale && (
                <Button variant="secondary" onClick={() => sheet.open('reading', { v: v.id })}>Update odometer</Button>
              )}
            </>
          )}
          <button type="button" className="linkbtn" onClick={() => sheet.open('interval', { v: v.id })}>
            {intervalText ? `Every ${intervalText}. Change` : 'Set the service interval'}
          </button>
        </section>
      </div>

      <section className="block workshop-block" aria-labelledby="tell-workshop">
        <div className="issues__head">
          <h3 id="tell-workshop" className="t-section">Tell the workshop</h3>
          {open.length > 0 && (
            <Button variant="secondary" onClick={() => sheet.open('workshop', { v: v.id })}>
              <ListChecks size={18} aria-hidden /> Open the list
            </Button>
          )}
        </div>
        {open.length === 0 ? (
          <p className="t-ink-2">Nothing on the list. Issues you add will show up here, ready for the next visit.</p>
        ) : (
          <ul className="rows">
            {open.slice(0, 4).map((i) => (
              <li key={i.id} className="workshop-block__item">{i.description}</li>
            ))}
            {open.length > 4 && <li className="t-ink-3 workshop-block__item">and {open.length - 4} more</li>}
          </ul>
        )}
        <button type="button" className="linkbtn" onClick={() => sheet.open('issue', { v: v.id })}>Add an issue</button>
      </section>

      <section className="logbook-wrap">
        <h3 className="t-section">Logbook</h3>
        {sorted.length === 0 ? (
          <EmptyState title="The logbook is empty." body="Add a service and it will sit here in order, with where it was done and what was done." />
        ) : (
          <div className="logbook-split">
            <ol className="logbook" aria-label="Service history">
              {sorted.map((s) => (
                <li key={s.id}>
                  <LogEntry record={s} active={desktop && selected?.id === s.id} onOpen={() => (desktop ? setSel(s.id) : sheet.open('record', { v: v.id, id: s.id }))} />
                </li>
              ))}
            </ol>
            {desktop && selected && <div className="logbook-split__detail"><RecordDetail key={selected.id} record={selected} /></div>}
          </div>
        )}
      </section>
    </div>
  );
}

function LogEntry({ record: s, active, onOpen }: { record: ServiceRecord; active: boolean; onOpen: () => void }) {
  const carry = (s.carry_forward ?? '').split('\n').filter((l) => l.trim()).length;
  return (
    <button type="button" className={`logentry${active ? ' is-active' : ''}`} onClick={onOpen} aria-current={active ? 'true' : undefined}>
      <span className="logentry__margin">
        {s.odometer_km != null ? <span className="fig fig-s">{formatNumber(s.odometer_km)}</span> : <span className="t-ink-3">-</span>}
        <span className="logentry__date t-label t-ink-3">{formatDate(s.serviced_on)}</span>
      </span>
      <span className="logentry__node" aria-hidden="true" />
      <span className="logentry__body">
        <span className="t-title">{s.workshop || s.service_type}</span>
        <span className="logentry__type t-ink-2">{s.workshop ? s.service_type : ''}{s.cost_inr != null ? `${s.workshop ? ' · ' : ''}${formatInr(s.cost_inr)}` : ''}</span>
        {s.work_performed && <span className="logentry__work t-ink-2">{s.work_performed}</span>}
        {s.problems_found && <span className="logentry__found">Found: {s.problems_found}</span>}
        {carry > 0 && <span className="t-ink-3 logentry__carry">{carry} {carry === 1 ? 'thing' : 'things'} raised for next time</span>}
      </span>
    </button>
  );
}
