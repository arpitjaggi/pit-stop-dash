/** Paint colours offered when adding a vehicle. */
export const SWATCHES = [
  { name: 'White', hex: '#ECE9E1' }, { name: 'Silver', hex: '#B8BDC2' }, { name: 'Grey', hex: '#6B7280' }, { name: 'Black', hex: '#1F1D1A' },
  { name: 'Red', hex: '#E5383B' }, { name: 'Orange', hex: '#F97316' }, { name: 'Yellow', hex: '#F5B800' }, { name: 'Green', hex: '#1F7A4D' },
  { name: 'Teal', hex: '#14B8A6' }, { name: 'Blue', hex: '#3B82F6' }, { name: 'Navy', hex: '#1E3A8A' }, { name: 'Brown', hex: '#8B5E3C' },
];

/** The swatch a colour name points at ("Sunset Orange" is Orange), if any. */
export function swatchForName(name: string) {
  const n = name.toLowerCase();
  return SWATCHES.find((s) => n.includes(s.name.toLowerCase())) ?? null;
}
