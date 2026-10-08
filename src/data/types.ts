// Domain types mirror the database rows (snake_case) so no mapping layer is needed.
// Dates are ISO calendar dates ("2026-09-14"); timestamps are ISO strings.

export type VehicleType = 'car' | 'suv' | 'motorcycle' | 'scooter' | 'other_two_wheeler' | 'other';
export type PlateUse = 'private' | 'commercial' | 'rental';
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'petrol_cng' | 'electric' | 'hybrid' | 'other';
export type DocType =
  | 'rc'
  | 'insurance'
  | 'puc'
  | 'warranty'
  | 'extended_warranty'
  | 'accessory_warranty'
  | 'cng_certificate'
  | 'other';
export type IssueStatus = 'open' | 'resolved';
export type ReadingSource = 'manual' | 'vehicle_added' | 'service';

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_type: VehicleType;
  make: string;
  model: string;
  variant: string | null;
  registration_number: string | null;
  registration_date: string | null;
  purchase_date: string | null;
  fuel_type: FuelType;
  plate_use: PlateUse;
  colour_name: string | null;
  colour_hex: string | null;
  notes: string | null;
  engine_cc: number | null;
  transmission: string | null;
  battery_kwh: number | null;
  cng_kit_info: string | null;
  wheels: number | null;
  photo_path: string | null;
  photo_thumb_path: string | null;
  service_interval_km: number | null;
  service_interval_months: number | null;
  current_odometer_km: number | null;
  odometer_read_on: string | null;
  created_at: string;
  updated_at: string;
}

export type NewVehicle = Pick<Vehicle, 'vehicle_type' | 'make' | 'model' | 'fuel_type'> &
  Partial<
    Pick<
      Vehicle,
      | 'variant'
      | 'plate_use'
      | 'registration_number'
      | 'registration_date'
      | 'purchase_date'
      | 'colour_name'
      | 'colour_hex'
      | 'notes'
      | 'engine_cc'
      | 'transmission'
      | 'battery_kwh'
      | 'cng_kit_info'
      | 'wheels'
      | 'service_interval_km'
      | 'service_interval_months'
    >
  > & { odometer_km: number | null };

export type VehiclePatch = Partial<
  Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_odometer_km' | 'odometer_read_on'>
>;

export interface Reading {
  id: string;
  user_id: string;
  vehicle_id: string;
  read_on: string;
  reading_km: number;
  note: string | null;
  source: ReadingSource;
  created_at: string;
}

export interface Issue {
  id: string;
  user_id: string;
  vehicle_id: string;
  description: string;
  note: string | null;
  status: IssueStatus;
  added_on: string;
  resolved_on: string | null;
  resolved_in_service_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  user_id: string;
  vehicle_id: string;
  serviced_on: string;
  workshop: string | null;
  odometer_km: number | null;
  service_type: string;
  work_performed: string | null;
  cost_inr: number | null;
  problems_found: string | null;
  carry_forward: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VDocument {
  id: string;
  user_id: string;
  vehicle_id: string;
  doc_type: DocType;
  title: string | null;
  issuer: string | null;
  reference_number: string | null;
  issued_on: string | null;
  expires_on: string | null;
  notes: string | null;
  file_path: string;
  thumb_path: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  /** Fields filled in from the document itself. Everything else was entered by the owner. */
  extracted_fields: string[];
  created_at: string;
  updated_at: string;
}

/** Everything the app knows about one vehicle, used by the status logic. */
export interface VehicleBundle {
  vehicle: Vehicle;
  documents: VDocument[];
  issues: Issue[];
  services: ServiceRecord[];
}

export const VEHICLE_TYPES: { value: VehicleType; label: string; hint: string }[] = [
  { value: 'car', label: 'Car', hint: 'Hatchback, sedan, MPV' },
  { value: 'suv', label: 'SUV', hint: 'Compact to full-size' },
  { value: 'motorcycle', label: 'Motorcycle', hint: 'Geared two-wheeler' },
  { value: 'scooter', label: 'Scooter', hint: 'Gearless two-wheeler' },
  { value: 'other_two_wheeler', label: 'Other two-wheeler', hint: 'Moped, electric bike' },
  { value: 'other', label: 'Other', hint: 'Anything else you keep' },
];

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'petrol_cng', label: 'Petrol + CNG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'other', label: 'Other' },
];

export const DOC_TYPES: { value: DocType; label: string; short: string; hasExpiry: boolean }[] = [
  { value: 'rc', label: 'RC', short: 'RC', hasExpiry: false },
  { value: 'insurance', label: 'Insurance', short: 'INS', hasExpiry: true },
  { value: 'puc', label: 'PUC', short: 'PUC', hasExpiry: true },
  { value: 'warranty', label: 'Warranty', short: 'WTY', hasExpiry: true },
  { value: 'extended_warranty', label: 'Extended warranty', short: 'EXT', hasExpiry: true },
  { value: 'accessory_warranty', label: 'Accessory warranty', short: 'ACC', hasExpiry: true },
  { value: 'cng_certificate', label: 'CNG certificate', short: 'CNG', hasExpiry: true },
  { value: 'other', label: 'Other', short: 'DOC', hasExpiry: true },
];

export const isTwoWheeler = (t: VehicleType) => t === 'motorcycle' || t === 'scooter' || t === 'other_two_wheeler';
export const docTypeLabel = (t: DocType) => DOC_TYPES.find((d) => d.value === t)!.label;
export const fuelLabel = (f: FuelType) => FUEL_TYPES.find((x) => x.value === f)!.label;
export const vehicleTypeLabel = (t: VehicleType) => VEHICLE_TYPES.find((x) => x.value === t)!.label;

/** Service intervals differ by vehicle; these are only the starting values, always editable. */
export function defaultIntervals(t: VehicleType): { km: number; months: number } {
  return isTwoWheeler(t) ? { km: 5000, months: 6 } : { km: 10000, months: 12 };
}
