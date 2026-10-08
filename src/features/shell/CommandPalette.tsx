import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { useGarage } from '@/data/hooks';
import { docTypeLabel } from '@/data/types';
import { formatRegistration } from '@/lib/plate';
import { rememberVehicle, useSheet, type SheetName } from '@/ui/hooks';
import { useActiveVehicle } from '../sheets/common';

interface Cmd {
  id: string;
  group: 'Go to' | 'Add' | 'Vehicles' | 'Documents';
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

const TABS = [
  { path: '', label: 'Overview' },
  { path: '/glovebox', label: 'Glovebox' },
  { path: '/service', label: 'Service' },
  { path: '/issues', label: 'Issues' },
  { path: '/odometer', label: 'Odometer' },
];

/** Raycast-style jump-to: vehicles, tabs, documents and the quick actions, all from the keyboard. */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { vehicles, bundles } = useGarage();
  const navigate = useNavigate();
  const sheet = useSheet();
  const active = useActiveVehicle(vehicles);
  const onVehicle = Boolean(useMatch('/vehicles/:vehicleId/*')) && active;
  const ref = useRef<HTMLDialogElement>(null);
  const listId = useId();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);

  const commands = useMemo<Cmd[]>(() => {
    const out: Cmd[] = [{ id: 'garage', group: 'Go to', label: 'My Garage', hint: 'G', run: () => navigate('/') }];
    if (onVehicle && active) {
      TABS.forEach((t, i) => out.push({ id: `tab-${t.path}`, group: 'Go to', label: `${active.model}: ${t.label}`, hint: String(i + 1), run: () => navigate(`/vehicles/${active.id}${t.path}`) }));
    }
    if (active) {
      const act = (name: SheetName) => () => {
        rememberVehicle(active.id);
        navigate({ pathname: location.pathname, search: '' });
        window.setTimeout(() => sheet.open(name, { v: active.id }), 0);
      };
      const who = `${active.model}`;
      out.push(
        { id: 'a-reading', group: 'Add', label: 'Add odometer reading', hint: who, keywords: 'km distance log', run: act('reading') },
        { id: 'a-issue', group: 'Add', label: 'Add issue', hint: who, keywords: 'problem noticed', run: act('issue') },
        { id: 'a-doc', group: 'Add', label: 'Upload document', hint: who, keywords: 'rc insurance puc file photo', run: act('document') },
        { id: 'a-service', group: 'Add', label: 'Add service record', hint: who, keywords: 'workshop log', run: act('service') },
      );
    }
    out.push({ id: 'a-vehicle', group: 'Add', label: 'Add vehicle', keywords: 'new car bike scooter', run: () => navigate('/vehicles/new') });
    for (const v of vehicles) {
      out.push({
        id: `v-${v.id}`,
        group: 'Vehicles',
        label: `${v.make} ${v.model}`,
        hint: v.registration_number ? formatRegistration(v.registration_number) : undefined,
        keywords: `${v.variant ?? ''} ${v.registration_number ?? ''}`,
        run: () => {
          rememberVehicle(v.id);
          navigate(`/vehicles/${v.id}`);
        },
      });
      for (const d of bundles.get(v.id)?.documents ?? []) {
        out.push({
          id: `d-${d.id}`,
          group: 'Documents',
          label: `${d.title || docTypeLabel(d.doc_type)}`,
          hint: v.model,
          keywords: `${docTypeLabel(d.doc_type)} ${d.issuer ?? ''}`,
          run: () => navigate(`/vehicles/${v.id}/glovebox/${d.id}`),
        });
      }
    }
    return out;
  }, [active, bundles, navigate, onVehicle, sheet, vehicles]);

  const results = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return commands.filter((c) => c.group !== 'Documents').slice(0, 14);
    // Rank by where the match is: the label first, then the hint, keywords last. Ties keep group order.
    const rank = (c: Cmd): number | null => {
      const label = c.label.toLowerCase();
      const hint = (c.hint ?? '').toLowerCase();
      const extra = `${c.keywords ?? ''} ${c.group}`.toLowerCase();
      let worst = 0;
      for (const t of tokens) {
        const r = label.startsWith(t) || label.includes(` ${t}`) ? 0 : label.includes(t) ? 1 : hint.includes(t) ? 2 : extra.includes(t) ? 3 : null;
        if (r === null) return null;
        worst = Math.max(worst, r);
      }
      return worst;
    };
    return commands
      .map((c, i) => ({ c, r: rank(c), i }))
      .filter((x): x is { c: Cmd; r: number; i: number } => x.r !== null)
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .map((x) => x.c);
  }, [q, commands]);

  useEffect(() => setCursor(0), [q]);

  const run = (c: Cmd | undefined) => {
    if (!c) return;
    onClose();
    window.setTimeout(c.run, 0);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[cursor]);
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${cursor}`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, listId]);

  let lastGroup = '';
  return (
    <dialog
      ref={ref}
      className="cmdk"
      aria-label="Jump to"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <input
        className="cmdk__input"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={results[cursor] ? `${listId}-${cursor}` : undefined}
        aria-autocomplete="list"
        placeholder="Jump to a vehicle, document or action"
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKey}
      />
      <ul id={listId} role="listbox" className="cmdk__list" aria-label="Results">
        {results.length === 0 && <li className="cmdk__empty">Nothing matches "{q}".</li>}
        {results.map((c, i) => {
          const heading = !q && c.group !== lastGroup ? c.group : null;
          lastGroup = c.group;
          return (
            <li key={c.id} role="presentation">
              {heading && <p className="cmdk__group t-label" aria-hidden="true">{heading}</p>}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === cursor}
                className="cmdk__item"
                onMouseMove={() => setCursor(i)}
                onClick={() => run(c)}
              >
                <span>{c.label}</span>
                {c.hint && <span className="cmdk__hint">{c.hint}</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="cmdk__foot t-label" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
        <span><kbd>↵</kbd> to open</span>
        <span>Outside this box: <kbd>g</kbd> garage, <kbd>a</kbd> add, <kbd>1</kbd>–<kbd>5</kbd> sections</span>
      </p>
    </dialog>
  );
}
