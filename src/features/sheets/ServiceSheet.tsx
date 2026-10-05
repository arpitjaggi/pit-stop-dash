import { useMemo, useState } from 'react';
import { useDeleteService, useGarage, useSaveService, useUpdateService } from '@/data/hooks';
import { formatDate, todayISO } from '@/lib/dates';
import { formatNumber, parseNumber } from '@/lib/format';
import { openIssues } from '@/lib/status';
import { Button, Choice, Field, Input, Notice, TextArea, friendlyError } from '@/ui/atoms';
import { rememberVehicle, useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle } from './common';

const TYPES = ['Regular service', 'Oil change', 'Repair', 'Inspection', 'Other'];

export function ServiceSheet({ editing }: { editing?: boolean }) {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const sheet = useSheet();
  const toast = useToast();
  const save = useSaveService();
  const update = useUpdateService();
  const del = useDeleteService();
  const bundle = v ? bundles.get(v.id) : undefined;
  const existing = editing ? bundle?.services.find((s) => s.id === sheet.id) : undefined;
  const today = todayISO();

  const [date, setDate] = useState(existing?.serviced_on ?? today);
  const [workshop, setWorkshop] = useState(existing?.workshop ?? '');
  const [odo, setOdo] = useState(existing?.odometer_km != null ? String(existing.odometer_km) : v?.current_odometer_km != null && !editing ? formatNumber(v.current_odometer_km) : '');
  const initialType = existing?.service_type ?? 'Regular service';
  const [type, setType] = useState(TYPES.includes(initialType) ? initialType : 'Other');
  const [custom, setCustom] = useState(TYPES.includes(initialType) ? '' : initialType);
  const [work, setWork] = useState(existing?.work_performed ?? '');
  const [cost, setCost] = useState(existing?.cost_inr != null ? String(existing.cost_inr) : '');
  const [found, setFound] = useState(existing?.problems_found ?? '');
  const [carry, setCarry] = useState(existing?.carry_forward ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const open = useMemo(() => openIssues(bundle?.issues ?? []), [bundle?.issues]);
  const pastWorkshops = useMemo(() => [...new Set((bundle?.services ?? []).map((s) => s.workshop).filter(Boolean) as string[])], [bundle?.services]);
  if (!v) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const kmVal = parseNumber(odo);
    const serviceType = type === 'Other' ? custom.trim() || 'Other' : type;
    const fields = {
      serviced_on: date,
      workshop: workshop.trim() || null,
      odometer_km: kmVal,
      service_type: serviceType,
      work_performed: work.trim() || null,
      cost_inr: parseNumber(cost),
      problems_found: found.trim() || null,
      carry_forward: carry.trim() || null,
      notes: notes.trim() || null,
    };
    rememberVehicle(v!.id);
    try {
      if (existing) {
        await update.mutateAsync({ id: existing.id, patch: fields });
        toast('Saved.');
      } else {
        await save.mutateAsync({ record: { vehicle_id: v!.id, ...fields }, resolveIssueIds: [...fixed] });
        toast('Logged in the logbook.');
      }
      sheet.close();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  const toggle = (id: string) => setFixed((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <Sheet
      title={existing ? 'Edit service record' : 'Log a service'}
      tall
      footer={
        <>
          <Button variant="primary" block type="submit" form="service-form" busy={save.isPending || update.isPending}>
            {existing ? 'Save changes' : 'Save service record'}
          </Button>
          {existing && (
            <Button variant="ghost" block onClick={async () => { await del.mutateAsync(existing.id); toast('Service record removed.'); sheet.close(); }}>
              Remove this record
            </Button>
          )}
        </>
      }
    >
      <form id="service-form" className="stack" onSubmit={submit} noValidate>
        <p className="t-ink-2">{v.make} {v.model}</p>
        <div className="field-row">
          <Field label="Date">{(p) => <Input {...p} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value || today)} />}</Field>
          <Field label="Odometer (km)">{(p) => <Input {...p} inputMode="numeric" value={odo} onChange={(e) => setOdo(e.target.value)} />}</Field>
        </div>
        <Field label="Workshop or service centre">
          {(p) => (
            <>
              <Input {...p} list="workshops" autoComplete="off" placeholder="Where was it done?" value={workshop} onChange={(e) => setWorkshop(e.target.value)} />
              <datalist id="workshops">{pastWorkshops.map((w) => <option key={w} value={w} />)}</datalist>
            </>
          )}
        </Field>
        <Choice legend="What kind of service?" value={type} onChange={setType} options={TYPES.map((t) => ({ value: t, label: t }))} />
        {type === 'Other' && <Field label="Describe it">{(p) => <Input {...p} value={custom} onChange={(e) => setCustom(e.target.value)} />}</Field>}
        <Field label="Work performed">{(p) => <TextArea {...p} rows={3} placeholder="Engine oil and filter, air filter, wheel alignment" value={work} onChange={(e) => setWork(e.target.value)} />}</Field>
        <Field label="Cost in ₹ (optional)">{(p) => <Input {...p} inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} />}</Field>

        {!existing && open.length > 0 && (
          <fieldset className="choice">
            <legend className="field__label">Did they sort any of your open issues?</legend>
            <ul className="checklist">
              {open.map((i) => (
                <li key={i.id}>
                  <label className="check">
                    <input type="checkbox" checked={fixed.has(i.id)} onChange={() => toggle(i.id)} />
                    <span>{i.description} <span className="t-ink-3">(noticed {formatDate(i.added_on)})</span></span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        <Field label="Problems the workshop found">{(p) => <TextArea {...p} rows={2} value={found} onChange={(e) => setFound(e.target.value)} />}</Field>
        <Field label="To address next time" hint={existing ? 'Editing this does not change your issues list.' : 'One per line. Each line is added to your issues, so it is on the list for the next visit.'}>
          {(p) => <TextArea {...p} rows={2} placeholder="Check front brake pads" value={carry} onChange={(e) => setCarry(e.target.value)} />}
        </Field>
        <Field label="Notes">{(p) => <TextArea {...p} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Sheet>
  );
}
