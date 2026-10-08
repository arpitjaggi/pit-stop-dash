// What an RC says about the vehicle, set against what the app already knows. Each finding is one
// thing the owner can accept or leave: nothing is changed without a tick.

import { FUEL_TYPES, VEHICLE_TYPES, type Vehicle, type VehiclePatch } from '@/data/types';
import { formatDate } from '../dates';
import { formatRegistration } from '../plate';
import { swatchForName } from '../swatches';
import type { ParsedVehicle } from './parse';

export interface Finding {
  key: string;
  label: string;
  /** What the app has now, as shown. Empty when nothing is recorded yet. */
  current: string;
  /** What the document says, as shown. */
  next: string;
  /** The reader is unsure: show it with a "check this" note. */
  low: boolean;
  note?: string;
  /** Ticked to begin with: only where nothing is recorded yet. */
  defaultOn: boolean;
  patch: VehiclePatch;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function vehicleFindings(v: Vehicle, p: ParsedVehicle): Finding[] {
  const out: Finding[] = [];
  const add = (key: string, label: string, current: string, next: string | undefined, found: { confidence: string; note?: string } | undefined, patch: VehiclePatch) => {
    if (!next || !found || same(current, next)) return;
    out.push({ key, label, current, next, low: found.confidence === 'low', note: found.note, defaultOn: current === '', patch });
  };

  if (p.registration_number) {
    add('registration_number', 'Registration number', v.registration_number ? formatRegistration(v.registration_number) : '', formatRegistration(p.registration_number.value), p.registration_number, {
      registration_number: p.registration_number.value,
    });
  }
  if (p.make) add('make', 'Make', v.make, p.make.value, p.make, { make: p.make.value });
  if (p.model) add('model', 'Model', v.model, p.model.value, p.model, { model: p.model.value });
  if (p.variant) add('variant', 'Variant', v.variant ?? '', p.variant.value, p.variant, { variant: p.variant.value });
  if (p.fuel_type) {
    const label = (f: string) => FUEL_TYPES.find((x) => x.value === f)?.label ?? f;
    add('fuel_type', 'Fuel', label(v.fuel_type), label(p.fuel_type.value), p.fuel_type, { fuel_type: p.fuel_type.value });
  }
  if (p.engine_cc) add('engine_cc', 'Engine', v.engine_cc != null ? `${v.engine_cc} cc` : '', `${p.engine_cc.value} cc`, p.engine_cc, { engine_cc: p.engine_cc.value });
  if (p.registration_date) {
    add('registration_date', 'Registered on', v.registration_date ? formatDate(v.registration_date) : '', formatDate(p.registration_date.value), p.registration_date, {
      registration_date: p.registration_date.value,
    });
  }
  if (p.colour_name) {
    const sw = swatchForName(p.colour_name.value);
    add('colour', 'Colour', v.colour_name ?? '', p.colour_name.value, p.colour_name, {
      colour_name: p.colour_name.value,
      ...(sw ? { colour_hex: sw.hex } : {}),
    });
  }
  if (p.vehicle_type) {
    const label = (t: string) => VEHICLE_TYPES.find((x) => x.value === t)?.label ?? t;
    add('vehicle_type', 'Type', label(v.vehicle_type), label(p.vehicle_type.value), p.vehicle_type, { vehicle_type: p.vehicle_type.value });
  }
  return out;
}
