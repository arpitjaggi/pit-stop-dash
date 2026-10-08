import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '@/auth/session';
import { recallVehicle, useDesktop, useSheet } from '@/ui/hooks';
import { CommandPalette } from './CommandPalette';
import { SheetHost } from './SheetHost';
import { Sidebar } from './Sidebar';

export function Shell() {
  const desktop = useDesktop();
  const session = useSession();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sheet = useSheet();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Single-key shortcuts for desktop: g garage, a add, 1 to 5 the vehicle's sections.
  useEffect(() => {
    if (!desktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || paletteOpen || document.querySelector('dialog[open]')) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const m = /^\/vehicles\/([^/]+)/.exec(location.pathname);
      const vid = m && m[1] !== 'new' ? m[1] : recallVehicle();
      if (e.key === 'g') navigate('/');
      else if (e.key === 'a') sheet.open('log', vid ? { v: vid } : {});
      else if (m && m[1] !== 'new' && /^[1-5]$/.test(e.key)) navigate(`/vehicles/${m[1]}${['', '/glovebox', '/service', '/issues', '/odometer'][Number(e.key) - 1]}`);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desktop, location.pathname, navigate, paletteOpen, sheet]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {session.mode === 'demo' && (
        <p className="demo-banner" role="note">
          Demo mode: sample data, saved only in this browser.
        </p>
      )}
      <div className="shell__body">
        {desktop && <Sidebar onSearch={() => setPaletteOpen(true)} />}
        <main id="main" className="shell__main">
          <Outlet />
        </main>
      </div>
      <SheetHost />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
