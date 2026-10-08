import { useEffect, useState } from 'react';
import { useApi } from '@/data/api';
import { useDisconnectTelegram, useGarage, useReminderSettings, useSaveReminderSettings, useTelegramLink, useTestReminder } from '@/data/hooks';
import { useSession } from '@/auth/session';
import { TELEGRAM_BOT } from '@/env';
import { formatDateShort, todayISO } from '@/lib/dates';
import { DEFAULT_LEADS, LEAD_OPTIONS, upcomingReminders } from '@/lib/reminders';
import { Button, Notice, friendlyError } from '@/ui/atoms';
import { EnvelopeSimple, PaperPlaneTilt, TelegramLogo } from '@/ui/icons';
import { Sheet } from '@/ui/Sheet';

/** Where and when to be told that insurance, PUC or a CNG test is running out. */
export function ReminderSheet() {
  const api = useApi();
  const session = useSession();
  const { bundles } = useGarage();
  const [waiting, setWaiting] = useState(false);
  const settings = useReminderSettings(waiting);
  const save = useSaveReminderSettings();
  const link = useTelegramLink();
  const disconnect = useDisconnectTelegram();
  const test = useTestReminder();
  const [error, setError] = useState<string | null>(null);
  const today = todayISO();

  const s = settings.data;
  const emailOn = s?.email_enabled ?? false;
  const telegramOn = (s?.telegram_enabled ?? false) && Boolean(s?.telegram_connected);
  const leads = s?.lead_days ?? DEFAULT_LEADS;

  useEffect(() => {
    if (waiting && s?.telegram_connected) setWaiting(false);
  }, [waiting, s?.telegram_connected]);

  if (!api.remindersAvailable) {
    return (
      <Sheet title="Reminders">
        <Notice>Reminders need a signed-in account. The demo has nowhere to send them from.</Notice>
      </Sheet>
    );
  }

  async function change(patch: Parameters<typeof save.mutateAsync>[0]) {
    setError(null);
    try {
      await save.mutateAsync(s ? patch : { lead_days: DEFAULT_LEADS, ...patch });
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  async function connect() {
    setError(null);
    try {
      const token = await link.mutateAsync();
      setWaiting(true);
      window.open(`https://t.me/${TELEGRAM_BOT}?start=${token}`, '_blank', 'noopener');
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  function toggleLead(days: number) {
    const next = leads.includes(days) ? leads.filter((d) => d !== days) : [...leads, days];
    if (next.length === 0) return;
    void change({ lead_days: next.sort((a, b) => b - a) });
  }

  const upcoming = upcomingReminders([...bundles.values()], leads, today).slice(0, 4);
  const result = test.data;

  return (
    <Sheet title="Reminders">
      <div className="stack">
        <p className="t-ink-2">A message before your insurance, PUC or CNG hydro-test runs out, so the date never catches you out.</p>

        <section className="stack stack--tight" aria-labelledby="rem-where">
          <h3 className="field__label" id="rem-where">Where to send them</h3>

          <div className="rem-row">
            <EnvelopeSimple size={22} aria-hidden />
            <div className="rem-row__text">
              <span className="rem-row__title">Email</span>
              <span className="t-ink-3 rem-row__sub">{session.email ?? 'Your account email'}</span>
            </div>
            <label className="toggle">
              <input type="checkbox" role="switch" checked={emailOn} disabled={save.isPending} onChange={(e) => change({ email_enabled: e.target.checked })} />
              <span className="toggle__track" aria-hidden="true" />
              <span className="sr-only">Email reminders</span>
            </label>
          </div>

          <div className="rem-row">
            <TelegramLogo size={22} aria-hidden />
            <div className="rem-row__text">
              <span className="rem-row__title">Telegram</span>
              <span className="t-ink-3 rem-row__sub">
                {!TELEGRAM_BOT
                  ? 'Not set up for this app yet. See the README.'
                  : s?.telegram_connected
                    ? 'Connected'
                    : waiting
                      ? 'Press Start in Telegram, then come back here.'
                      : 'Free and instant. One tap to link.'}
              </span>
            </div>
            {TELEGRAM_BOT && s?.telegram_connected ? (
              <label className="toggle">
                <input type="checkbox" role="switch" checked={telegramOn} disabled={save.isPending} onChange={(e) => change({ telegram_enabled: e.target.checked })} />
                <span className="toggle__track" aria-hidden="true" />
                <span className="sr-only">Telegram reminders</span>
              </label>
            ) : (
              TELEGRAM_BOT && (
                <Button variant="secondary" busy={link.isPending} onClick={connect}>
                  {waiting ? 'Open again' : 'Connect'}
                </Button>
              )
            )}
          </div>
          {s?.telegram_connected && (
            <button type="button" className="linkbtn rem-disconnect" onClick={() => disconnect.mutate()}>
              Disconnect Telegram
            </button>
          )}
        </section>

        <fieldset className="choice">
          <legend className="field__label">When</legend>
          <div className="choice__set">
            {LEAD_OPTIONS.map((o) => (
              <label key={o.days} className="choice__opt">
                <input type="checkbox" checked={leads.includes(o.days)} onChange={() => toggleLead(o.days)} />
                <span className="choice__face"><span className="choice__label">{o.label}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className="stack stack--tight" aria-labelledby="rem-next">
          <h3 className="field__label" id="rem-next">Coming up</h3>
          {upcoming.length === 0 ? (
            <p className="t-ink-2">Nothing yet. Add insurance, PUC or a CNG certificate with its date to the Glovebox and it will be watched.</p>
          ) : (
            <ul className="rem-next">
              {upcoming.map((u) => (
                <li key={u.key}>
                  <span className="rem-next__date fig fig-s">{u.remindOn === today ? 'Today' : formatDateShort(u.remindOn, today)}</span>
                  <span>{u.vehicleName}: {u.doc} {u.doc === 'CNG hydro-test' ? 'is due' : 'expires'} {formatDateShort(u.expiresOn, today)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && <Notice tone="error">{error}</Notice>}

        <div className="stack stack--tight">
          <Button variant="secondary" busy={test.isPending} disabled={!emailOn && !telegramOn} onClick={() => test.mutate(undefined, { onError: (e) => setError(friendlyError(e)) })}>
            <PaperPlaneTilt size={18} aria-hidden /> Send a test message
          </Button>
          {result && (
            <p className="t-ink-2" role="status">
              Email: {result.email}. Telegram: {result.telegram}.
            </p>
          )}
        </div>
      </div>
    </Sheet>
  );
}
