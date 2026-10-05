import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSession } from '@/auth/session';
import { useDesktop } from '@/ui/hooks';
import { CommandPalette } from './CommandPalette';
import { SheetHost } from './SheetHost';
import { Sidebar } from './Sidebar';

export function Shell() {
  const desktop = useDesktop();
  const session = useSession();
  const [paletteOpen, setPaletteOpen] = useState(false);

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
