import { useState } from 'react';
import { useAddIssue, useDeleteIssue, useGarage, useUpdateIssue } from '@/data/hooks';
import { todayISO } from '@/lib/dates';
import { Button, Field, Input, TextArea } from '@/ui/atoms';
import { rememberVehicle, useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle } from './common';

export function IssueSheet() {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const sheet = useSheet();
  const toast = useToast();
  const add = useAddIssue();
  const update = useUpdateIssue();
  const del = useDeleteIssue();
  const today = todayISO();
  const existing = v && sheet.id ? (bundles.get(v.id)?.issues ?? []).find((i) => i.id === sheet.id) : undefined;
  const [description, setDescription] = useState(existing?.description ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(existing?.added_on ?? today);
  const [more, setMore] = useState(Boolean(existing));
  const [error, setError] = useState<string | null>(null);

  if (!v) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setError('Say what you noticed.');
    rememberVehicle(v!.id);
    try {
      if (existing) {
        await update.mutateAsync({ id: existing.id, patch: { description: description.trim(), note: note.trim() || null, added_on: date } });
        toast('Saved.');
      } else {
        await add.mutateAsync({ vehicle_id: v!.id, description, note: note.trim() || null, added_on: date });
        toast("Noted. It'll be on the list for your next service.");
      }
      sheet.close();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Sheet
      title={existing ? 'Edit issue' : 'Add an issue'}
      footer={
        <>
          <Button variant="primary" block type="submit" form="issue-form" busy={add.isPending || update.isPending}>
            {existing ? 'Save' : 'Add issue'}
          </Button>
          {existing && (
            <Button
              variant="ghost"
              block
              onClick={() => {
                del.mutate(existing.id);
                toast('Issue removed.');
                sheet.close();
              }}
            >
              Remove this issue
            </Button>
          )}
        </>
      }
    >
      <form id="issue-form" className="stack" onSubmit={save} noValidate>
        <p className="t-ink-2">{v.make} {v.model}</p>
        <Field label="What did you notice?" error={error}>
          {(p) => (
            <TextArea
              {...p}
              rows={3}
              autoFocus
              enterKeyHint="done"
              placeholder="AC makes a rattling noise"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
            />
          )}
        </Field>
        {more ? (
          <>
            <Field label="More detail">{(p) => <TextArea {...p} rows={2} placeholder="Only at low fan speed" value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
            <Field label="Noticed on">{(p) => <Input {...p} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value || today)} />}</Field>
          </>
        ) : (
          <Button variant="ghost" className="btn--inline" onClick={() => setMore(true)}>
            Add detail or date
          </Button>
        )}
      </form>
    </Sheet>
  );
}
