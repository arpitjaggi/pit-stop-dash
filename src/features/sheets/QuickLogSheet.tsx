import { useGarage } from '@/data/hooks';
import { ago, todayISO } from '@/lib/dates';
import { formatKm } from '@/lib/format';
import { Field, Select } from '@/ui/atoms';
import { CaretRight, FileText, Gauge, Plus, Warning, Wrench } from '@/ui/icons';
import { useNavigate } from 'react-router-dom';
import { rememberVehicle, useSheet } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle, vehicleOptionLabel } from './common';

/** One tap from anywhere to the things you do most: log a reading, note an issue, file a document. */
export function QuickLogSheet() {
  const { vehicles } = useGarage();
  const sheet = useSheet();
  const navigate = useNavigate();
  const v = useActiveVehicle(vehicles);
  const today = todayISO();

  if (!v) return null;
  const go = (name: Parameters<typeof sheet.open>[0]) => {
    rememberVehicle(v.id);
    sheet.open(name, { v: v.id, replace: true });
  };

  return (
    <Sheet title="Add">
      {vehicles.length > 1 && (
        <Field label="For which vehicle?">
          {(p) => (
            <Select {...p} value={v.id} onChange={(e) => sheet.open('log', { v: e.target.value, replace: true })}>
              {vehicles.map((x) => (
                <option key={x.id} value={x.id}>
                  {vehicleOptionLabel(x)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}
      <ul className="action-list">
        <li>
          <button type="button" className="action-row" onClick={() => go('reading')}>
            <Gauge size={22} aria-hidden />
            <span>
              <span className="t-title">Odometer reading</span>
              <span className="action-row__sub">
                {v.current_odometer_km != null && v.odometer_read_on ? `Last: ${formatKm(v.current_odometer_km)}, ${ago(v.odometer_read_on, today)}` : 'No reading yet'}
              </span>
            </span>
            <CaretRight size={16} aria-hidden />
          </button>
        </li>
        <li>
          <button type="button" className="action-row" onClick={() => go('issue')}>
            <Warning size={22} aria-hidden />
            <span>
              <span className="t-title">Issue</span>
              <span className="action-row__sub">Something you noticed. Note it before you forget.</span>
            </span>
            <CaretRight size={16} aria-hidden />
          </button>
        </li>
        <li>
          <button type="button" className="action-row" onClick={() => go('document')}>
            <FileText size={22} aria-hidden />
            <span>
              <span className="t-title">Document</span>
              <span className="action-row__sub">RC, insurance, PUC, warranty. Camera or file.</span>
            </span>
            <CaretRight size={16} aria-hidden />
          </button>
        </li>
        <li>
          <button type="button" className="action-row" onClick={() => go('service')}>
            <Wrench size={22} aria-hidden />
            <span>
              <span className="t-title">Service record</span>
              <span className="action-row__sub">Log a visit to the workshop.</span>
            </span>
            <CaretRight size={16} aria-hidden />
          </button>
        </li>
        <li>
          <button
            type="button"
            className="action-row"
            onClick={() => {
              sheet.close();
              window.setTimeout(() => navigate('/vehicles/new'), 0);
            }}
          >
            <Plus size={22} aria-hidden />
            <span>
              <span className="t-title">Another vehicle</span>
              <span className="action-row__sub">Add to your garage.</span>
            </span>
            <CaretRight size={16} aria-hidden />
          </button>
        </li>
      </ul>
    </Sheet>
  );
}
