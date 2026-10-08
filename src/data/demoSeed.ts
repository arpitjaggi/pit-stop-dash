// Sample data for the demo adapter only. Dates are relative to "today" so every status state
// (expiring soon, expired, all clear, stale odometer, nothing tracked) is always on show.
// Everything here is invented: the demo banner says so, and none of it ever reaches a real account.

import { addDays, todayISO } from '@/lib/dates';
import type { DocType, Issue, ServiceRecord, VDocument, Vehicle, Reading } from './types';

const USER = 'demo-user';
const iso = (d: string) => `${d}T09:00:00.000Z`;

async function samplePage(title: string, lines: string[]): Promise<{ full: Blob; thumb: Blob }> {
  const W = 900;
  const H = 1260;
  const draw = (scale: number) => {
    const c = document.createElement('canvas');
    c.width = Math.round(W * scale);
    c.height = Math.round(H * scale);
    const g = c.getContext('2d')!;
    g.scale(scale, scale);
    g.fillStyle = '#fbfbf9';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#c9ccc4';
    g.lineWidth = 2;
    g.strokeRect(40, 40, W - 80, H - 80);
    g.fillStyle = '#111613';
    g.font = '700 48px system-ui, sans-serif';
    g.fillText(title, 80, 150);
    g.fillStyle = '#646c66';
    g.font = '600 21px system-ui, sans-serif';
    g.fillText('SAMPLE DOCUMENT - DEMO DATA, NOT A REAL RECORD', 80, 205);
    g.fillStyle = '#111613';
    g.font = '400 32px system-ui, sans-serif';
    lines.forEach((l, i) => g.fillText(l, 80, 320 + i * 64));
    g.fillStyle = '#e4e7e0';
    for (let i = 0; i < 9; i++) g.fillRect(80, 760 + i * 44, 740 - (i % 3) * 140, 14);
    return new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
  };
  return { full: await draw(1), thumb: await draw(0.32) };
}

function samplePdf(title: string, lines: string[]): Blob {
  const esc = (s: string) => s.replace(/[()\\]/g, '');
  let y = 760;
  const body = [
    `BT /F1 26 Tf 60 800 Td (${esc(title)}) Tj ET`,
    'BT /F1 11 Tf 60 780 Td (SAMPLE DOCUMENT - DEMO DATA, NOT A REAL RECORD) Tj ET',
    ...lines.map((l) => `BT /F1 14 Tf 60 ${(y -= 30)} Td (${esc(l)}) Tj ET`),
  ].join('\n');
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
    `<</Length ${body.length}>>\nstream\n${body}\nendstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ];
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([out], { type: 'application/pdf' });
}

export async function buildSeed() {
  const today = todayISO();
  const d = (n: number) => addDays(today, n);
  const blobs: Record<string, Blob> = {};

  const vehicles: Vehicle[] = [];
  const documents: VDocument[] = [];
  const issues: Issue[] = [];
  const services: ServiceRecord[] = [];
  const readings: Reading[] = [];

  const base = {
    user_id: USER, plate_use: 'private' as const, variant: null, registration_date: null, purchase_date: null, notes: null, engine_cc: null, transmission: null,
    battery_kwh: null, cng_kit_info: null, wheels: null, photo_path: null, photo_thumb_path: null, created_at: iso(d(-300)), updated_at: iso(d(-3)),
  };

  const swift: Vehicle = {
    ...base, id: 'demo-swift', vehicle_type: 'car', make: 'Maruti Suzuki', model: 'Swift', variant: 'VXi', registration_number: 'KA01MN4821',
    registration_date: d(-1100), purchase_date: d(-1100), fuel_type: 'petrol', colour_name: 'Sky blue', colour_hex: '#3B82F6',
    engine_cc: 1197, transmission: 'Manual', service_interval_km: 10000, service_interval_months: 12, current_odometer_km: 45210, odometer_read_on: d(-6),
  };
  const bike: Vehicle = {
    ...base, id: 'demo-classic', vehicle_type: 'motorcycle', make: 'Royal Enfield', model: 'Classic 350', variant: 'Signals', registration_number: 'KA03HF7710',
    registration_date: d(-640), purchase_date: d(-640), fuel_type: 'petrol', colour_name: 'Racing green', colour_hex: '#1F7A4D', engine_cc: 349,
    transmission: 'Manual', wheels: 2, service_interval_km: 5000, service_interval_months: 6, current_odometer_km: 14100, odometer_read_on: d(-41),
  };
  const creta: Vehicle = {
    ...base, id: 'demo-creta', vehicle_type: 'suv', make: 'Hyundai', model: 'Creta', variant: 'SX Diesel', registration_number: 'MH12XY9034',
    registration_date: d(-900), purchase_date: d(-900), fuel_type: 'diesel', colour_name: 'Sunset orange', colour_hex: '#F97316', engine_cc: 1493,
    transmission: 'Automatic', service_interval_km: 10000, service_interval_months: 12, current_odometer_km: 61840, odometer_read_on: d(-4),
  };
  const activa: Vehicle = {
    ...base, id: 'demo-activa', vehicle_type: 'scooter', make: 'Honda', model: 'Activa 6G', variant: 'Deluxe', registration_number: null,
    purchase_date: d(-9), fuel_type: 'petrol', colour_name: 'Pearl teal', colour_hex: '#14B8A6', engine_cc: 109, wheels: 2,
    service_interval_km: 5000, service_interval_months: 6, current_odometer_km: 12, odometer_read_on: d(-9),
  };
  vehicles.push(swift, bike, creta, activa);

  let n = 0;
  async function addDoc(
    vehicle_id: string, doc_type: DocType, p: { title?: string; issuer?: string; reference_number?: string; issued_on?: string; expires_on?: string; pdf?: boolean; uploaded?: number },
  ) {
    n += 1;
    const label = p.title ?? { rc: 'Registration Certificate', insurance: 'Insurance policy', puc: 'PUC certificate' }[doc_type as 'rc'] ?? 'Document';
    const lines = [`Vehicle: ${vehicles.find((v) => v.id === vehicle_id)!.model}`, p.issuer ? `Issued by: ${p.issuer}` : '', p.reference_number ? `Reference: ${p.reference_number}` : '', p.issued_on ? `Issued: ${p.issued_on}` : '', p.expires_on ? `Valid until: ${p.expires_on}` : 'No expiry'].filter(Boolean);
    const id = `demo-doc-${n}`;
    const file_path = `${USER}/${vehicle_id}/${id}.${p.pdf ? 'pdf' : 'png'}`;
    let thumb_path: string | null = null;
    let size = 0;
    if (p.pdf) {
      const pdf = samplePdf(label, lines);
      blobs[file_path] = pdf;
      size = pdf.size;
    } else {
      const page = await samplePage(label, lines);
      blobs[file_path] = page.full;
      thumb_path = `${USER}/${vehicle_id}/${id}-thumb.png`;
      blobs[thumb_path] = page.thumb;
      size = page.full.size;
    }
    documents.push({
      id, user_id: USER, vehicle_id, doc_type, title: p.title ?? null, issuer: p.issuer ?? null, reference_number: p.reference_number ?? null,
      issued_on: p.issued_on ?? null, expires_on: p.expires_on ?? null, notes: null, file_path, thumb_path, file_name: `${doc_type}.${p.pdf ? 'pdf' : 'png'}`,
      mime_type: p.pdf ? 'application/pdf' : 'image/png', size_bytes: size, extracted_fields: [], created_at: iso(d(p.uploaded ?? -200)), updated_at: iso(d(-3)),
    });
  }

  // Swift: insurance runs out soon -> the Pit Board leads with it.
  await addDoc('demo-swift', 'rc', { issuer: 'RTO Bengaluru Central', pdf: true });
  await addDoc('demo-swift', 'insurance', { issuer: 'Sample General Insurance', reference_number: 'SAMPLE-POL-0001', issued_on: d(-347), expires_on: d(18) });
  await addDoc('demo-swift', 'insurance', { issuer: 'Sample General Insurance', reference_number: 'SAMPLE-POL-0000', issued_on: d(-712), expires_on: d(-347), uploaded: -700 });
  await addDoc('demo-swift', 'puc', { issuer: 'Sample Emission Centre', issued_on: d(-40), expires_on: d(140) });
  await addDoc('demo-swift', 'warranty', { title: 'Manufacturer warranty', issuer: 'Maruti Suzuki', issued_on: d(-1100), expires_on: d(-100) });

  // Classic 350: everything fine, but the odometer reading is six weeks old.
  await addDoc('demo-classic', 'rc', { issuer: 'RTO Bengaluru East' });
  await addDoc('demo-classic', 'insurance', { issuer: 'Sample General Insurance', issued_on: d(-100), expires_on: d(265) });
  await addDoc('demo-classic', 'puc', { issuer: 'Sample Emission Centre', issued_on: d(-60), expires_on: d(120) });

  // Creta: PUC has lapsed.
  await addDoc('demo-creta', 'rc', { issuer: 'RTO Pune' });
  await addDoc('demo-creta', 'insurance', { issuer: 'Sample General Insurance', issued_on: d(-200), expires_on: d(165) });
  await addDoc('demo-creta', 'puc', { issuer: 'Sample Emission Centre', issued_on: d(-189), expires_on: d(-9) });

  const svc = (vehicle_id: string, serviced_on: string, odometer_km: number, workshop: string, service_type: string, work: string, extra: Partial<ServiceRecord> = {}) => {
    n += 1;
    services.push({
      id: `demo-svc-${n}`, user_id: USER, vehicle_id, serviced_on, workshop, odometer_km, service_type, work_performed: work, cost_inr: null,
      problems_found: null, carry_forward: null, notes: null, created_at: iso(serviced_on), updated_at: iso(serviced_on), ...extra,
    });
  };
  svc('demo-swift', d(-420), 28120, 'Sai Auto Works, Koramangala', 'Regular service', 'Engine oil and filter, air filter, brake check.', { cost_inr: 6850 });
  svc('demo-swift', d(-54), 38420, 'Sai Auto Works, Koramangala', 'Regular service', 'Engine oil and filter, cabin filter, wheel alignment.', {
    cost_inr: 8240, problems_found: 'Front brake pads at about 30%.', carry_forward: 'Check front brake pads\nAC makes a rattling noise',
  });
  svc('demo-classic', d(-120), 10300, 'Royal Enfield Service, Indiranagar', 'Regular service', 'Engine oil, chain adjust and lube, brake bleed.', { cost_inr: 2650 });
  svc('demo-creta', d(-190), 51900, 'Hyundai Pune Service Centre', 'Regular service', 'Oil, fuel and air filters, brake fluid.', { cost_inr: 11400 });

  const issue = (vehicle_id: string, description: string, added: number, note: string | null = null) => {
    n += 1;
    issues.push({
      id: `demo-issue-${n}`, user_id: USER, vehicle_id, description, note, status: 'open', added_on: d(added), resolved_on: null,
      resolved_in_service_id: null, created_at: iso(d(added)), updated_at: iso(d(added)),
    });
  };
  issue('demo-swift', 'AC makes a rattling noise', -54, 'Mostly at low fan speed.');
  issue('demo-creta', 'Rear left tyre slowly losing pressure', -21);
  issue('demo-creta', 'Dashboard rattle over bumps', -35);

  const reading = (vehicle_id: string, read_on: string, reading_km: number, note: string | null = null, source: Reading['source'] = 'manual') => {
    n += 1;
    readings.push({ id: `demo-r-${n}`, user_id: USER, vehicle_id, read_on, reading_km, note, source, created_at: iso(read_on) });
  };
  reading('demo-swift', d(-54), 38420, 'Service at Sai Auto Works', 'service');
  reading('demo-swift', d(-30), 43650);
  reading('demo-swift', d(-6), 45210, 'At the petrol pump');
  reading('demo-classic', d(-120), 10300, 'Service at Royal Enfield Service', 'service');
  reading('demo-classic', d(-41), 14100);
  reading('demo-creta', d(-190), 51900, 'Service at Hyundai Pune Service Centre', 'service');
  reading('demo-creta', d(-4), 61840);
  reading('demo-activa', d(-9), 12, 'Entered when added', 'vehicle_added');

  return { tables: { vehicles, readings, issues, services, documents }, blobs };
}
