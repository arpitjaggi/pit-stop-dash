import { useMemo, useState } from 'react';
import { useGarage, useAddReading, useReadings } from '@/data/hooks';
import { todayISO, formatDate } from '@/lib/dates';
import { formatKm, formatNumber, parseNumber } from '@/lib/format';
import { Button, Field, Input } from '@/ui/atoms';
import { rememberVehicle, useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle } from './common';

export function ReadingSheet() {
  const { vehicles } = useGarage();
  const v = useActiveVehicle(vehicles);
  if (!v) return null;
  return <ReadingForm vehicleId={v.id} />;
}

function ReadingForm({ vehicleId }: { vehicleId: string }) {
  const { vehicles } = useGarage();
  const v = vehicles.find((x) => x.id === vehicleId)!;
  const sheet = useSheet();
  const toast = useToast();
  const add = useAddReading();
  const { data: readings = [] } = useReadings(vehicleId);
  const today = todayISO();
  const [raw, setRaw] = useState('');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const km = parseNumber(raw);

  // A reading may not run backwards: not below an earlier one, not above a later one.
  const problem = useMemo(() => {
    if (km == null) return null;
    const before = readings.filter((r) => r.read_on <= date).sort((a, b) => b.reading_km - a.reading_km)[0];
    const after = readings.filter((r) => r.read_on > date).sort((a, b) => a.reading_km - b.reading_km)[0];
    if (before && km < before.reading_km) return `That is lower than ${formatKm(before.reading_km)}, logged on ${formatDate(before.read_on)}.`;
    if (after && km > after.reading_km) return `That is higher than ${formatKm(after.reading_km)}, logged on ${formatDate(after.read_on)}.`;
    return null;
  }, [km, date, readings]);

  const delta = km != null && v.current_odometer_km != null && date >= (v.odometer_read_on ?? '') ? km - v.current_odometer_km : null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (km == null) return setError('Enter the number on the odometer.');
    if (problem) return setError(problem);
    setError(null);
    rememberVehicle(vehicleId);
    try {
      await add.mutateAsync({ vehicle_id: vehicleId, read_on: date, reading_km: km, note: note.trim() || null });
      toast(`Logged. ${formatKm(km)}.`);
      sheet.close();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Sheet
      title="Odometer reading"
      footer={
        <Button variant="primary" block type="submit" form="reading-form" busy={add.isPending}>
          Save reading
        </Button>
      }
    >
      <form id="reading-form" className="stack" onSubmit={save} noValidate>
        <p className="t-ink-2">{v.make} {v.model}</p>
        <Field label="Odometer (km)" error={error ?? problem} hint={delta != null && delta >= 0 && !problem ? `${delta === 0 ? 'No change' : `+${formatNumber(delta)} km`} since the last reading.` : undefined}>
          {(p) => (
            <Input
              {...p}
              className="input--figure"
              inputMode="numeric"
              enterKeyHint="done"
              autoComplete="off"
              data-autofocus
              placeholder={v.current_odometer_km != null ? formatNumber(v.current_odometer_km) : 'e.g. 45,210'}
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setError(null);
              }}
            />
          )}
        </Field>
        <Field label="Date">{(p) => <Input {...p} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value || today)} />}</Field>
        {showNote ? (
          <Field label="Note or source">{(p) => <Input {...p} placeholder="At the petrol pump" value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
        ) : (
          <Button variant="ghost" className="btn--inline" onClick={() => setShowNote(true)}>
            Add a note
          </Button>
        )}
      </form>
    </Sheet>
  );
}
