import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// ---------------------------------------------------------------- media

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** True on desktop-class screens: the expanded layout with sidebar and panes. */
export const useDesktop = () => useMedia('(min-width: 1024px)');
export const useWide = () => useMedia('(min-width: 1280px)');

// ---------------------------------------------------------------- sheets driven by the URL
// A sheet is "?sheet=name&v=<vehicle>&id=<thing>". Opening pushes history, so the phone's back
// gesture closes the sheet instead of leaving the page.

export type SheetName =
  | 'log' | 'reading' | 'issue' | 'document' | 'document-edit' | 'service' | 'service-edit' | 'record' | 'switch'
  | 'interval' | 'edit-vehicle' | 'workshop' | 'account' | 'delete-vehicle' | 'details';

export function useSheet() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const name = (params.get('sheet') as SheetName | null) ?? null;

  const open = useCallback(
    (sheet: SheetName, opts: { v?: string; id?: string; replace?: boolean } = {}) => {
      const sp = new URLSearchParams(location.search);
      sp.set('sheet', sheet);
      if (opts.v) sp.set('v', opts.v); else if (!sp.has('v')) sp.delete('v');
      if (opts.id) sp.set('id', opts.id); else sp.delete('id');
      navigate({ pathname: location.pathname, search: `?${sp.toString()}` }, { replace: opts.replace ?? Boolean(name), state: { sheet: true } });
    },
    [location.pathname, location.search, navigate, name],
  );

  const close = useCallback(() => {
    if ((location.state as { sheet?: boolean } | null)?.sheet && !(window.history.state?.idx === 0)) {
      navigate(-1);
    } else {
      const sp = new URLSearchParams(location.search);
      ['sheet', 'v', 'id'].forEach((k) => sp.delete(k));
      navigate({ pathname: location.pathname, search: sp.toString() ? `?${sp.toString()}` : '' }, { replace: true });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  return { name, vehicleParam: params.get('v'), id: params.get('id'), open, close };
}

// ---------------------------------------------------------------- toasts

interface ToastItem {
  id: number;
  text: string;
  undo?: () => void;
}
interface ToastApi {
  toast: (text: string, opts?: { undo?: () => void }) => void;
}
const ToastContext = createContext<ToastApi>({ toast: () => undefined });
export const useToast = () => useContext(ToastContext).toast;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const toast = useCallback<ToastApi['toast']>(
    (text, opts) => {
      const id = ++seq.current;
      setItems((l) => [...l.slice(-1), { id, text, undo: opts?.undo }]);
      window.setTimeout(() => dismiss(id), opts?.undo ? 6000 : 3500);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.text}</span>
            {t.undo && (
              <button
                type="button"
                className="toast__undo"
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------- remembered vehicle

const LAST_KEY = 'pitstop:lastVehicle';
export const rememberVehicle = (id: string) => {
  try { localStorage.setItem(LAST_KEY, id); } catch { /* private mode */ }
};
export const recallVehicle = (): string | null => {
  try { return localStorage.getItem(LAST_KEY); } catch { return null; }
};
