// What the reminders will watch and when they will speak up. The same rules as the daily job in
// supabase/migrations/..._reminders.sql, so the preview in the app matches what arrives.

import type { DocType, VehicleBundle } from '@/data/types';
import { docTypeLabel } from '@/data/types';
import { addDays, diffDays } from './dates';
import { splitCurrentAndHistory } from './status';

export const REMINDER_DOCS: DocType[] = ['insurance', 'puc', 'cng_certificate'];
export const DEFAULT_LEADS = [30, 7, 1, 0];
export const LEAD_OPTIONS: { days: number; label: string }[] = [
  { days: 30, label: '30 days before' },
  { days: 14, label: '14 days before' },
  { days: 7, label: '7 days before' },
  { days: 1, label: 'The day before' },
  { days: 0, label: 'On the day' },
];

export interface ReminderPreview {
  key: string;
  vehicleId: string;
  vehicleName: string;
  doc: string;
  /** When the next message goes out. */
  remindOn: string;
  expiresOn: string;
}

/** The next message for each watched document: the first reminder date that is today or later. */
export function upcomingReminders(bundles: VehicleBundle[], leads: number[], today: string): ReminderPreview[] {
  const out: ReminderPreview[] = [];
  for (const b of bundles) {
    const watched = b.documents.filter((d) => REMINDER_DOCS.includes(d.doc_type) && d.expires_on);
    const { current } = splitCurrentAndHistory(watched, today);
    for (const d of current) {
      if (!d.expires_on || diffDays(d.expires_on, today) < 0) continue;
      const dates = leads.map((l) => addDays(d.expires_on as string, -l)).filter((x) => x >= today).sort();
      if (!dates.length) continue;
      out.push({
        key: d.id,
        vehicleId: b.vehicle.id,
        vehicleName: b.vehicle.model,
        doc: d.doc_type === 'cng_certificate' ? 'CNG hydro-test' : docTypeLabel(d.doc_type),
        remindOn: dates[0],
        expiresOn: d.expires_on,
      });
    }
  }
  return out.sort((a, b) => (a.remindOn < b.remindOn ? -1 : a.remindOn > b.remindOn ? 1 : 0));
}
