// The product's brain: turns raw records into plain-language status.
// Pure functions of (data, today) so every claim the interface makes can be tested.

import {
  type DocType,
  type Issue,
  type ServiceRecord,
  type VDocument,
  type Vehicle,
  type VehicleBundle,
  DOC_TYPES,
  docTypeLabel,
} from '@/data/types';
import { addMonths, diffDays, formatDate, formatDateShort, inDays, pastDays } from './dates';
import { formatKm } from './format';

/** A date within this many days counts as "due soon". */
export const SOON_DAYS = 30;
/** Beyond this many days we show a date ("Valid until 14 Mar 2027") instead of "in 80 days". */
export const LONG_RANGE_DAYS = 60;
/** An odometer reading older than this is too old to present distance claims as exact. */
export const STALE_READING_DAYS = 21;

export type Severity = 'overdue' | 'soon' | 'info' | 'clear' | 'neutral';
export type Tab = 'overview' | 'glovebox' | 'service' | 'issues' | 'odometer';

const WARRANTY_TYPES = new Set<DocType>(['warranty', 'extended_warranty', 'accessory_warranty']);
/** Types of which only the latest is "current"; older ones are history. */
const SINGLE_CURRENT = new Set<DocType>(['rc', 'insurance', 'puc', 'cng_certificate']);

/** How urgent a kind of thing is when two are equally pressing. */
const ORDER: Record<string, number> = {
  insurance: 0,
  puc: 1,
  service: 2,
  cng_certificate: 3,
  warranty: 4,
  extended_warranty: 5,
  accessory_warranty: 6,
  other: 7,
  rc: 8,
};

export const docLabel = (d: Pick<VDocument, 'doc_type' | 'title'>) => d.title?.trim() || docTypeLabel(d.doc_type);

// ------------------------------------------------------------------ documents

export interface DocStatus {
  state: 'expired' | 'soon' | 'valid' | 'permanent' | 'ended';
  severity: Severity;
  days: number | null;
  /** Short status for a row: "Expires in 18 days", "Valid until 14 Mar 2027", "Permanent document". */
  label: string;
}

export function documentStatus(doc: VDocument, today: string): DocStatus {
  if (!doc.expires_on) {
    return {
      state: 'permanent',
      severity: 'clear',
      days: null,
      label: doc.doc_type === 'rc' ? 'Permanent document' : 'No expiry date',
    };
  }
  const days = diffDays(doc.expires_on, today);
  if (days < 0) {
    const ago = -days;
    const when = ago <= LONG_RANGE_DAYS ? pastDays(ago) : `on ${formatDate(doc.expires_on)}`;
    if (WARRANTY_TYPES.has(doc.doc_type)) {
      // A warranty running out is normal, not a problem.
      return { state: 'ended', severity: 'neutral', days, label: `Ended ${when}` };
    }
    return { state: 'expired', severity: 'overdue', days, label: `Expired ${when}` };
  }
  if (days <= SOON_DAYS) return { state: 'soon', severity: 'soon', days, label: `Expires ${inDays(days)}` };
  if (days <= LONG_RANGE_DAYS) return { state: 'valid', severity: 'clear', days, label: `Expires ${inDays(days)}` };
  return { state: 'valid', severity: 'clear', days, label: `Valid until ${formatDate(doc.expires_on)}` };
}

/** Splits a vehicle's documents into what is in force now and what has been superseded. */
export function splitCurrentAndHistory(docs: VDocument[], today: string): { current: VDocument[]; history: VDocument[] } {
  const current: VDocument[] = [];
  const history: VDocument[] = [];
  const byType = new Map<DocType, VDocument[]>();
  for (const d of docs) {
    if (SINGLE_CURRENT.has(d.doc_type)) {
      byType.set(d.doc_type, [...(byType.get(d.doc_type) ?? []), d]);
    } else if (documentStatus(d, today).state === 'ended') {
      history.push(d);
    } else {
      current.push(d);
    }
  }
  for (const group of byType.values()) {
    const sorted = [...group].sort(newestFirst);
    current.push(sorted[0]);
    history.push(...sorted.slice(1));
  }
  history.sort(newestFirst);
  return { current: sortByUrgency(current, today), history };
}

function newestFirst(a: VDocument, b: VDocument): number {
  const ea = a.expires_on ?? '9999-12-31';
  const eb = b.expires_on ?? '9999-12-31';
  if (ea !== eb) return ea < eb ? 1 : -1;
  const ia = a.issued_on ?? '';
  const ib = b.issued_on ?? '';
  if (ia !== ib) return ia < ib ? 1 : -1;
  return a.created_at < b.created_at ? 1 : -1;
}

const sevRank = (s: Severity) => (s === 'overdue' ? 0 : s === 'soon' ? 1 : 2);

export function sortByUrgency(docs: VDocument[], today: string): VDocument[] {
  return [...docs].sort((a, b) => {
    const sa = documentStatus(a, today);
    const sb = documentStatus(b, today);
    if (sevRank(sa.severity) !== sevRank(sb.severity)) return sevRank(sa.severity) - sevRank(sb.severity);
    if (sevRank(sa.severity) < 2) return (sa.days ?? 0) - (sb.days ?? 0);
    return (ORDER[a.doc_type] ?? 9) - (ORDER[b.doc_type] ?? 9);
  });
}

// ------------------------------------------------------------------ odometer freshness

export function readingAgeDays(vehicle: Vehicle, today: string): number | null {
  return vehicle.odometer_read_on ? diffDays(today, vehicle.odometer_read_on) : null;
}

export function isReadingStale(vehicle: Vehicle, today: string): boolean {
  const age = readingAgeDays(vehicle, today);
  return age !== null && age > STALE_READING_DAYS;
}

// ------------------------------------------------------------------ service schedule

export interface ServiceSchedule {
  last: ServiceRecord | null;
  intervalKm: number | null;
  intervalMonths: number | null;
  nextKm: number | null;
  nextDate: string | null;
  kmRemaining: number | null;
  daysRemaining: number | null;
  state: 'unknown' | 'ok' | 'soon' | 'overdue';
  /** Which limit is the one that arrives first (or has already passed). */
  binding: 'km' | 'date' | null;
  stale: boolean;
  readingOn: string | null;
}

export function latestService(services: ServiceRecord[]): ServiceRecord | null {
  if (services.length === 0) return null;
  return [...services].sort((a, b) =>
    a.serviced_on !== b.serviced_on ? (a.serviced_on < b.serviced_on ? 1 : -1) : a.created_at < b.created_at ? 1 : -1,
  )[0];
}

export function serviceSchedule(vehicle: Vehicle, services: ServiceRecord[], today: string): ServiceSchedule {
  const last = latestService(services);
  const intervalKm = vehicle.service_interval_km;
  const intervalMonths = vehicle.service_interval_months;
  const stale = isReadingStale(vehicle, today);
  const base: ServiceSchedule = {
    last,
    intervalKm,
    intervalMonths,
    nextKm: null,
    nextDate: null,
    kmRemaining: null,
    daysRemaining: null,
    state: 'unknown',
    binding: null,
    stale,
    readingOn: vehicle.odometer_read_on,
  };
  if (!last) return base;

  const nextKm = intervalKm && last.odometer_km != null ? last.odometer_km + intervalKm : null;
  const nextDate = intervalMonths ? addMonths(last.serviced_on, intervalMonths) : null;
  const kmRemaining = nextKm != null && vehicle.current_odometer_km != null ? nextKm - vehicle.current_odometer_km : null;
  const daysRemaining = nextDate ? diffDays(nextDate, today) : null;
  if (kmRemaining == null && daysRemaining == null) return { ...base, nextKm, nextDate };

  const kmOver = kmRemaining != null && kmRemaining < 0;
  const dateOver = daysRemaining != null && daysRemaining < 0;
  const kmSoon = kmRemaining != null && intervalKm != null && kmRemaining <= Math.max(500, intervalKm * 0.1);
  const dateSoon = daysRemaining != null && daysRemaining <= SOON_DAYS;

  const state = kmOver || dateOver ? 'overdue' : kmSoon || dateSoon ? 'soon' : 'ok';

  let binding: 'km' | 'date';
  if (kmOver) binding = 'km';
  else if (dateOver) binding = 'date';
  else if (kmRemaining == null) binding = 'date';
  else if (daysRemaining == null) binding = 'km';
  else {
    const kmFrac = kmRemaining / (intervalKm as number);
    const dateFrac = daysRemaining / ((intervalMonths as number) * 30.44);
    binding = kmFrac <= dateFrac ? 'km' : 'date';
  }
  return { ...base, nextKm, nextDate, kmRemaining, daysRemaining, state, binding };
}

const basedOn = (s: ServiceSchedule) =>
  s.stale && s.readingOn ? `, based on your reading from ${formatDateShort(s.readingOn)}` : '';

/** "Service due in 740 km." etc. Honest about stale odometer readings (the Freshness Rule). */
export function serviceSentence(s: ServiceSchedule): string | null {
  if (s.state === 'unknown' || !s.binding) return null;
  if (s.binding === 'km' && s.kmRemaining != null) {
    const about = s.stale ? 'about ' : '';
    if (s.kmRemaining > 0) return `Service due in ${about}${formatKm(s.kmRemaining)}${basedOn(s)}.`;
    if (s.kmRemaining === 0) return `Service due now${basedOn(s)}.`;
    return `Service overdue by ${about}${formatKm(-s.kmRemaining)}${basedOn(s)}.`;
  }
  const d = s.daysRemaining as number;
  if (d > 0) return `Service due ${inDays(d)}.`;
  if (d === 0) return 'Service due today.';
  return d >= -LONG_RANGE_DAYS ? `Service was due ${pastDays(-d)}.` : `Service was due on ${formatDate(s.nextDate as string)}.`;
}

/** The calm version for the all-clear state: "Service in 2,340 km." */
function serviceNextUp(s: ServiceSchedule): string | null {
  if (s.state !== 'ok' || !s.binding) return null;
  if (s.binding === 'km' && s.kmRemaining != null) {
    return `Service in ${s.stale ? 'about ' : ''}${formatKm(s.kmRemaining)}${basedOn(s)}.`;
  }
  const d = s.daysRemaining as number;
  return d <= LONG_RANGE_DAYS ? `Service ${inDays(d)}.` : `Service by ${formatDate(s.nextDate as string)}.`;
}

// ------------------------------------------------------------------ attention and the Pit Board

export interface AttentionItem {
  id: string;
  /** 1 expired/overdue, 2 expiring soon, 3 service due, 4 open issues. */
  tier: 1 | 2 | 3 | 4;
  severity: Severity;
  sentence: string;
  tab: Tab;
  docId?: string;
  order: number;
}

export function openIssues(issues: Issue[]): Issue[] {
  return issues.filter((i) => i.status === 'open').sort((a, b) => (a.added_on < b.added_on ? -1 : a.added_on > b.added_on ? 1 : 0));
}

export function attentionItems(b: VehicleBundle, today: string): AttentionItem[] {
  const items: AttentionItem[] = [];
  const { current } = splitCurrentAndHistory(b.documents, today);

  for (const d of current) {
    const st = documentStatus(d, today);
    const name = docLabel(d);
    if (st.state === 'expired') {
      const ago = -(st.days as number);
      items.push({
        id: `doc-${d.id}`,
        tier: 1,
        severity: 'overdue',
        sentence: ago <= LONG_RANGE_DAYS ? `${name} expired ${pastDays(ago)}.` : `${name} expired on ${formatDate(d.expires_on as string)}.`,
        tab: 'glovebox',
        docId: d.id,
        order: ORDER[d.doc_type] ?? 9,
      });
    } else if (st.state === 'soon') {
      items.push({
        id: `doc-${d.id}`,
        tier: 2,
        severity: 'soon',
        sentence: `${name} expires ${inDays(st.days as number)}.`,
        tab: 'glovebox',
        docId: d.id,
        order: ORDER[d.doc_type] ?? 9,
      });
    }
  }

  const sched = serviceSchedule(b.vehicle, b.services, today);
  const sentence = serviceSentence(sched);
  if (sentence && (sched.state === 'overdue' || sched.state === 'soon')) {
    items.push({
      id: 'service',
      tier: sched.state === 'overdue' ? 1 : 3,
      severity: sched.state === 'overdue' ? 'overdue' : 'soon',
      sentence,
      tab: 'service',
      order: ORDER.service,
    });
  }

  const open = openIssues(b.issues);
  if (open.length > 0) {
    items.push({
      id: 'issues',
      tier: 4,
      severity: 'info',
      sentence: `${open.length} ${open.length === 1 ? 'thing' : 'things'} to tell the workshop.`,
      tab: 'issues',
      order: 0,
    });
  }

  return items.sort((a, b) => a.tier - b.tier || a.order - b.order);
}

export interface PitBoard {
  kind: 'attention' | 'clear' | 'empty';
  sentence: string;
  severity: Severity;
  /** Where tapping the sentence should lead. */
  tab: Tab;
  items: AttentionItem[];
  /** Number of further items beyond the one shown. */
  more: number;
  /** True when a distance claim leans on an old reading, so "Update odometer" should be offered. */
  needsOdometer: boolean;
}

export function pitBoard(b: VehicleBundle, today: string): PitBoard {
  const items = attentionItems(b, today);
  const sched = serviceSchedule(b.vehicle, b.services, today);
  const needsOdometer = sched.state !== 'unknown' && sched.binding === 'km' && sched.stale;

  if (items.length > 0) {
    const top = items[0];
    return { kind: 'attention', sentence: top.sentence, severity: top.severity, tab: top.tab, items, more: items.length - 1, needsOdometer };
  }

  if (b.documents.length === 0 && b.services.length === 0) {
    return {
      kind: 'empty',
      sentence: 'Nothing tracked yet. Put the insurance and PUC in the Glovebox.',
      severity: 'neutral',
      tab: 'glovebox',
      items,
      more: 0,
      needsOdometer,
    };
  }

  const next = nextUp(b, sched, today);
  return {
    kind: 'clear',
    sentence: next ? `All clear. ${next.sentence}` : 'All clear.',
    severity: 'clear',
    tab: next?.tab ?? 'overview',
    items,
    more: 0,
    needsOdometer,
  };
}

function nextUp(b: VehicleBundle, sched: ServiceSchedule, today: string): { sentence: string; tab: Tab } | null {
  const { current } = splitCurrentAndHistory(b.documents, today);
  const dated = current
    .map((d) => ({ d, st: documentStatus(d, today) }))
    .filter((x) => x.st.days !== null && x.st.days >= 0)
    .sort((a, b2) => (a.st.days as number) - (b2.st.days as number));
  const soonest = dated[0];
  if (soonest && (soonest.st.days as number) <= LONG_RANGE_DAYS) {
    return { sentence: `${docLabel(soonest.d)} expires ${inDays(soonest.st.days as number)}.`, tab: 'glovebox' };
  }
  const svc = serviceNextUp(sched);
  if (svc) return { sentence: svc, tab: 'service' };
  if (soonest) return { sentence: `${docLabel(soonest.d)} valid until ${formatDate(soonest.d.expires_on as string)}.`, tab: 'glovebox' };
  return null;
}

// ------------------------------------------------------------------ coming up

export interface UpcomingItem {
  id: string;
  title: string;
  detail: string;
  tab: Tab;
  /** Days away, when known; service items measured in distance have none. */
  days: number | null;
}

/** Dated things still ahead, nearest first. Items already flagged as attention are included too. */
export function upcomingItems(b: VehicleBundle, today: string, limit = 5): UpcomingItem[] {
  const out: UpcomingItem[] = [];
  const { current } = splitCurrentAndHistory(b.documents, today);
  for (const d of current) {
    const st = documentStatus(d, today);
    if (st.days === null || st.days < 0) continue;
    out.push({ id: d.id, title: docLabel(d), detail: st.label, tab: 'glovebox', days: st.days });
  }
  const sched = serviceSchedule(b.vehicle, b.services, today);
  if (sched.state !== 'unknown' && sched.state !== 'overdue') {
    const parts: string[] = [];
    if (sched.nextKm != null) parts.push(`at ${formatKm(sched.nextKm)}`);
    if (sched.nextDate) parts.push(`by ${formatDate(sched.nextDate)}`);
    out.push({
      id: 'service',
      title: 'Next service',
      detail: parts.join(' or '),
      tab: 'service',
      days: sched.daysRemaining,
    });
  }
  out.sort((a, b2) => (a.days ?? 9999) - (b2.days ?? 9999));
  return out.slice(0, limit);
}

// ------------------------------------------------------------------ helpers

export function groupByVehicle(
  vehicles: Vehicle[],
  documents: VDocument[],
  issues: Issue[],
  services: ServiceRecord[],
): Map<string, VehicleBundle> {
  const map = new Map<string, VehicleBundle>();
  for (const v of vehicles) map.set(v.id, { vehicle: v, documents: [], issues: [], services: [] });
  for (const d of documents) map.get(d.vehicle_id)?.documents.push(d);
  for (const i of issues) map.get(i.vehicle_id)?.issues.push(i);
  for (const s of services) map.get(s.vehicle_id)?.services.push(s);
  return map;
}

/** Guess a document type from a file name ("RC_book.pdf", "insurance-2026.pdf"). */
export function guessDocType(fileName: string): DocType | null {
  const n = fileName.toLowerCase();
  if (/\bpuc\b|pollution/.test(n)) return 'puc';
  if (/insur|policy/.test(n)) return 'insurance';
  if (/extended/.test(n)) return 'extended_warranty';
  if (/warranty/.test(n)) return 'warranty';
  if (/\bcng\b/.test(n)) return 'cng_certificate';
  if (/(^|[^a-z])rc([^a-z]|$)|registration/.test(n)) return 'rc';
  return null;
}

export const DOC_TYPE_ORDER = DOC_TYPES.map((d) => d.value);
