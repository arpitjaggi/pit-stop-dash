import type { VehicleBundle } from '@/data/types';
import { fuelLabel, vehicleTypeLabel } from '@/data/types';
import { formatDate } from '@/lib/dates';
import { formatKm } from '@/lib/format';
import { latestService } from '@/lib/status';
import { Button } from '@/ui/atoms';
import { PencilSimple } from '@/ui/icons';
import { useSheet } from '@/ui/hooks';

/** The vehicle's facts as a quiet list. On wide screens this is the properties rail. */
export function VehicleDetails({ bundle }: { bundle: VehicleBundle }) {
  const v = bundle.vehicle;
  const sheet = useSheet();
  const last = latestService(bundle.services);
  const rows: [string, string | null][] = [
    ['Type', vehicleTypeLabel(v.vehicle_type)],
    ['Fuel', fuelLabel(v.fuel_type)],
    ['Registered', v.registration_date ? formatDate(v.registration_date) : null],
    ['Purchased', v.purchase_date ? formatDate(v.purchase_date) : null],
    ['Colour', v.colour_name],
    ['Engine', v.engine_cc ? `${v.engine_cc} cc` : null],
    ['Transmission', v.transmission],
    ['Battery', v.battery_kwh ? `${v.battery_kwh} kWh` : null],
    ['CNG kit', v.cng_kit_info],
    ['Wheels', v.wheels ? String(v.wheels) : null],
    [
      'Service every',
      v.service_interval_km || v.service_interval_months
        ? [v.service_interval_km ? formatKm(v.service_interval_km) : null, v.service_interval_months ? `${v.service_interval_months} months` : null].filter(Boolean).join(' or ')
        : null,
    ],
    ['Last service', last ? `${formatDate(last.serviced_on)}${last.odometer_km != null ? `, ${formatKm(last.odometer_km)}` : ''}` : null],
  ];
  const shown = rows.filter((r): r is [string, string] => Boolean(r[1]));
  return (
    <div className="details">
      <dl className="details__list">
        {shown.map(([k, val]) => (
          <div key={k} className="details__row">
            <dt>{k}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>
      {v.notes && <p className="details__notes t-ink-2">{v.notes}</p>}
      <Button variant="secondary" onClick={() => sheet.open('edit-vehicle', { v: v.id })}>
        <PencilSimple size={16} aria-hidden /> Edit vehicle
      </Button>
    </div>
  );
}
