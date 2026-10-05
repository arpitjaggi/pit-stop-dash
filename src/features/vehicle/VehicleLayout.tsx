import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBundle } from '@/data/hooks';
import { fuelLabel } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { formatNumber } from '@/lib/format';
import { openIssues, pitBoard } from '@/lib/status';
import { Button, EmptyState, LinkButton, Notice, Plate } from '@/ui/atoms';
import { ArrowLeft, Camera, CaretDown, PencilSimple } from '@/ui/icons';
import { rememberVehicle, useDesktop, useSheet, useWide } from '@/ui/hooks';
import { DockedAdd } from '../shell/DockedAdd';
import { PitBoardLine } from '../shared/PitBoardLine';
import { VehicleImage } from '../shared/VehicleImage';
import { VehicleDetails } from './VehicleDetails';

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'glovebox', label: 'Glovebox' },
  { to: 'service', label: 'Service' },
  { to: 'issues', label: 'Issues' },
  { to: 'odometer', label: 'Odometer' },
] as const;

export function VehicleLayout() {
  const { vehicleId } = useParams();
  const { bundle, loading, error } = useBundle(vehicleId);
  const desktop = useDesktop();
  const wide = useWide();
  const sheet = useSheet();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOverview = pathname.replace(/\/$/, '') === `/vehicles/${vehicleId}`;
  const splitTab = /\/(glovebox|service)(\/|$)/.test(pathname);
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vehicleId) rememberVehicle(vehicleId);
  }, [vehicleId]);

  // The compact header shows the vehicle's name once the identity block has scrolled away.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [bundle?.vehicle.id]);

  useEffect(() => {
    document.querySelector('.vtabs__link[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  if (loading) return <div className="page vpage"><div className="vhead__loading skeleton" aria-busy="true" /></div>;
  if (error) return <div className="page vpage stack"><Notice tone="error">We could not load this vehicle. {error.message}</Notice><LinkButton to="/">Back to the garage</LinkButton></div>;
  if (!bundle) {
    return (
      <div className="page vpage">
        <EmptyState title="That vehicle is not in your garage." action={<LinkButton variant="primary" to="/">Back to My Garage</LinkButton>} />
      </div>
    );
  }

  const v = bundle.vehicle;
  const board = pitBoard(bundle, todayISO());
  const open = openIssues(bundle.issues).length;
  const dockedLabel = 'Add';
  // On a phone, sub-tabs drop the big identity block so the list is on screen straight away.
  const compact = !desktop && !isOverview;

  return (
    <div className="page vpage">
      {!desktop && (
        <div className={`vbar${scrolled || compact ? ' is-scrolled' : ''}`}>
          <button type="button" className="icon-btn" aria-label="Back to My Garage" onClick={() => navigate('/')}>
            <ArrowLeft size={22} aria-hidden />
          </button>
          <button type="button" className="vbar__who" onClick={() => sheet.open('switch', { v: v.id })} aria-label={`${v.model}. Switch vehicle`}>
            <span className="vbar__model">{v.model}</span>
            {v.registration_number && (scrolled || compact) && <Plate value={v.registration_number} size="sm" />}
            <CaretDown size={14} aria-hidden />
          </button>
          <button type="button" className="icon-btn" aria-label="Edit vehicle" onClick={() => sheet.open('edit-vehicle', { v: v.id })}>
            <PencilSimple size={20} aria-hidden />
          </button>
        </div>
      )}

      <div className="vgrid">
        <div className="vmain">
          {!compact && (
          <header className="vhead">
            <div className="vhead__media">
              <VehicleImage vehicle={v} variant="hero" eager />
              {!v.photo_path && (
                <button type="button" className="vhead__addphoto" onClick={() => sheet.open('edit-vehicle', { v: v.id })}>
                  <Camera size={16} aria-hidden /> Add a photo
                </button>
              )}
            </div>
            <div className="vhead__id" ref={sentinel}>
              <p className="vhead__make t-label t-ink-2">{v.make}</p>
              <h1 className="t-display vhead__model">{v.model}</h1>
              {v.variant && <p className="vhead__variant t-ink-2">{v.variant}</p>}
              <div className="vhead__facts">
                {v.registration_number ? <Plate value={v.registration_number} size={desktop ? 'lg' : 'md'} /> : <span className="t-label t-ink-3">Not registered yet</span>}
                <span className="vhead__fuel t-ink-2">{fuelLabel(v.fuel_type)}</span>
                <span className="vhead__odo">
                  {v.current_odometer_km != null ? (
                    <>
                      <span className="fig fig-m">{formatNumber(v.current_odometer_km)}</span>
                      <span className="fig-unit">km</span>
                    </>
                  ) : (
                    <span className="t-label t-ink-3">No reading yet</span>
                  )}
                </span>
              </div>
            </div>
            <div className="vhead__board">
              <Link to={board.tab === 'overview' ? '.' : board.tab} className="vhead__boardlink" aria-label={`${board.sentence} Open details`}>
                <PitBoardLine board={board} className="t-board" />
              </Link>
              {board.needsOdometer && (
                <Button variant="secondary" className="vhead__update" onClick={() => sheet.open('reading', { v: v.id })}>
                  Update odometer
                </Button>
              )}
            </div>
          </header>
          )}

          <nav className="vtabs" aria-label="Sections">
            <ul>
              {TABS.map((t) => (
                <li key={t.label}>
                  <NavLink to={t.to} end={'end' in t ? t.end : false} className="vtabs__link">
                    {t.label}
                    {t.label === 'Issues' && open > 0 && <span className="vtabs__count fig">{open}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="vcontent">
            <Outlet context={{ bundle }} />
          </div>
        </div>
        {wide && !splitTab && (
          <aside className="vrail" aria-label="Vehicle details">
            <h2 className="t-title">Details</h2>
            <VehicleDetails bundle={bundle} />
          </aside>
        )}
      </div>
      {!desktop && <DockedAdd label={dockedLabel} onClick={() => sheet.open('log', { v: v.id })} />}
    </div>
  );
}
