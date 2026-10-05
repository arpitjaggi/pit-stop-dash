import { useState } from 'react';
import { useGarage, useUpdateVehicle } from '@/data/hooks';
import { parseNumber } from '@/lib/format';
import { Button, Field, Input, Notice, friendlyError } from '@/ui/atoms';
import { useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle } from './common';

/** Service intervals belong to each vehicle: a car and a bike rarely share one. */
export function IntervalSheet() {
  const { vehicles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const update = useUpdateVehicle();
  const sheet = useSheet();
  const toast = useToast();
  const [km, setKm] = useState(v?.service_interval_km != null ? String(v.service_interval_km) : '');
  const [months, setMonths] = useState(v?.service_interval_months != null ? String(v.service_interval_months) : '');
  const [error, setError] = useState<string | null>(null);
  if (!v) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({ id: v!.id, patch: { service_interval_km: parseNumber(km), service_interval_months: parseNumber(months) } });
      toast('Service interval saved.');
      sheet.close();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <Sheet
      title="Service interval"
      footer={<Button variant="primary" block type="submit" form="interval-form" busy={update.isPending}>Save</Button>}
    >
      <form id="interval-form" className="stack" onSubmit={save}>
        <p className="t-ink-2">How often does the {v.make} {v.model} need servicing? Use whatever its service schedule says. Leave one blank to go by the other alone.</p>
        <Field label="Every (km)">{(p) => <Input {...p} inputMode="numeric" placeholder="10,000" value={km} onChange={(e) => setKm(e.target.value)} />}</Field>
        <Field label="or every (months)" hint="Whichever comes first.">{(p) => <Input {...p} inputMode="numeric" placeholder="12" value={months} onChange={(e) => setMonths(e.target.value)} />}</Field>
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Sheet>
  );
}
