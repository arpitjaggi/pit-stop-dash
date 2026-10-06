import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FlagMark } from '@/ui/FlagMark';
import { Button, Field, Input, Notice } from '@/ui/atoms';

type Mode = 'in' | 'up';

export function SignIn({ client }: { client: SupabaseClient }) {
  const [mode, setMode] = useState<Mode>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const { data, error: err } =
      mode === 'in'
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (err) setError(err.message);
    else if (mode === 'up' && !data.session) setInfo('Check your email to confirm your account, then sign in.');
  }

  async function magic() {
    if (!email) return setError('Enter your email first and we will send you a link.');
    setBusy(true);
    setError(null);
    const { error: err } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (err) setError(err.message);
    else setInfo('Link sent. Open it on this device to sign in.');
  }

  return (
    <main className="gate" id="main">
      <div className="gate__brand">
        <p className="gate__word">
          <FlagMark size={36} />
          <span className="gate__name">
            Pit Stop
            <span className="gate__sub">Vehicle Management Portal</span>
          </span>
        </p>
        <h1 className="t-display gate__promise">Everything you need to know about your vehicles, in one place.</h1>
      </div>
      <form className="gate__form" onSubmit={submit}>
        <h2 className="t-section">{mode === 'in' ? 'Sign in' : 'Create your account'}</h2>
        <Field label="Email">
          {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}
        </Field>
        <Field label="Password" hint={mode === 'up' ? 'At least 8 characters.' : undefined}>
          {(p) => (
            <Input {...p} type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={mode === 'up' ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice>{info}</Notice>}
        <Button variant="primary" type="submit" block busy={busy}>
          {mode === 'in' ? 'Sign in' : 'Create account'}
        </Button>
        <div className="gate__alt">
          <Button variant="ghost" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
            {mode === 'in' ? 'Create an account' : 'I already have an account'}
          </Button>
          <Button variant="ghost" onClick={magic} disabled={busy}>
            Email me a sign-in link
          </Button>
        </div>
      </form>
    </main>
  );
}
