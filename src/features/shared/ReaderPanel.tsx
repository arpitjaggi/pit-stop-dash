import { useState } from 'react';
import { Button, Field, Input, Notice, Spinner } from '@/ui/atoms';
import type { ReaderState } from './useDocumentReader';

/** What the reader is doing with the file, or what it needs from the owner. */
export function ReaderPanel({ state, onPassword }: { state: ReaderState; onPassword: (password: string) => void }) {
  const [password, setPassword] = useState('');

  if (state.phase === 'reading') {
    return (
      <div className="reader" role="status" aria-live="polite">
        <Spinner label="Reading the file" />
        <div className="reader__text">
          <span className="reader__stage">{state.stage}</span>
          <span className="t-ink-3 reader__note">Read on this device. The file is not sent anywhere to be read.</span>
          <span className="reader__track" aria-hidden="true">
            <span className="reader__fill" style={{ '--p': Math.max(0.04, state.fraction) } as React.CSSProperties} />
          </span>
        </div>
      </div>
    );
  }
  if (state.phase === 'password') {
    return (
      <div className="reader reader--ask">
        <Field
          label="This PDF is locked"
          error={state.wrong ? 'That password did not open it.' : undefined}
          hint="Insurers often use your date of birth (DDMMYYYY) or the registration number. The password is used once and not kept."
        >
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                // This sits inside the document form, so Enter unlocks instead of saving.
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (password) onPassword(password);
                }
              }}
            />
          )}
        </Field>
        <Button variant="secondary" disabled={!password} onClick={() => onPassword(password)}>Unlock and read</Button>
      </div>
    );
  }
  if (state.phase === 'failed') return <Notice>{state.reason}</Notice>;
  return null;
}
