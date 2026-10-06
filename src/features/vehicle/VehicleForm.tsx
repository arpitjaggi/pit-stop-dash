import { useEffect, useRef, useState } from 'react';
import type { PreparedImage } from '@/data/api';
import {
  FUEL_TYPES, VEHICLE_TYPES, defaultIntervals, isTwoWheeler,
  type FuelType, type NewVehicle, type Vehicle, type VehicleType,
} from '@/data/types';
import { todayISO } from '@/lib/dates';
import { formatNumber, parseNumber } from '@/lib/format';
import { PHOTO_SPEC, prepareImage } from '@/lib/image';
import { looksLikeRegistration, normaliseRegistration, validRegistrationShape } from '@/lib/plate';
import { Button, Choice, Field, Input, Notice, Plate, TextArea, cx } from '@/ui/atoms';
import { ArrowLeft, Camera, X } from '@/ui/icons';
import { useSignedUrl } from '@/data/hooks';

/** Popular Indian makes, as suggestions only. There is deliberately no vehicle database. */
const MAKES = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'Renault', 'Volkswagen', 'Skoda', 'MG', 'Nissan', 'Ford', 'Jeep',
  'Hero', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Ather', 'Ola Electric', 'Jawa', 'Kawasaki', 'Triumph', 'Harley-Davidson',
];

const SWATCHES = [
  { name: 'White', hex: '#ECE9E1' }, { name: 'Silver', hex: '#B8BDC2' }, { name: 'Grey', hex: '#6B7280' }, { name: 'Black', hex: '#1F1D1A' },
  { name: 'Red', hex: '#E5383B' }, { name: 'Orange', hex: '#F97316' }, { name: 'Yellow', hex: '#F5B800' }, { name: 'Green', hex: '#1F7A4D' },
  { name: 'Teal', hex: '#14B8A6' }, { name: 'Blue', hex: '#3B82F6' }, { name: 'Navy', hex: '#1E3A8A' }, { name: 'Brown', hex: '#8B5E3C' },
];

interface Values {
  type: VehicleType;
  make: string;
  model: string;
  variant: string;
  registration: string;
  fuel: FuelType;
  odometer: string;
  colour: { name: string; hex: string } | null;
  purchase: string;
  registered: string;
  engineCc: string;
  transmission: string;
  batteryKwh: string;
  cngInfo: string;
  wheels: string;
  notes: string;
  intervalKm: string;
  intervalMonths: string;
}

function initial(v?: Vehicle): Values {
  const t = v?.vehicle_type ?? 'car';
  const d = defaultIntervals(t);
  return {
    type: t,
    make: v?.make ?? '',
    model: v?.model ?? '',
    variant: v?.variant ?? '',
    registration: v?.registration_number ?? '',
    fuel: v?.fuel_type ?? 'petrol',
    odometer: v?.current_odometer_km != null ? String(v.current_odometer_km) : '',
    colour: v?.colour_hex ? { name: v.colour_name ?? '', hex: v.colour_hex } : null,
    purchase: v?.purchase_date ?? '',
    registered: v?.registration_date ?? '',
    engineCc: v?.engine_cc != null ? String(v.engine_cc) : '',
    transmission: v?.transmission ?? '',
    batteryKwh: v?.battery_kwh != null ? String(v.battery_kwh) : '',
    cngInfo: v?.cng_kit_info ?? '',
    wheels: v?.wheels != null ? String(v.wheels) : '',
    notes: v?.notes ?? '',
    intervalKm: v ? (v.service_interval_km != null ? String(v.service_interval_km) : '') : String(d.km),
    intervalMonths: v ? (v.service_interval_months != null ? String(v.service_interval_months) : '') : String(d.months),
  };
}

export interface VehicleSubmit {
  vehicle: NewVehicle;
  photo: PreparedImage | 'remove' | null;
}

interface Props {
  existing?: Vehicle;
  submitLabel: string;
  formId: string;
  busy: boolean;
  onSubmit: (v: VehicleSubmit) => void;
  serverError?: string | null;
  /** Adding walks through one segment at a time; editing stays a single form. */
  wizard?: boolean;
}

type ErrorKey = 'make' | 'model' | 'registration' | 'odometer';

/** The segments of the add flow. Only the first four hold anything required. */
const STEPS = [
  { title: 'What are you adding?', hint: 'Pick the closest one. You can change it later.' },
  { title: 'Which one is it?', hint: 'The make and model are enough. The variant is a bonus.' },
  { title: 'Registration and fuel', hint: 'Write the number as it appears on the plate.' },
  { title: 'Where it stands today', hint: 'The odometer starts your history. The service rhythm can be changed later.' },
  { title: 'Make it yours', hint: 'All optional. A photo or a colour makes it easy to spot in the garage.' },
] as const;
const STEP_ERRORS: ErrorKey[][] = [[], ['make', 'model'], ['registration'], ['odometer'], []];

/** One form for adding and editing. Only a few fields are required; the rest can wait. */
export function VehicleForm({ existing, submitLabel, formId, busy, onSubmit, serverError, wizard = false }: Props) {
  const editing = Boolean(existing);
  const [v, setV] = useState<Values>(() => initial(existing));
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const [photo, setPhoto] = useState<PreparedImage | 'remove' | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const existingUrl = useSignedUrl('photos', existing?.photo_path);
  const today = todayISO();
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((x) => ({ ...x, [k]: val }));

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const norm = normaliseRegistration(v.registration);
  const shown = photo === 'remove' ? null : preview ?? (photo ? null : existingUrl ?? null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const prepared = await prepareImage(file, PHOTO_SPEC);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared.thumb));
    } catch (e) {
      setPhotoError((e as Error).message);
    } finally {
      setPhotoBusy(false);
    }
  }

  function validate(): Partial<Record<ErrorKey, string>> {
    const next: Partial<Record<ErrorKey, string>> = {};
    if (!v.make.trim()) next.make = 'Which make is it?';
    if (!v.model.trim()) next.model = 'Which model is it?';
    if (norm && !validRegistrationShape(norm)) next.registration = 'That does not look like a registration number. Letters and digits only, 4 to 12 characters.';
    if (!editing && parseNumber(v.odometer) == null) next.odometer = 'Enter what the odometer shows now. A rough number is fine.';
    return next;
  }

  const last = STEPS.length - 1;

  function go(to: number) {
    setDir(to > step ? 'fwd' : 'back');
    setStep(to);
  }

  // Each new segment starts at the top, with its heading announced.
  useEffect(() => {
    if (!wizard) return;
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [step, wizard]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    if (wizard) {
      // Only the current segment has to be right to move on; the last one checks everything.
      const scope = step < last ? STEP_ERRORS[step] : (Object.keys(next) as ErrorKey[]);
      const hit = scope.filter((k) => next[k]);
      setErrors(Object.fromEntries(hit.map((k) => [k, next[k]])));
      if (hit.length) {
        const at = STEP_ERRORS.findIndex((keys) => keys.includes(hit[0]));
        if (at !== step) go(at);
        else document.getElementById(formId)?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      if (step < last) { go(step + 1); return; }
    } else {
      setErrors(next);
      if (Object.keys(next).length) {
        document.getElementById(formId)?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
    }
    const odo = parseNumber(v.odometer);
    const num = (s: string) => parseNumber(s);
    const vehicle: NewVehicle = {
      vehicle_type: v.type,
      make: v.make.trim(),
      model: v.model.trim(),
      variant: v.variant.trim() || null,
      registration_number: norm || null,
      registration_date: v.registered || null,
      purchase_date: v.purchase || null,
      fuel_type: v.fuel,
      colour_name: v.colour?.name ?? null,
      colour_hex: v.colour?.hex ?? null,
      notes: v.notes.trim() || null,
      engine_cc: num(v.engineCc),
      transmission: v.transmission.trim() || null,
      battery_kwh: num(v.batteryKwh),
      cng_kit_info: v.cngInfo.trim() || null,
      wheels: num(v.wheels),
      service_interval_km: num(v.intervalKm),
      service_interval_months: num(v.intervalMonths),
      odometer_km: editing ? null : odo,
    };
    onSubmit({ vehicle, photo });
  }

  const showBattery = v.fuel === 'electric' || v.fuel === 'hybrid';
  const showCng = v.fuel === 'cng' || v.fuel === 'petrol_cng';
  const showEngine = v.fuel !== 'electric';
  const showWheels = v.type === 'other' || v.type === 'other_two_wheeler';

  const typeBlock = (
    <Choice
      legend="What is it?"
      hideLegend={wizard}
      layout="grid"
      value={v.type}
      onChange={(t) => {
        setV((x) => {
          const d = defaultIntervals(t);
          const wasDefault = !existing && x.intervalKm === String(defaultIntervals(x.type).km) && x.intervalMonths === String(defaultIntervals(x.type).months);
          return { ...x, type: t, ...(wasDefault ? { intervalKm: String(d.km), intervalMonths: String(d.months) } : {}), wheels: isTwoWheeler(t) ? '2' : x.wheels };
        });
      }}
      options={VEHICLE_TYPES.map((t) => ({ value: t.value, label: t.label, hint: t.hint }))}
    />
  );

  const whichBlock = (
    <>
      <div className="field-row">
        <Field label="Make" error={errors.make}>
          {(p) => (
            <>
              <Input {...p} list="makes" autoComplete="off" autoCapitalize="words" placeholder="Maruti Suzuki" value={v.make} aria-invalid={Boolean(errors.make) || undefined} onChange={(e) => set('make', e.target.value)} />
              <datalist id="makes">{MAKES.map((m) => <option key={m} value={m} />)}</datalist>
            </>
          )}
        </Field>
        <Field label="Model" error={errors.model}>
          {(p) => <Input {...p} autoComplete="off" autoCapitalize="words" placeholder="Swift" value={v.model} aria-invalid={Boolean(errors.model) || undefined} onChange={(e) => set('model', e.target.value)} />}
        </Field>
      </div>
      <Field label="Variant (optional)">{(p) => <Input {...p} autoComplete="off" autoCapitalize="words" placeholder="VXi" value={v.variant} onChange={(e) => set('variant', e.target.value)} />}</Field>
    </>
  );

  const registrationBlock = (
    <>
      <Field
        label="Registration number"
        error={errors.registration}
        hint={!norm ? 'Leave blank if it has not been registered yet. You can add it later.' : !looksLikeRegistration(norm) ? 'This is not the usual format, but you can still save it.' : undefined}
      >
        {(p) => (
          <Input
            {...p}
            className="input--plate"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="KA 01 AB 1234"
            value={v.registration}
            aria-invalid={Boolean(errors.registration) || undefined}
            onChange={(e) => set('registration', e.target.value.toUpperCase())}
          />
        )}
      </Field>
      {norm && validRegistrationShape(norm) && <Plate value={norm} size="md" />}
    </>
  );

  const fuelBlock = <Choice legend="Fuel" value={v.fuel} onChange={(f) => set('fuel', f)} options={FUEL_TYPES.map((f) => ({ value: f.value, label: f.label }))} />;

  const odometerBlock = (
    <Field label="Odometer now (km)" error={errors.odometer} hint="This becomes your first reading.">
      {(p) => (
        <Input
          {...p}
          className="input--figure"
          inputMode="numeric"
          autoComplete="off"
          placeholder="45,210"
          value={v.odometer}
          aria-invalid={Boolean(errors.odometer) || undefined}
          onChange={(e) => set('odometer', e.target.value)}
          onBlur={() => {
            const n = parseNumber(v.odometer);
            if (n != null) set('odometer', formatNumber(n));
          }}
        />
      )}
    </Field>
  );

  const intervalBlock = (
    <div className="field-row">
      <Field label="Service every (km)" hint="Set per vehicle.">{(p) => <Input {...p} inputMode="numeric" value={v.intervalKm} onChange={(e) => set('intervalKm', e.target.value)} />}</Field>
      <Field label="or every (months)" hint="Whichever comes first.">{(p) => <Input {...p} inputMode="numeric" value={v.intervalMonths} onChange={(e) => set('intervalMonths', e.target.value)} />}</Field>
    </div>
  );

  const photoBlock = (
    <>
      <div className="vform__photo">
        <div className={cx('vform__preview', shown && 'has-image')}>
          {shown ? <img src={shown} alt="Vehicle photo preview" /> : <Camera size={28} aria-hidden />}
        </div>
        <div className="stack stack--tight">
          <Button variant="secondary" busy={photoBusy} onClick={() => fileRef.current?.click()}>
            <Camera size={18} aria-hidden /> {shown ? 'Change photo' : 'Add a photo'}
          </Button>
          {shown && (
            <Button variant="ghost" className="btn--inline" onClick={() => { setPhoto('remove'); setPreview(null); }}>
              <X size={16} aria-hidden /> Remove photo
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
      </div>
      {photoError && <Notice tone="error">{photoError}</Notice>}
    </>
  );

  const colourBlock = (
    <fieldset className="choice">
      <legend className="field__label">Colour</legend>
      <div className="swatches">
        {SWATCHES.map((s) => (
          <label key={s.hex} className="swatch" title={s.name}>
            <input type="radio" name="colour" checked={v.colour?.hex === s.hex} onChange={() => set('colour', s)} />
            <span className="swatch__chip" style={{ background: s.hex }} />
            <span className="sr-only">{s.name}</span>
          </label>
        ))}
      </div>
      {v.colour && <p className="field__msg">{v.colour.name}. Used when there is no photo.</p>}
    </fieldset>
  );

  const datesBlock = (
    <div className="field-row">
      <Field label="Purchase date">{(p) => <Input {...p} type="date" max={today} value={v.purchase} onChange={(e) => set('purchase', e.target.value)} />}</Field>
      <Field label="Registration date">{(p) => <Input {...p} type="date" max={today} value={v.registered} onChange={(e) => set('registered', e.target.value)} />}</Field>
    </div>
  );

  const specBlock = (
    <>
      <div className="field-row">
        {showEngine && (
          <Field label="Engine (cc)">{(p) => <Input {...p} inputMode="numeric" placeholder="1197" value={v.engineCc} onChange={(e) => set('engineCc', e.target.value)} />}</Field>
        )}
        <Field label="Transmission">{(p) => <Input {...p} placeholder="Manual" value={v.transmission} onChange={(e) => set('transmission', e.target.value)} />}</Field>
      </div>
      {showBattery && <Field label="Battery (kWh)">{(p) => <Input {...p} inputMode="decimal" placeholder="30.2" value={v.batteryKwh} onChange={(e) => set('batteryKwh', e.target.value)} />}</Field>}
      {showCng && <Field label="CNG kit">{(p) => <Input {...p} placeholder="Make, cylinder capacity, fitted on" value={v.cngInfo} onChange={(e) => set('cngInfo', e.target.value)} />}</Field>}
      {showWheels && <Field label="Number of wheels">{(p) => <Input {...p} inputMode="numeric" value={v.wheels} onChange={(e) => set('wheels', e.target.value)} />}</Field>}
    </>
  );

  const notesBlock = <Field label="Notes">{(p) => <TextArea {...p} rows={2} value={v.notes} onChange={(e) => set('notes', e.target.value)} />}</Field>;

  const status = (
    <>
      {serverError && <Notice tone="error">{serverError}</Notice>}
      {busy && <span className="sr-only" role="status">Saving</span>}
    </>
  );

  if (wizard) {
    const meta = STEPS[step];
    const panels = [
      <section key="type" className="vform__section">{typeBlock}</section>,
      <section key="which" className="vform__section">{whichBlock}</section>,
      <>
        <section className="vform__section">{registrationBlock}</section>
        <section className="vform__section">{fuelBlock}</section>
      </>,
      <>
        <section className="vform__section">{odometerBlock}</section>
        <section className="vform__section">{intervalBlock}</section>
      </>,
      <>
        <section className="vform__section">{photoBlock}</section>
        <section className="vform__section">{colourBlock}</section>
        <details className="vform__more">
          <summary className="t-title">More details, if you have them</summary>
          <div className="vform__morebody">{datesBlock}{specBlock}{notesBlock}</div>
        </details>
      </>,
    ];
    return (
      <form id={formId} className="vform vform--wizard" onSubmit={submit} noValidate>
        <div className="wiz__head">
          <ol className="wiz__bar" aria-hidden="true">
            {STEPS.map((s, i) => <li key={s.title} className={cx('wiz__seg', i < step && 'is-done', i === step && 'is-current')} />)}
          </ol>
          <p className="wiz__count" aria-live="polite">Step {step + 1} of {STEPS.length}</p>
          <h2 ref={titleRef} tabIndex={-1} className="t-section wiz__title">{meta.title}</h2>
          <p className="t-body t-ink-2">{meta.hint}</p>
        </div>
        <div key={step} className={cx('wiz__panel', `wiz__panel--${dir}`)}>
          {panels[step]}
          {status}
        </div>
        <div className="formbar wiz__bar-actions">
          {step > 0 && (
            <Button variant="secondary" onClick={() => go(step - 1)}>
              <ArrowLeft size={18} aria-hidden /> Back
            </Button>
          )}
          <Button variant="primary" type="submit" busy={step === last && busy}>
            {step === last ? submitLabel : 'Continue'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form id={formId} className="vform" onSubmit={submit} noValidate>
      <section className="vform__section">{typeBlock}</section>
      <section className="vform__section">
        <h2 className="vform__h t-title">Which one?</h2>
        {whichBlock}
      </section>
      <section className="vform__section">{registrationBlock}</section>
      <section className="vform__section">{fuelBlock}</section>
      {!editing && <section className="vform__section">{odometerBlock}</section>}

      <details className="vform__more" open={editing}>
        <summary className="t-title">{editing ? 'Details' : 'More details, if you have them'}</summary>
        <div className="vform__morebody">
          {photoBlock}
          {colourBlock}
          {datesBlock}
          {specBlock}
          {intervalBlock}
          {notesBlock}
        </div>
      </details>

      {status}
      <button type="submit" hidden>{submitLabel}</button>
    </form>
  );
}
