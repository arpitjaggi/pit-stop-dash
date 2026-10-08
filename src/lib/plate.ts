// Indian registration numbers: the vehicle's everyday identifier.
// Stored normalised (upper case, letters and digits only); shown grouped like the plate.

const STANDARD = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/; // KA01AB1234, DL1CAB1234
const BHARAT = /^(\d{2})(BH)(\d{4})([A-Z]{1,2})$/; // 22BH1234AA

export function normaliseRegistration(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatRegistration(normalised: string): string {
  const bh = BHARAT.exec(normalised);
  if (bh) return `${bh[1]} ${bh[2]} ${bh[3]} ${bh[4]}`;
  const std = STANDARD.exec(normalised);
  if (std) return [std[1], std[2], std[3], std[4]].filter(Boolean).join(' ');
  return normalised;
}

export type PlateTone = 'private' | 'commercial' | 'ev' | 'ev-commercial' | 'rental';

/** The plate colour: white, yellow or black by use; green for electric (yellow letters when it earns money). */
export function plateTone(use: 'private' | 'commercial' | 'rental', fuel: string): PlateTone {
  if (fuel === 'electric') return use === 'private' ? 'ev' : 'ev-commercial';
  return use;
}

/** The two lines of a two-wheeler's rear plate: state and district, then series and number. */
export function splitRegistration(normalised: string): [string, string] {
  const text = formatRegistration(normalised);
  const parts = text.split(' ');
  if (parts.length < 3) return [text, ''];
  return [parts.slice(0, 2).join(' '), parts.slice(2).join(' ')];
}

/** Soft check: unusual formats are allowed (old, temporary, military), just not silently. */
export function looksLikeRegistration(normalised: string): boolean {
  return STANDARD.test(normalised) || BHARAT.test(normalised);
}

export function validRegistrationShape(normalised: string): boolean {
  return /^[A-Z0-9]{4,12}$/.test(normalised);
}
