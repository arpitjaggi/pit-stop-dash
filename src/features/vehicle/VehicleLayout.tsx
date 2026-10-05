import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBundle } from '@/data/hooks';
import { fuelLabel } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { formatNumber } from '@/lib/format';
import { openIssues, pitBoard, type PitAction } from '@/lib/status';
import { Button, EmptyState, LinkButton, Notice, Plate, cx } from '@/ui/atoms';
import { ArrowLeft, Camera, CaretDown, PencilSimple } from '@/ui/icons';
import { rememberVehicle, useDesktop, useSheet, useWide, type SheetName } from '@/ui/hooks';
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

/** The docked button does the obvious thing for the tab you are on. */
const DOCK: Record<string, { label: string; sheet: SheetName }> = {
  '': { label: 'Add', sheet: 'log' },
  glovebox: { label: 'Upload', sheet: 'document' },
  service: { label: 'Log service', sheet: 'service' },
  issues: { label: 'Add issue', sheet: 'issue' },
  odometer: { label: 'Add reading', sheet: 'reading' },
};

export function VehicleLayout() {
  const { vehicleId } = useParams();
  const { bundle, loading, error } = useBundle(vehicleId);
  const desktop = useDesktop();
  const wide = useWide();
  const sheet = useSheet();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tab = pathname.split('/')[3] ?? '';
  const isOverview = tab === '';
  const splitTab = tab === 'glovebox' || tab === 'service';
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const [fadeEnd, setFadeEnd] = useState(false);

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

  // A fade on the right edge says there is another section out of view (narrow phones only).
  useEffect(() => {
    const ul = tabsRef.current?.querySelector('ul');
    if (!ul) return;
    const check = () => setFadeEnd(ul.scrollWidth > ul.clientWidth + 2 && ul.scrollLeft + ul.clientWidth < ul.scrollWidth - 2);
    check();
    ul.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { ul.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, [bundle?.vehicle.id, bundle?.issues]);

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
  const dock = DOCK[tab] ?? DOCK[''];
  // On a phone, sub-tabs drop the big identity block so the list is on screen straight away.
  const compact = !desktop && !isOverview;
  const strip = desktop && !isOverview;
  const long = board.sentence.length > 46;

  const act = (a: PitAction) => {
    const o = { v: v.id };
    if (a.kind === 'upload-document') sheet.open('document', { ...o, id: a.docType });
    else if (a.kind === 'add-documents') sheet.open('document', o);
    else if (a.kind === 'log-service') sheet.open('service', o);
    else if (a.kind === 'workshop') sheet.open('workshop', o);
    else sheet.open('reading', o);
  };

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
          {compact && <h1 className="sr-only">{v.make} {v.model}</h1>}
          {!compact && (
            <header className={cx('vhead', strip && 'vhead--strip')}>
              <div className="vhead__media">
                <VehicleImage vehicle={v} variant="hero" eager />
                {!v.photo_path && !strip && (
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
                  {v.registration_number ? <Plate value={v.registration_number} size={desktop && !strip ? 'lg' : 'md'} /> : <span className="t-label t-ink-3">Not registered yet</span>}
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
                  <PitBoardLine board={{ ...board, more: 0 }} className={cx('t-board', long && 't-board--long')} />
                </Link>
                {(board.action || board.more > 0) && (
                  <div className="vhead__actions">
                    {board.action && (
                      <Button variant="secondary" onClick={() => act(board.action as PitAction)}>
                        {board.action.label}
                      </Button>
                    )}
                    {board.more > 0 && (
                      <button type="button" className="linkbtn" onClick={() => navigate(`/vehicles/${v.id}#also`)}>
                        and {board.more} more {board.more === 1 ? 'thing' : 'things'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </header>
          )}

          <nav ref={tabsRef} className={cx('vtabs', fadeEnd && 'fade-end')} aria-label="Sections">
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
      {!desktop && <DockedAdd label={dock.label} onClick={() => sheet.open(dock.sheet, { v: v.id })} />}
    </div>
  );
}
