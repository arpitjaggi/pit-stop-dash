import { Button } from '@/ui/atoms';

/** Shown when no Supabase project is configured: be honest about it and offer the demo. */
export function DemoGate({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="gate" id="main">
      <div className="gate__brand">
        <p className="gate__word">Pit Stop Dash</p>
        <h1 className="t-display gate__promise">Everything you need to know about your vehicles, in one place.</h1>
      </div>
      <div className="gate__form">
        <h2 className="t-section">No backend connected</h2>
        <p className="t-body t-ink-2">
          This copy of the app is not linked to a Supabase project yet, so there is nowhere private to keep real vehicles. Follow the README to
          connect one, or explore with sample data that lives only in this browser.
        </p>
        <Button variant="primary" block onClick={onEnter}>
          Explore the demo
        </Button>
      </div>
    </main>
  );
}
