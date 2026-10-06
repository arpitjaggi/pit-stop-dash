import { NavLink } from 'react-router-dom';
import { useGarage } from '@/data/hooks';
import { todayISO } from '@/lib/dates';
import { pitBoard } from '@/lib/status';
import { Plate } from '@/ui/atoms';
import { Command, MagnifyingGlass, Plus, User } from '@/ui/icons';
import { useSheet } from '@/ui/hooks';
import { ThemeToggle } from '@/ui/theme';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Sidebar({ onSearch }: { onSearch: () => void }) {
  const { vehicles, bundles } = useGarage();
  const sheet = useSheet();
  const today = todayISO();

  return (
    <nav className="sidebar" aria-label="Garage">
      <div className="sidebar__brand">
        <span className="sidebar__mark" aria-hidden="true">P</span>
        <span className="sidebar__word">Pit Stop Dash</span>
      </div>

      <button type="button" className="sidebar__search" onClick={onSearch}>
        <MagnifyingGlass size={16} aria-hidden />
        <span>Jump to…</span>
        <kbd>{isMac ? <Command size={11} aria-hidden /> : 'Ctrl'}<span>K</span></kbd>
      </button>

      <NavLink to="/" end className="sidebar__item">
        My Garage
      </NavLink>

      {vehicles.length > 0 && <p className="sidebar__heading t-label">Vehicles</p>}
      <ul className="sidebar__vehicles">
        {vehicles.map((v) => {
          const b = bundles.get(v.id);
          const board = b ? pitBoard(b, today) : null;
          return (
            <li key={v.id}>
              <NavLink to={`/vehicles/${v.id}`} className="sidebar__vehicle">
                <span className="sidebar__vname">
                  <span className="sidebar__swatch" style={v.colour_hex ? ({ '--vc': v.colour_hex } as React.CSSProperties) : undefined} aria-hidden="true" />
                  {v.model}
                </span>
                {board && (board.severity === 'overdue' || board.severity === 'soon') && (
                  <span className={`sidebar__dot sidebar__dot--${board.severity}`} role="img" aria-label={board.severity === 'overdue' ? 'Needs attention' : 'Something coming up'} />
                )}
                <span className="sidebar__plate">{v.registration_number ? <Plate value={v.registration_number} size="sm" /> : <span className="t-label t-ink-3">Unregistered</span>}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar__foot">
        <NavLink to="/vehicles/new" className="sidebar__item">
          <Plus size={16} aria-hidden /> Add vehicle
        </NavLink>
        <div className="sidebar__theme"><ThemeToggle compact /></div>
        <button type="button" className="sidebar__item" onClick={() => sheet.open('account')}>
          <User size={16} aria-hidden /> Account
        </button>
      </div>
    </nav>
  );
}
