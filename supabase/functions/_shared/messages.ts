// The words of a reminder. Pure functions with no imports, so the app's tests can run them and the
// Edge Functions can share them. Plain sentences, no jokes: this is a warning.

export type ReminderDoc = 'insurance' | 'puc' | 'cng_certificate';

export interface ReminderInput {
  vehicleName: string;
  registration: string | null;
  docType: ReminderDoc;
  daysLeft: number;
  /** ISO date the document runs out, or the next test is due. */
  expiresOn: string;
  appUrl: string;
}

export interface Message {
  subject: string;
  text: string;
  html: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

const PLATE = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/;
export function formatPlate(reg: string): string {
  const m = PLATE.exec(reg.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  return m ? [m[1], m[2], m[3], m[4]].filter(Boolean).join(' ') : reg;
}

export function whenText(daysLeft: number): string {
  if (daysLeft <= 0) return 'today';
  if (daysLeft === 1) return 'tomorrow';
  return `in ${daysLeft} days`;
}

const NEXT_STEP: Record<ReminderDoc, string> = {
  insurance: 'Renew the policy, then upload the new one to the Glovebox so the dates update.',
  puc: 'Get a new PUC certificate at any testing centre, then upload it to the Glovebox.',
  cng_certificate: 'Book the hydro-test at a PESO-approved centre, then upload the new certificate to the Glovebox.',
};

export function docLabel(t: ReminderDoc): string {
  return t === 'insurance' ? 'insurance' : t === 'puc' ? 'PUC' : 'CNG hydro-test';
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function reminderSentence(i: ReminderInput): string {
  const who = i.registration ? `${i.vehicleName} (${formatPlate(i.registration)})` : i.vehicleName;
  const when = whenText(i.daysLeft);
  const date = i.daysLeft > 1 ? ` (${formatDate(i.expiresOn)})` : '';
  const verb = i.docType === 'cng_certificate' ? `is due ${when}` : `expires ${when}`;
  return `${who}: ${docLabel(i.docType)} ${verb}${date}.`;
}

export function reminderMessage(i: ReminderInput): Message {
  const sentence = reminderSentence(i);
  const step = NEXT_STEP[i.docType];
  const text = `${sentence}\n\n${step}\n\n${i.appUrl}`;
  const html = `<p style="font:16px/1.5 system-ui,sans-serif"><strong>${esc(sentence)}</strong></p><p style="font:16px/1.5 system-ui,sans-serif">${esc(step)}</p><p style="font:16px/1.5 system-ui,sans-serif"><a href="${esc(i.appUrl)}">Open Pit Stop</a></p>`;
  return { subject: sentence.replace(/\.$/, ''), text, html };
}

export function testMessage(appUrl: string): Message {
  const sentence = 'This is a test. Reminders from Pit Stop will arrive here.';
  return {
    subject: 'Pit Stop test reminder',
    text: `${sentence}\n\n${appUrl}`,
    html: `<p style="font:16px/1.5 system-ui,sans-serif"><strong>${esc(sentence)}</strong></p><p style="font:16px/1.5 system-ui,sans-serif"><a href="${esc(appUrl)}">Open Pit Stop</a></p>`,
  };
}

/** The date in India right now, as an ISO calendar date. The daily job counts days in IST. */
export function istDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
