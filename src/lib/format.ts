// Indian number formatting: lakh/crore grouping (1,24,560), kilometres, rupees.

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatNumber = (n: number) => nf.format(n);
export const formatKm = (n: number) => `${nf.format(n)} km`;
export const formatInr = (n: number) => inr.format(n);

/** Parses what a person types into a number field ("45,210", "1,24,560 km"). */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
