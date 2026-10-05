import { useMemo } from 'react';
import { useAddReading, useDeleteReading, useReadings } from '@/data/hooks';
import type { Reading } from '@/data/types';
import { ago, diffDays, formatDate, todayISO } from '@/lib/dates';
import { formatNumber } from '@/lib/format';
import { isReadingStale } from '@/lib/status';
import { Button, EmptyState, Notice, Spinner } from '@/ui/atoms';
import { Plus, Trash } from '@/ui/icons';
import { useSheet, useToast } from '@/ui/hooks';
import { useVehicleBundle } from './useVehicleBundle';

export function OdometerTab() {
  const { vehicle: v } = useVehicleBundle();
  const sheet = useSheet();
  const toast = useToast();
  const readings = useReadings(v.id);
  const del = useDeleteReading();
  const add = useAddReading();
  const today = todayISO();
  const stale = isReadingStale(v, today);

  // Each row shows how far the vehicle travelled since the reading before it.
  const rows = useMemo(() => {
    const list = readings.data ?? [];
    return list.map((r, i) => {
      const prev = list[i + 1];
      return { r, delta: prev ? r.reading_km - prev.reading_km : null, days: prev ? diffDays(r.read_on, prev.read_on) : null };
    });
  }, [readings.data]);

  function remove(r: Reading) {
    del.mutate({ id: r.id, vehicleId: v.id });
    toast('Reading removed.', {
      undo: () => add.mutate({ vehicle_id: r.vehicle_id, read_on: r.read_on, reading_km: r.reading_km, note: r.note, source: r.source }),
    });
  }

  return (
    <div className="odo">
      <section className="odo__now">
        <h2 className="t-section">Odometer</h2>
        {v.current_odometer_km != null ? (
          <p className="odo__figure">
            <span className="fig fig-xl">{formatNumber(v.current_odometer_km)}</span>
            <span className="fig-unit odo__unit">km</span>
          </p>
        ) : (
          <p className="t-body t-ink-2">No reading yet.</p>
        )}
        {v.odometer_read_on && <p className="t-ink-2">As of {formatDate(v.odometer_read_on)}, {ago(v.odometer_read_on, today)}.</p>}
        {stale && <Notice>This reading is a few weeks old, so distances to service are estimates. A fresh one keeps them honest.</Notice>}
        <Button variant="primary" onClick={() => sheet.open('reading', { v: v.id })}>
          <Plus size={18} aria-hidden /> Add reading
        </Button>
      </section>

      <section className="block">
        <h2 className="t-section">History</h2>
        {readings.isPending ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState title="No readings yet." body="Log the number on the dash whenever you think of it, at the petrol pump is a good moment." />
        ) : (
          <ul className="rows odo__rows">
            {rows.map(({ r, delta, days }) => (
              <li key={r.id} className="odo__row">
                <div className="odo__rowmain">
                  <p className="t-title">{formatDate(r.read_on)}</p>
                  <p className="t-ink-3 odo__meta">
                    {delta != null && delta >= 0 && days != null ? `+${formatNumber(delta)} km in ${days === 0 ? 'the same day' : days === 1 ? '1 day' : `${days} days`}` : 'First reading'}
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <span className="odo__value">
                  <span className="fig fig-s">{formatNumber(r.reading_km)}</span>
                  <span className="fig-unit">km</span>
                </span>
                <button type="button" className="icon-btn odo__del" aria-label={`Remove reading of ${formatNumber(r.reading_km)} km on ${formatDate(r.read_on)}`} onClick={() => remove(r)}>
                  <Trash size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
