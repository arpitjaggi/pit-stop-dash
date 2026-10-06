import { useLocation, useNavigate } from 'react-router-dom';
import { useGarage } from '@/data/hooks';
import { todayISO } from '@/lib/dates';
import { pitBoard } from '@/lib/status';
import { VehiclePlate } from '@/ui/atoms';
import { Plus } from '@/ui/icons';
import { rememberVehicle, useSheet } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { PitBoardLine } from '../shared/PitBoardLine';
import { VehicleImage } from '../shared/VehicleImage';
import { useActiveVehicle } from './common';

export function SwitchSheet() {
  const { vehicles, bundles } = useGarage();
  const sheet = useSheet();
  const navigate = useNavigate();
  const loc = useLocation();
  const active = useActiveVehicle(vehicles);
  const today = todayISO();
  const tab = /^\/vehicles\/[^/]+(\/[^/?]+)?/.exec(loc.pathname)?.[1] ?? '';

  return (
    <Sheet title="Switch vehicle">
      <ul className="switch-list">
        {vehicles.map((v) => {
          const b = bundles.get(v.id);
          return (
            <li key={v.id}>
              <button
                type="button"
                className="switch-row"
                aria-current={v.id === active?.id ? 'true' : undefined}
                onClick={() => {
                  rememberVehicle(v.id);
                  sheet.close();
                  window.setTimeout(() => navigate(`/vehicles/${v.id}${tab === '/glovebox' || tab === '/service' || tab === '/issues' || tab === '/odometer' ? tab : ''}`), 0);
                }}
              >
                <VehicleImage vehicle={v} variant="thumb" />
                <span className="switch-row__text">
                  <span className="t-title">{v.model}</span>
                  <span className="switch-row__meta">
                    {v.registration_number ? <VehiclePlate vehicle={v} size="sm" /> : <span className="t-label t-ink-3">Not registered yet</span>}
                  </span>
                  {b && <PitBoardLine board={pitBoard(b, today)} className="switch-row__board" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="action-row action-row--plain"
        onClick={() => {
          sheet.close();
          window.setTimeout(() => navigate('/vehicles/new'), 0);
        }}
      >
        <Plus size={22} aria-hidden />
        <span className="t-title">Add a vehicle</span>
      </button>
    </Sheet>
  );
}
