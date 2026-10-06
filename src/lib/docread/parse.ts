// Turns the text of an Indian vehicle document into suggested fields. Pure and forgiving: it never
// decides anything, it only suggests, and every suggestion says how sure it is. The owner's name,
// address, chassis and engine numbers are deliberately never picked up.

import type { DocType, FuelType, VehicleType } from '@/data/types';
import { addMonths } from '../dates';
import { MAKES } from '../makes';
import { normaliseRegistration } from '../plate';

export type Confidence = 'high' | 'low';
export interface Found<T> {
  value: T;
  confidence: Confidence;
  /** Why it is only a guess, when it is. */
  note?: string;
}

export interface ParsedVehicle {
  registration_number?: Found<string>;
  make?: Found<string>;
  model?: Found<string>;
  variant?: Found<string>;
  fuel_type?: Found<FuelType>;
  engine_cc?: Found<number>;
  registration_date?: Found<string>;
  colour_name?: Found<string>;
  vehicle_type?: Found<VehicleType>;
}

export interface ParsedDocument {
  doc_type?: Found<DocType>;
  issuer?: Found<string>;
  reference_number?: Found<string>;
  issued_on?: Found<string>;
  expires_on?: Found<string>;
  /** The registration number printed on the document, for checking it belongs to the right vehicle. */
  registration_number?: Found<string>;
  vehicle: ParsedVehicle;
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

const pad = (n: number) => String(n).padStart(2, '0');
function iso(y: number, m: number, d: number): string | null {
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCMonth() !== m - 1) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

interface DateHit {
  iso: string;
  index: number;
  end: number;
}

const DATE_RE = new RegExp(
  [
    String.raw`(\d{4})-(\d{2})-(\d{2})`, // 2026-10-24
    String.raw`(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{4})`, // 24/10/2026, day first as in India
    String.raw`(\d{1,2})(?:st|nd|rd|th)?[\s\-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-,.]*(\d{4})`, // 24 Oct 2026, 24-OCT-2026
    String.raw`(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})`, // Oct 24, 2026
  ].join('|'),
  'gi',
);

export function findDates(text: string): DateHit[] {
  const out: DateHit[] = [];
  for (const m of text.matchAll(DATE_RE)) {
    let d: string | null = null;
    if (m[1]) d = iso(+m[1], +m[2], +m[3]);
    else if (m[4]) d = iso(+m[6], +m[5], +m[4]);
    else if (m[7]) d = iso(+m[9], MONTHS[m[8].toLowerCase()], +m[7]);
    else if (m[10]) d = iso(+m[12], MONTHS[m[10].toLowerCase()], +m[11]);
    if (d) out.push({ iso: d, index: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }
  return out;
}

/** The first date soon after a label ("Valid upto: 24/10/2026"). */
function dateAfter(text: string, label: RegExp, reach = 70): string | null {
  const re = new RegExp(label.source, label.flags.includes('g') ? label.flags : `${label.flags}g`);
  for (const m of text.matchAll(re)) {
    const from = (m.index ?? 0) + m[0].length;
    const hit = findDates(text.slice(from, from + reach))[0];
    if (hit) return hit.iso;
  }
  return null;
}

/** A value after a label, to the end of the line, or the next line if the line ends at the label. */
function valueAfter(text: string, label: RegExp): string | null {
  const m = label.exec(text);
  if (!m) return null;
  let rest = text.slice(m.index + m[0].length).replace(/^[\s:.\-–—|]+/, (s) => (s.includes('\n') ? '\n' : ''));
  if (rest.startsWith('\n')) rest = rest.slice(1);
  const line = rest.split('\n')[0].trim();
  return line.length > 0 ? line : null;
}

const one = <T,>(value: T, confidence: Confidence = 'high', note?: string): Found<T> => ({ value, confidence, ...(note ? { note } : {}) });

// ---------------------------------------------------------------- what kind of document

const SIGNS: Record<'rc' | 'insurance' | 'puc' | 'cng_certificate', [RegExp, number][]> = {
  rc: [
    [/certificate\s+of\s+registration|registration\s+certificate/i, 3],
    [/\bregn?\.?\s*(?:no|date|validity)\b/i, 2],
    [/\bchassis\b/i, 1],
    [/\b(?:maker|manufacturer)\b/i, 1],
    [/\bowner\b/i, 1],
    [/\bcubic\s*cap/i, 2],
  ],
  insurance: [
    [/insurance/i, 1],
    [/policy\s*(?:no|number|schedule)/i, 2],
    [/\binsured\b/i, 1],
    [/\bIDV\b/, 2],
    [/\bpremium\b/i, 1],
    [/third[\s-]*party|own[\s-]*damage/i, 2],
  ],
  puc: [
    [/pollution\s*under\s*control/i, 3],
    [/\bPUCC?\b/, 2],
    [/emission/i, 1],
    [/\bCO\s*%|HC\s*\(?ppm/i, 2],
  ],
  cng_certificate: [
    [/hydro(?:static|[\s-]*test)?/i, 3],
    [/cylinder/i, 1],
    [/\bPESO\b/, 2],
    [/re-?test/i, 1],
  ],
};

export function detectDocType(text: string): Found<DocType> | undefined {
  const scores = (Object.keys(SIGNS) as (keyof typeof SIGNS)[]).map((k) => [k, SIGNS[k].reduce((n, [re, w]) => n + (re.test(text) ? w : 0), 0)] as const);
  scores.sort((a, b) => b[1] - a[1]);
  const [best, second] = scores;
  if (best[1] < 2 || best[1] === second[1]) return undefined;
  return one(best[0] as DocType, best[1] >= 4 && best[1] >= second[1] + 2 ? 'high' : 'low');
}

// ---------------------------------------------------------------- registration numbers

const PLATE_RE = /\b([A-Z]{2})[\s-]?(\d{1,2})[\s-]?([A-Z]{1,3})[\s-]?(\d{4})\b|\b(\d{2})[\s-]?(BH)[\s-]?(\d{4})[\s-]?([A-Z]{1,2})\b/g;

export function findRegistration(text: string): string | null {
  const upper = text.toUpperCase();
  for (const m of upper.matchAll(PLATE_RE)) {
    const joined = m[1] ? `${m[1]}${m[2]}${m[3]}${m[4]}` : `${m[5]}${m[6]}${m[7]}${m[8]}`;
    // Skip look-alikes such as a date that happens to fit (rare): the state code must be letters.
    if (m[1] && !STATES.has(m[1])) continue;
    return normaliseRegistration(joined);
  }
  return null;
}

const STATES = new Set('AN AP AR AS BR CH CG DD DL DN GA GJ HP HR JH JK KA KL LA LD MH ML MN MP MZ NL OD OR PB PY RJ SK TN TR TS TG UK UA UP WB'.split(' '));

// ---------------------------------------------------------------- insurance, PUC, CNG

const INSURERS: [RegExp, string][] = [
  [/bajaj\s+allianz/i, 'Bajaj Allianz'], [/hdfc\s+ergo/i, 'HDFC ERGO'], [/icici\s+lombard/i, 'ICICI Lombard'],
  [/new\s+india\s+assurance/i, 'New India Assurance'], [/united\s+india/i, 'United India Insurance'], [/oriental\s+insurance/i, 'Oriental Insurance'],
  [/national\s+insurance/i, 'National Insurance'], [/tata\s+aig/i, 'Tata AIG'], [/reliance\s+general/i, 'Reliance General'],
  [/sbi\s+general/i, 'SBI General'], [/go\s*digit|digit\s+general/i, 'Digit'], [/royal\s+sundaram/i, 'Royal Sundaram'],
  [/cholamandalam|chola\s+ms/i, 'Cholamandalam MS'], [/iffco[\s-]*tokio/i, 'IFFCO Tokio'], [/zurich\s+kotak/i, 'Zurich Kotak'],
  [/kotak\s+(?:mahindra\s+)?general/i, 'Kotak General'], [/liberty\s+general/i, 'Liberty General'], [/future\s+generali/i, 'Future Generali'],
  [/universal\s+sompo/i, 'Universal Sompo'], [/magma/i, 'Magma'], [/\backo\b/i, 'Acko'], [/navi\s+general/i, 'Navi General'],
  [/shriram\s+general/i, 'Shriram General'], [/bharti\s+axa/i, 'Bharti AXA'], [/raheja\s+qbe/i, 'Raheja QBE'], [/edelweiss/i, 'Edelweiss'],
  [/generali\s+central/i, 'Generali Central'], [/\bSBI\b.*insurance/i, 'SBI General'],
];

function clean(s: string | null, max = 60): string | null {
  if (!s) return null;
  const t = s.replace(/\s{2,}/g, ' ').replace(/[|_]+/g, ' ').trim().replace(/^[:.\-–—]+\s*/, '');
  if (t.length < 3) return null;
  return t.slice(0, max);
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (/\d/.test(w) || w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

function hasDigit(s: string | null | undefined): s is string {
  return Boolean(s && /\d/.test(s));
}

function refAfter(text: string, label: RegExp): string | null {
  const m = label.exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length, m.index + m[0].length + 60);
  const t = /^[\s:.\-#–—]*([A-Z0-9][A-Z0-9/\-]{4,29})/i.exec(rest)?.[1];
  return hasDigit(t) ? t.toUpperCase() : null;
}

/** "Period of insurance: from 25/10/2025 to 24/10/2026": the first two dates joined by "to". */
function findRange(text: string): { from: string; to: string } | null {
  const dates = findDates(text);
  for (let i = 0; i + 1 < dates.length; i++) {
    const between = text.slice(dates[i].end, dates[i + 1].index);
    const before = text.slice(Math.max(0, dates[i].index - 90), dates[i].index);
    if (between.length <= 45 && /\b(?:to|till|until|upto|up\s*to)\b|[-–—]/i.test(between) && /period|from|valid|cover|policy|insurance|w\.?e\.?f/i.test(before + between)) {
      return { from: dates[i].iso, to: dates[i + 1].iso };
    }
  }
  return null;
}

function parseInsurance(text: string, out: ParsedDocument) {
  const insurer = INSURERS.find(([re]) => re.test(text))?.[1];
  if (insurer) out.issuer = one(insurer);
  else {
    const m = /([A-Z][A-Za-z&.\s]{3,40}?(?:Insurance|Assurance)\s+(?:Company|Co\.?)(?:\s+(?:Limited|Ltd\.?))?)/.exec(text);
    const c = clean(m?.[1] ?? null);
    if (c) out.issuer = one(c, 'low');
  }
  const ref = refAfter(text, /policy\s*(?:no\.?|number|#)/i);
  if (ref) out.reference_number = one(ref);

  const range = findRange(text);
  if (range && range.to >= range.from) {
    out.issued_on = one(range.from);
    out.expires_on = one(range.to);
    return;
  }
  const to = dateAfter(text, /(?:date\s+of\s+)?expiry(?:\s+date)?|expires?(?:\s+on)?|valid\s*(?:till|upto|up\s*to|until)|to\s+midnight(?:\s+of)?|end\s+date/i);
  if (to) out.expires_on = one(to);
  const from = dateAfter(text, /(?:policy\s+)?(?:issue\s+date|date\s+of\s+issue|start\s+date|inception)|from(?:\s+date)?/i);
  if (from) out.issued_on = one(from);
}

function parsePuc(text: string, out: ParsedDocument) {
  const centre = clean(valueAfter(text, /(?:name\s+of\s+)?(?:testing\s*(?:centre|center|station)|puc\s*(?:centre|center)|centre\s*name|center\s*name)\s*[:\-]?/i));
  if (centre) out.issuer = one(centre);
  const ref = refAfter(text, /(?:puc\s*c?\s*(?:cert(?:ificate)?\.?\s*)?(?:no\.?|number)|certificate\s*(?:no\.?|number)|sl\.?\s*no\.?)/i);
  if (ref) out.reference_number = one(ref);
  const until = dateAfter(text, /valid\s*(?:till|upto|up\s*to|until)|(?:date\s+of\s+)?expiry|validity/i);
  const tested = dateAfter(text, /(?:date\s+of\s+)?(?:testing|test(?:ed)?(?:\s+on)?|issue)|test\s+date/i);
  if (until) out.expires_on = one(until);
  if (tested) out.issued_on = one(tested);
  if (!until || !tested) {
    const dates = findDates(text).map((d) => d.iso).sort();
    if (dates.length === 2 && !until && !tested) {
      out.issued_on = one(dates[0], 'low');
      out.expires_on = one(dates[1], 'low');
    }
  }
}

function parseCng(text: string, out: ParsedDocument) {
  const station = clean(valueAfter(text, /(?:cylinder\s+)?(?:testing\s*(?:station|centre|center)|tested\s+by|approved\s+(?:test(?:ing)?\s+)?(?:station|centre|center))\s*[:\-]?/i));
  if (station) out.issuer = one(station);
  const ref = refAfter(text, /(?:cylinder\s*(?:sl\.?|serial)\s*(?:no\.?|number)|certificate\s*(?:no\.?|number))/i);
  if (ref) out.reference_number = one(ref);
  const tested = dateAfter(text, /(?:hydro(?:static)?[\s-]*)?(?:date\s+of\s+)?(?:test(?:ing)?|re-?test)(?:\s+date)?(?!.*due)|hydro\s*test\s*date/i);
  const due = dateAfter(text, /next\s+(?:hydro\s*)?(?:test|due)|due\s+(?:date|on)|re-?test\s+due|valid\s*(?:till|upto|up\s*to|until)/i);
  if (tested) out.issued_on = one(tested);
  if (due) out.expires_on = one(due);
  else if (tested) out.expires_on = one(addMonths(tested, 36), 'low', 'Counted three years from the test date. The rule is every three years.');
}

// ---------------------------------------------------------------- the RC

const MAKE_ALIASES: [RegExp, string][] = [
  [/\bMARUTI\b/, 'Maruti Suzuki'], [/\bHERO\b/, 'Hero'], [/\bBAJAJ\b/, 'Bajaj'], [/\bTVS\b/, 'TVS'], [/\bROYAL\s+ENFIELD\b|\bEICHER\b/, 'Royal Enfield'],
  [/\bTATA\b/, 'Tata'], [/\bMAHINDRA\b/, 'Mahindra'], [/\bHYUNDAI\b/, 'Hyundai'], [/\bKIA\b/, 'Kia'], [/\bTOYOTA\b/, 'Toyota'],
  [/\bRENAULT\b/, 'Renault'], [/\bVOLKSWAGEN\b/, 'Volkswagen'], [/\bSKODA\b/, 'Skoda'], [/\bMORRIS\s+GARAGES\b|\bMG\s+MOTOR\b/, 'MG'],
  [/\bNISSAN\b/, 'Nissan'], [/\bFORD\b/, 'Ford'], [/\bJEEP\b|\bFCA\b/, 'Jeep'], [/\bYAMAHA\b/, 'Yamaha'], [/\bSUZUKI\s+MOTORCYCLE\b/, 'Suzuki'],
  [/\bKTM\b/, 'KTM'], [/\bATHER\b/, 'Ather'], [/\bOLA\b/, 'Ola Electric'], [/\bJAWA\b/, 'Jawa'], [/\bKAWASAKI\b/, 'Kawasaki'],
  [/\bTRIUMPH\b/, 'Triumph'], [/\bHARLEY\b/, 'Harley-Davidson'], [/\bHONDA\b/, 'Honda'], [/\bSUZUKI\b/, 'Suzuki'],
];

function toMake(raw: string): Found<string> | null {
  const up = raw.toUpperCase();
  for (const [re, make] of MAKE_ALIASES) if (re.test(up) && MAKES.includes(make)) return one(make);
  const words = up.replace(/\b(MOTORS?|MOTORCYCLES?|INDIA|PVT|PRIVATE|LTD|LIMITED|CO|COMPANY|CORPORATION|AND|&|\.)\b/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return one(titleCase(words.slice(0, 2).join(' ')), 'low', 'This make is not one the app knows. Check the spelling.');
}

function toModel(raw: string): { model: string; variant: string | null } {
  const words = titleCase(raw.replace(/[()]/g, ' ').trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return { model: '', variant: null };
  let n = 1;
  while (n < words.length && /^\d{2,4}[A-Za-z]?$|^6G$|^5G$/i.test(words[n])) n++;
  return { model: words.slice(0, n).join(' '), variant: words.slice(n).join(' ') || null };
}

export function toFuel(raw: string): FuelType | null {
  const t = raw.toUpperCase();
  if (/ELECTRIC|\bBOV\b|BATTERY/.test(t)) return 'electric';
  if (/(PETROL|GASOLINE).*(CNG)|(CNG).*(PETROL)|BI[\s-]?FUEL/.test(t)) return 'petrol_cng';
  if (/\bCNG\b/.test(t)) return 'cng';
  if (/DIESEL/.test(t)) return 'diesel';
  if (/HYBRID/.test(t)) return 'hybrid';
  if (/PETROL|GASOLINE/.test(t)) return 'petrol';
  if (/LPG|OTHER/.test(t)) return 'other';
  return null;
}

function toType(cls: string): VehicleType | null {
  const t = cls.toUpperCase();
  // "M-CYCLE/SCOOTER" is one class on the RC for both, so it reads as a motorcycle and the owner corrects it.
  if (/M-?CYCLE|MOTOR\s*CYCLE/.test(t)) return 'motorcycle';
  if (/SCOOTER|MOPED/.test(t)) return 'scooter';
  if (/MOTOR\s*CAR|LMV|\bCAR\b|JEEP/.test(t)) return 'car';
  return null;
}

function parseRc(text: string, out: ParsedDocument) {
  const veh = out.vehicle;
  const reg = findRegistration(text);
  if (reg) veh.registration_number = one(reg);

  const regDate = dateAfter(text, /date\s+of\s+reg(?:n|istration)?\.?|\breg(?:n|istration|d)?\.?\s*date/i, 40);
  if (regDate) {
    veh.registration_date = one(regDate);
    out.issued_on = one(regDate);
  }

  const rto = clean(valueAfter(text, /(?:registering|regd\.?|registration)\s+authority\s*[:\-]?/i));
  if (rto) out.issuer = one(rto);

  // "Maker / Model: HYUNDAI MOTOR INDIA LTD / CRETA SX DIESEL", or two separate lines.
  const both = valueAfter(text, /maker(?:'?s)?\s*(?:name)?\s*\/\s*model\s*[:\-]?/i);
  let makerRaw = valueAfter(text, /(?:maker(?:'?s)?(?:\s*name)?|manufacturer)\s*[:\-]/i);
  let modelRaw = valueAfter(text, /\b(?:vehicle\s+)?model(?:\s*name)?\s*[:\-]/i);
  if (both && both.includes('/')) {
    const [a, ...b] = both.split('/');
    makerRaw = a.trim();
    modelRaw = b.join('/').trim();
  }
  const make = makerRaw ? toMake(makerRaw) : null;
  if (make) veh.make = make;
  if (modelRaw) {
    const { model, variant } = toModel(modelRaw);
    if (model) {
      veh.model = one(model, 'low', 'Check where the model ends and the variant begins.');
      if (variant) veh.variant = one(variant, 'low');
    }
  }

  const fuelRaw = valueAfter(text, /fuel(?:\s*(?:type|used))?\s*[:\-]/i);
  const fuel = fuelRaw ? toFuel(fuelRaw) : null;
  if (fuel) veh.fuel_type = one(fuel);

  const cc = /(?:cubic\s*cap(?:acity|\.)?|engine\s*(?:capacity|cc))[^0-9]{0,25}(\d{2,4})(?:\.\d+)?/i.exec(text);
  if (cc) veh.engine_cc = one(+cc[1]);

  const colour = clean(valueAfter(text, /colou?r\s*[:\-]/i), 24);
  if (colour && /^[A-Za-z ]+$/.test(colour)) veh.colour_name = one(titleCase(colour), 'low');

  const cls = valueAfter(text, /vehicle\s+class\s*[:\-]/i);
  const type = cls ? toType(cls) : null;
  if (type) veh.vehicle_type = one(type, 'low', type === 'motorcycle' ? 'The RC does not say whether it is a motorcycle or a scooter.' : undefined);
}

// ---------------------------------------------------------------- the entry point

/**
 * Suggestions for each field of the document. `chosen` is the type the owner picked; when they have
 * not picked one, the best guess from the words is used. A date that makes no sense (an expiry before
 * the issue date) is dropped rather than shown.
 */
export function parseDocument(rawText: string, chosen?: DocType | null): ParsedDocument {
  const text = rawText.replace(/\r/g, '').replace(/[\t ]+/g, ' ').replace(/ {2,}/g, '  ');
  const out: ParsedDocument = { vehicle: {} };
  const detected = detectDocType(text);
  if (detected) out.doc_type = detected;
  const type = chosen ?? detected?.value ?? null;

  const reg = findRegistration(text);
  if (reg) out.registration_number = one(reg);

  if (type === 'insurance') parseInsurance(text, out);
  else if (type === 'puc') parsePuc(text, out);
  else if (type === 'cng_certificate') parseCng(text, out);
  else if (type === 'rc') parseRc(text, out);

  if (out.issued_on && out.expires_on && out.expires_on.value < out.issued_on.value) {
    delete out.expires_on;
    delete out.issued_on;
  }
  return out;
}

/** The pieces of a parse that came back, as a short list of field names. */
export function foundFields(p: ParsedDocument): string[] {
  const keys: (keyof ParsedDocument)[] = ['issuer', 'reference_number', 'issued_on', 'expires_on'];
  return keys.filter((k) => p[k]);
}
