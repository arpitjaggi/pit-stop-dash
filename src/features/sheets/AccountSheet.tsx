import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/auth/session';
import { Button, Notice } from '@/ui/atoms';
import { SignOut, ArrowCounterClockwise } from '@/ui/icons';
import { useSheet } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { ThemeToggle } from '@/ui/theme';

export function AccountSheet() {
  const session = useSession();
  const sheet = useSheet();
  const qc = useQueryClient();
  return (
    <Sheet title="Account">
      <div className="stack">
        <div className="stack stack--tight">
          <p className="field__label">Appearance</p>
          <ThemeToggle />
        </div>
        {session.mode === 'demo' ? (
          <Notice>Demo mode. Everything here is sample data, saved only in this browser.</Notice>
        ) : (
          <p className="t-body">
            Signed in as <strong>{session.email}</strong>
          </p>
        )}
        {session.resetDemo && (
          <Button
            variant="secondary"
            onClick={async () => {
              qc.clear();
              sheet.close();
              await session.resetDemo?.();
            }}
          >
            <ArrowCounterClockwise size={18} aria-hidden /> Reset demo data
          </Button>
        )}
        <Button variant="secondary" onClick={() => session.signOut()}>
          <SignOut size={18} aria-hidden /> {session.mode === 'demo' ? 'Leave demo' : 'Sign out'}
        </Button>
      </div>
    </Sheet>
  );
}
