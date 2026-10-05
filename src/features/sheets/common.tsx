import { useMatch } from 'react-router-dom';
import type { Vehicle } from '@/data/types';
import { formatRegistration } from '@/lib/plate';
import { recallVehicle, useSheet } from '@/ui/hooks';

/** The vehicle an action applies to: explicit (?v=), the page you are on, the last one used, or the first. */
export function useActiveVehicle(vehicles: Vehicle[]): Vehicle | null {
  const { vehicleParam } = useSheet();
  const match = useMatch('/vehicles/:vehicleId/*');
  const candidates = [vehicleParam, match?.params.vehicleId, recallVehicle()];
  for (const id of candidates) {
    const v = id ? vehicles.find((x) => x.id === id) : undefined;
    if (v) return v;
  }
  return vehicles[0] ?? null;
}

export const vehicleName = (v: Vehicle) => `${v.make} ${v.model}`;
export const vehicleOptionLabel = (v: Vehicle) =>
  `${v.model}${v.registration_number ? ` · ${formatRegistration(v.registration_number)}` : ''}`;
