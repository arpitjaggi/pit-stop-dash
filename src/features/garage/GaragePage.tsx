import { Link } from 'react-router-dom';
import { useGarage } from '@/data/hooks';
import type { VehicleBundle } from '@/data/types';
import { todayISO } from '@/lib/dates';
import { formatNumber } from '@/lib/format';
import { attentionItems, pitBoard } from '@/lib/status';
import { Button, EmptyState, LinkButton, Plate, Notice } from '@/ui/atoms';
import { CaretDown, Plus, User } from '@/ui/icons';
import { useDesktop, useSheet } from '@/ui/hooks';
import { VehicleImage } from '../shared/VehicleImage';
import { PitBoardLine } from '../shared/PitBoardLine';
import { DockedAdd } from '../shell/DockedAdd';

export function GaragePage() {
  const { vehicles, bundles, loading, error, refetch } = useGarage();
  const today = todayISO();
  const desktop = useDesktop();
  const sheet = useSheet();

  const attention = vehicles.flatMap((v) => {
    const b = bundles.get(v.id);
    return b ? attentionItems(b, today).filter((i) => i.tier <= 3).map((i) => ({ v, i })) : [];
  });

  return (
    <div className="page garage">
      <header className="garage__head">
        <h1 className="t-section garage__title">My Garage</h1>
        {!desktop && (
          <button type="button" className="icon-btn" aria-label="Account" onClick={() => sheet.open('account')}>
            <User size={20} aria-hidden />
          </button>
        )}
        {desktop && vehicles.length > 0 && (
          <LinkButton variant="secondary" to="/vehicles/new">
            <Plus size={16} aria-hidden /> Add vehicle
          </LinkButton>
        )}
      </header>

      {error ? (
        <div className="stack">
          <Notice tone="error">We could not load your garage. {error.message}</Notice>
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : loading ? (
        <ul className="bays" aria-busy="true" aria-label="Loading vehicles">
          {[0, 1].map((n) => (
            <li key={n} className="bay bay--skeleton">
              <div className="bay__media skeleton" />
              <div className="bay__body">
                <span className="skeleton skeleton--line" />
                <span className="skeleton skeleton--line skeleton--short" />
              </div>
            </li>
          ))}
        </ul>
      ) : vehicles.length === 0 ? (
        <div className="garage__empty">
          <EmptyState
            title="My Garage is empty."
            body="Add your first vehicle and keep the important stuff in one place."
            action={
              <LinkButton variant="primary" to="/vehicles/new">
                <Plus size={18} aria-hidden /> Add vehicle
              </LinkButton>
            }
          />
        </div>
      ) : (
        <>
          {attention.length > 0 && (
            <details className="needs">
              <summary>
                <span className="needs__count fig fig-s">{attention.length}</span>
                <span className="needs__text t-title">{attention.length === 1 ? 'Thing needs you' : 'Things need you'}</span>
                <CaretDown size={16} aria-hidden className="needs__caret" />
              </summary>
              <ul className="needs__list">
                {attention.map(({ v, i }) => (
                  <li key={`${v.id}-${i.id}`}>
                    <Link to={`/vehicles/${v.id}${i.tab === 'overview' ? '' : `/${i.tab}`}`} className="needs__row">
                      <span className="needs__veh t-label t-ink-2">{v.model}</span>
                      <span className={`needs__sentence needs__sentence--${i.severity}`}>{i.sentence}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <ul className="bays">
            {vehicles.map((v, idx) => {
              const b = bundles.get(v.id) as VehicleBundle;
              return (
                <li key={v.id}>
                  <Bay bundle={b} today={today} eager={idx === 0} />
                </li>
              );
            })}
          </ul>
        </>
      )}
      {!desktop && !loading && !error && vehicles.length > 0 && <DockedAdd onClick={() => sheet.open('log')} />}
    </div>
  );
}

function Bay({ bundle, today, eager }: { bundle: VehicleBundle; today: string; eager?: boolean }) {
  const v = bundle.vehicle;
  const board = pitBoard(bundle, today);
  return (
    <Link to={`/vehicles/${v.id}`} className="bay">
      <div className="bay__media">
        <VehicleImage vehicle={v} variant="bay" eager={eager} />
      </div>
      <div className="bay__body">
        <h2 className={v.photo_path ? 'bay__model' : 'bay__model sr-only'}>{v.model}</h2>
        <p className="bay__make">{[v.make, v.variant].filter(Boolean).join(' · ')}</p>
        <div className="bay__id">
          {v.registration_number ? <Plate value={v.registration_number} size="sm" /> : <span className="t-label t-ink-3">Not registered yet</span>}
          <span className="bay__odo">
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
        <PitBoardLine board={board} className="bay__board" />
      </div>
    </Link>
  );
}
