import { useRef, useState } from 'react';
import { useAddIssue, useUpdateIssue } from '@/data/hooks';
import type { Issue } from '@/data/types';
import { ago, todayISO } from '@/lib/dates';
import { openIssues } from '@/lib/status';
import { Button, EmptyState, Input } from '@/ui/atoms';
import { ArrowCounterClockwise, Check, ListChecks, PencilSimple } from '@/ui/icons';
import { useSheet, useToast } from '@/ui/hooks';
import { useVehicleBundle } from './useVehicleBundle';

export function IssuesTab() {
  const { vehicle: v, issues } = useVehicleBundle();
  const sheet = useSheet();
  const toast = useToast();
  const add = useAddIssue();
  const update = useUpdateIssue();
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const today = todayISO();
  const open = openIssues(issues);
  const resolved = issues.filter((i) => i.status === 'resolved').sort((a, b) => ((b.resolved_on ?? '') > (a.resolved_on ?? '') ? 1 : -1));

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    const description = text.trim();
    if (!description) return;
    add.mutate({ vehicle_id: v.id, description });
    setText('');
    toast("Noted. It'll be on the list for your next service.");
    input.current?.focus();
  }

  const resolve = (i: Issue) => {
    update.mutate({ id: i.id, patch: { status: 'resolved', resolved_on: today } });
    toast('Marked as resolved.', { undo: () => update.mutate({ id: i.id, patch: { status: 'open', resolved_on: null, resolved_in_service_id: null } }) });
  };

  return (
    <div className="issues">
      <section className="block">
        <h2 className="t-section">Known issues</h2>
        <form className="quickadd" onSubmit={quickAdd}>
          <label className="sr-only" htmlFor="quick-issue">What did you notice?</label>
          <Input id="quick-issue" ref={input} enterKeyHint="done" autoComplete="off" placeholder="Something you noticed…" value={text} onChange={(e) => setText(e.target.value)} />
          <Button variant="primary" type="submit" disabled={!text.trim()}>Add</Button>
        </form>
        <Button variant="ghost" className="btn--inline" onClick={() => sheet.open('issue', { v: v.id })}>
          Add with detail or date
        </Button>
        <p className="t-ink-3 issues__hint">Open issues come up when you log your next service, and in the workshop list.</p>
      </section>

      <section className="block">
        {open.length > 0 && (
          <div className="issues__head">
            <h2 className="t-title">Open ({open.length})</h2>
            <Button variant="secondary" onClick={() => sheet.open('workshop', { v: v.id })}>
              <ListChecks size={18} aria-hidden /> Tell the workshop
            </Button>
          </div>
        )}
        {open.length === 0 ? (
          <EmptyState title="Nothing nagging you." body="When you notice a rattle, a noise or a scratch, add it here and it will be waiting when you book the next service." />
        ) : (
          <ul className="rows">
            {open.map((i) => (
              <li key={i.id} className="issue">
                <button type="button" className="issue__check" aria-label={`Mark resolved: ${i.description}`} onClick={() => resolve(i)}>
                  <Check size={16} aria-hidden />
                </button>
                <div className="issue__main">
                  <p className="issue__text">{i.description}</p>
                  {i.note && <p className="t-ink-2 issue__note">{i.note}</p>}
                  <p className="t-ink-3 issue__meta">Noticed {ago(i.added_on, today)}.</p>
                </div>
                <button type="button" className="icon-btn" aria-label={`Edit: ${i.description}`} onClick={() => sheet.open('issue', { v: v.id, id: i.id })}>
                  <PencilSimple size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <details className="block resolved">
          <summary className="t-title">Resolved ({resolved.length})</summary>
          <ul className="rows">
            {resolved.map((i) => (
              <li key={i.id} className="issue issue--resolved">
                <span className="issue__tick" aria-hidden="true"><Check size={14} /></span>
                <div className="issue__main">
                  <p className="issue__text">{i.description}</p>
                  <p className="t-ink-3 issue__meta">Resolved {i.resolved_on ? ago(i.resolved_on, today) : ''}</p>
                </div>
                <button type="button" className="icon-btn" aria-label={`Reopen: ${i.description}`} onClick={() => update.mutate({ id: i.id, patch: { status: 'open', resolved_on: null, resolved_in_service_id: null } })}>
                  <ArrowCounterClockwise size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
