// Calendar-date helpers. Dates are plain "YYYY-MM-DD" strings (no time zone), so day arithmetic
// is done in UTC to stay immune to daylight-saving shifts.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

function utc(iso: string): number {
  const [y, m, d] = parts(iso);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from `b` to `a` (a - b). Positive when `a` is later. */
export function diffDays(a: string, b: string): number {
  return Math.round((utc(a) - utc(b)) / DAY_MS);
}

export function addDays(iso: string, n: number): string {
  const t = new Date(utc(iso) + n * DAY_MS);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

/** Adds calendar months, clamping to the end of a shorter month (31 Aug + 6 months = 28 Feb). */
export function addMonths(iso: string, n: number): string {
  const [y, m, d] = parts(iso);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total % 12;
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return `${ny}-${String(nm + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}

/** "14 Sep 2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "14 Sep", or "14 Sep 2025" when it is not in the same year as `today`. */
export function formatDateShort(iso: string, today: string = todayISO()): string {
  const [y, m, d] = parts(iso);
  return y === parts(today)[0] ? `${d} ${MONTHS[m - 1]}` : `${d} ${MONTHS[m - 1]} ${y}`;
}

function plural(n: number, one: string, many: string = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** "today", "yesterday", "3 weeks ago", "5 months ago" */
export function ago(iso: string, today: string = todayISO()): string {
  const days = diffDays(today, iso);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${plural(Math.round(days / 7), 'week')} ago`;
  if (days < 730) return `${plural(Math.round(days / 30.4), 'month')} ago`;
  return `${plural(Math.round(days / 365), 'year')} ago`;
}

/** "in 18 days", "tomorrow", "today" for a non-negative gap in days. */
export function inDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function pastDays(days: number): string {
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
