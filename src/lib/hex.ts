/** A colour typed by hand: "#e5383b", "E5383B" or "f80" all become "#E5383B" / "#FF8800". Anything else is null. */
export function normaliseHex(input: string): string | null {
  const t = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{6}$/i.test(t)) return `#${t.toUpperCase()}`;
  if (/^[0-9a-f]{3}$/i.test(t)) return `#${[...t].map((c) => c + c).join('').toUpperCase()}`;
  return null;
}
