// Test fixtures: bare-minimum rows with sensible defaults.
import type { Issue, ServiceRecord, VDocument, Vehicle, VehicleBundle } from '@/data/types';

export const TODAY = '2026-10-05';

export function vehicle(p: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1', user_id: 'u1', vehicle_type: 'car', make: 'Maruti Suzuki', model: 'Swift', variant: 'VXi',
    registration_number: 'KA01AB1234', registration_date: null, purchase_date: null, fuel_type: 'petrol', plate_use: 'private',
    colour_name: null, colour_hex: null, notes: null, engine_cc: null, transmission: null, battery_kwh: null,
    cng_kit_info: null, wheels: null, photo_path: null, photo_thumb_path: null,
    service_interval_km: 10000, service_interval_months: 12,
    current_odometer_km: 45210, odometer_read_on: '2026-10-01',
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', ...p,
  };
}

let n = 0;
export function doc(p: Partial<VDocument> = {}): VDocument {
  n += 1;
  return {
    id: `d${n}`, user_id: 'u1', vehicle_id: 'v1', doc_type: 'insurance', title: null, issuer: null,
    reference_number: null, issued_on: null, expires_on: null, notes: null, file_path: 'x', thumb_path: null,
    file_name: 'x.pdf', mime_type: 'application/pdf', size_bytes: 1, extracted_fields: [],
    created_at: `2026-01-0${(n % 9) + 1}T00:00:00Z`, updated_at: '2026-01-01T00:00:00Z', ...p,
  };
}

export function issue(p: Partial<Issue> = {}): Issue {
  n += 1;
  return {
    id: `i${n}`, user_id: 'u1', vehicle_id: 'v1', description: 'AC rattles', note: null, status: 'open',
    added_on: '2026-09-01', resolved_on: null, resolved_in_service_id: null,
    created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z', ...p,
  };
}

export function service(p: Partial<ServiceRecord> = {}): ServiceRecord {
  n += 1;
  return {
    id: `s${n}`, user_id: 'u1', vehicle_id: 'v1', serviced_on: '2026-08-12', workshop: 'Sai Auto Works',
    odometer_km: 38420, service_type: 'Regular service', work_performed: null, cost_inr: null,
    problems_found: null, carry_forward: null, notes: null,
    created_at: '2026-08-12T00:00:00Z', updated_at: '2026-08-12T00:00:00Z', ...p,
  };
}

export function bundle(p: Partial<VehicleBundle> = {}): VehicleBundle {
  return { vehicle: vehicle(), documents: [], issues: [], services: [], ...p };
}
