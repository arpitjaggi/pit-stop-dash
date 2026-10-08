import { useGarage } from '@/data/hooks';
import { ago, todayISO } from '@/lib/dates';
import { formatRegistration } from '@/lib/plate';
import { openIssues } from '@/lib/status';
import { Button } from '@/ui/atoms';
import { Copy, ShareNetwork } from '@/ui/icons';
import { useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle } from './common';

/** The things to tell the workshop, large enough to hold up at the service desk. */
export function WorkshopSheet() {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const toast = useToast();
  if (!v) return null;
  const issues = openIssues(bundles.get(v.id)?.issues ?? []);
  const today = todayISO();
  const heading = `${v.make} ${v.model}${v.registration_number ? ` (${formatRegistration(v.registration_number)})` : ''}`;
  const text = `${heading}: things to tell the workshop\n${issues.map((i, n) => `${n + 1}. ${i.description}${i.note ? ` (${i.note})` : ''}`).join('\n')}`;

  return (
    <Sheet
      title="Tell the workshop"
      footer={
        <>
          {typeof navigator.share === 'function' && (
            <Button variant="primary" block onClick={() => navigator.share({ title: 'For the workshop', text }).catch(() => undefined)}>
              <ShareNetwork size={18} aria-hidden /> Share this list
            </Button>
          )}
          <Button
            variant={typeof navigator.share === 'function' ? 'secondary' : 'primary'}
            block
            onClick={() => navigator.clipboard?.writeText(text).then(() => toast('Copied.'), () => toast('Could not copy.'))}
          >
            <Copy size={18} aria-hidden /> Copy as text
          </Button>
        </>
      }
    >
      <p className="t-ink-2">{heading}</p>
      {issues.length === 0 ? (
        <p className="t-body">Nothing to report. All clear.</p>
      ) : (
        <ol className="workshop">
          {issues.map((i, n) => (
            <li key={i.id}>
              <span className="workshop__n fig" aria-hidden="true">{n + 1}</span>
              <span>
                <span className="workshop__text">{i.description}</span>
                {i.note && <span className="workshop__note">{i.note}</span>}
                <span className="workshop__meta">Noticed {ago(i.added_on, today)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Sheet>
  );
}
