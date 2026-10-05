import { describe, expect, it } from 'vitest';
import { TODAY, bundle, doc, issue, service, vehicle } from './fixtures';
import {
  attentionItems, documentStatus, guessDocType, pitBoard, serviceSchedule, serviceSentence,
  splitCurrentAndHistory, upcomingItems,
} from './status';

describe('documentStatus', () => {
  it('speaks in sentences, with a date once far away', () => {
    expect(documentStatus(doc({ expires_on: '2026-10-23' }), TODAY).label).toBe('Expires in 18 days');
    expect(documentStatus(doc({ expires_on: '2027-03-14' }), TODAY).label).toBe('Valid until 14 Mar 2027');
    expect(documentStatus(doc({ expires_on: '2026-10-06' }), TODAY).label).toBe('Expires tomorrow');
    expect(documentStatus(doc({ expires_on: '2026-10-05' }), TODAY).label).toBe('Expires today');
    expect(documentStatus(doc({ expires_on: '2026-10-02' }), TODAY).label).toBe('Expired 3 days ago');
  });
  it('treats an RC with no expiry as permanent', () => {
    expect(documentStatus(doc({ doc_type: 'rc' }), TODAY).label).toBe('Permanent document');
  });
  it('does not treat a finished warranty as a problem', () => {
    const s = documentStatus(doc({ doc_type: 'warranty', expires_on: '2026-09-01' }), TODAY);
    expect(s.state).toBe('ended');
    expect(s.severity).toBe('neutral');
  });
});

describe('current vs history', () => {
  it('keeps the latest insurance and files older renewals as history', () => {
    const old = doc({ doc_type: 'insurance', expires_on: '2025-10-20' });
    const latest = doc({ doc_type: 'insurance', expires_on: '2026-10-20' });
    const { current, history } = splitCurrentAndHistory([old, latest], TODAY);
    expect(current).toEqual([latest]);
    expect(history).toEqual([old]);
  });
  it('sorts expired, then soon, then the rest', () => {
    const rc = doc({ doc_type: 'rc' });
    const puc = doc({ doc_type: 'puc', expires_on: '2027-03-14' });
    const ins = doc({ doc_type: 'insurance', expires_on: '2026-10-23' });
    const { current } = splitCurrentAndHistory([rc, puc, ins], TODAY);
    expect(current.map((d) => d.doc_type)).toEqual(['insurance', 'puc', 'rc']);
  });
});

describe('service schedule', () => {
  const v = vehicle({ current_odometer_km: 47700, odometer_read_on: '2026-10-04' });
  const svc = service({ serviced_on: '2026-08-12', odometer_km: 38420 });

  it('is unknown until a service has been logged', () => {
    expect(serviceSchedule(v, [], TODAY).state).toBe('unknown');
  });
  it('uses whichever limit arrives first, per vehicle intervals', () => {
    const s = serviceSchedule(v, [svc], TODAY);
    expect(s.nextKm).toBe(48420);
    expect(s.nextDate).toBe('2027-08-12');
    expect(s.kmRemaining).toBe(720);
    expect(s.binding).toBe('km');
    expect(s.state).toBe('soon');
    expect(serviceSentence(s)).toBe('Service due in 720 km.');
  });
  it('supports a different interval for a motorcycle', () => {
    const bike = vehicle({ vehicle_type: 'motorcycle', service_interval_km: 5000, service_interval_months: 6, current_odometer_km: 40000, odometer_read_on: '2026-10-04' });
    const s = serviceSchedule(bike, [service({ serviced_on: '2026-04-01', odometer_km: 38000 })], TODAY);
    expect(s.nextDate).toBe('2026-10-01');
    expect(s.binding).toBe('date');
    expect(s.state).toBe('overdue');
    expect(serviceSentence(s)).toBe('Service was due 4 days ago.');
  });
  it('is honest when the odometer reading is old (the Freshness Rule)', () => {
    const stale = vehicle({ current_odometer_km: 47700, odometer_read_on: '2026-09-13' });
    const s = serviceSchedule(stale, [svc], TODAY);
    expect(s.stale).toBe(true);
    expect(serviceSentence(s)).toBe('Service due in about 720 km, based on your reading from 13 Sep.');
  });
  it('says so when overdue by distance', () => {
    const over = vehicle({ current_odometer_km: 48900, odometer_read_on: '2026-10-04' });
    expect(serviceSentence(serviceSchedule(over, [svc], TODAY))).toBe('Service overdue by 480 km.');
  });
  it('works with only a time interval', () => {
    const v2 = vehicle({ service_interval_km: null, service_interval_months: 12, current_odometer_km: null, odometer_read_on: null });
    const s = serviceSchedule(v2, [svc], TODAY);
    expect(s.binding).toBe('date');
    expect(s.state).toBe('ok');
  });
});

describe('Pit Board', () => {
  const insuranceSoon = doc({ doc_type: 'insurance', expires_on: '2026-10-23' });
  const pucFine = doc({ doc_type: 'puc', expires_on: '2027-03-14' });

  it('is an empty state with nothing tracked', () => {
    const p = pitBoard(bundle(), TODAY);
    expect(p.kind).toBe('empty');
    expect(p.severity).toBe('neutral');
  });
  it('leads with what is expiring', () => {
    const p = pitBoard(bundle({ documents: [insuranceSoon, pucFine] }), TODAY);
    expect(p.sentence).toBe('Insurance expires in 18 days.');
    expect(p.severity).toBe('soon');
  });
  it('puts expired before service due before open issues', () => {
    const b = bundle({
      vehicle: vehicle({ current_odometer_km: 47700, odometer_read_on: '2026-10-04' }),
      documents: [doc({ doc_type: 'puc', expires_on: '2026-10-02' }), insuranceSoon],
      services: [service()],
      issues: [issue(), issue()],
    });
    const items = attentionItems(b, TODAY);
    expect(items.map((i) => i.id.split('-')[0])).toEqual(['doc', 'doc', 'service', 'issues']);
    expect(items[0].sentence).toBe('PUC expired 3 days ago.');
    expect(items[0].severity).toBe('overdue');
    expect(pitBoard(b, TODAY).more).toBe(3);
  });
  it('counts open issues only, in plain words', () => {
    const b = bundle({ documents: [pucFine], issues: [issue(), issue({ status: 'resolved', resolved_on: '2026-09-02' }), issue()] });
    expect(pitBoard(b, TODAY).sentence).toBe('2 things to tell the workshop.');
    expect(pitBoard(bundle({ documents: [pucFine], issues: [issue()] }), TODAY).sentence).toBe('1 thing to tell the workshop.');
  });
  it('is calmly all clear, with the next thing to know', () => {
    const b = bundle({
      vehicle: vehicle({ current_odometer_km: 46080, odometer_read_on: '2026-10-04' }),
      documents: [pucFine, doc({ doc_type: 'rc' })],
      services: [service()],
    });
    const p = pitBoard(b, TODAY);
    expect(p.kind).toBe('clear');
    expect(p.sentence).toBe('All clear. Service in 2,340 km.');
    expect(p.severity).toBe('clear');
  });
  it('offers an odometer update when a distance claim rests on an old reading', () => {
    const b = bundle({
      vehicle: vehicle({ current_odometer_km: 46080, odometer_read_on: '2026-09-13' }),
      documents: [pucFine],
      services: [service()],
    });
    const p = pitBoard(b, TODAY);
    expect(p.needsOdometer).toBe(true);
    expect(p.sentence).toBe('All clear. Service in about 2,340 km, based on your reading from 13 Sep.');
  });
  it('does not alarm about a lapsed warranty', () => {
    const b = bundle({ documents: [doc({ doc_type: 'warranty', expires_on: '2026-09-01' }), pucFine] });
    expect(pitBoard(b, TODAY).kind).toBe('clear');
  });
  it('uses no F1 wink inside warnings', () => {
    const b = bundle({ documents: [doc({ doc_type: 'insurance', expires_on: '2026-10-01' })] });
    expect(pitBoard(b, TODAY).sentence).not.toMatch(/flag|pit window|box/i);
  });
});

describe('upcoming and helpers', () => {
  it('lists dated items nearest first', () => {
    const b = bundle({ documents: [doc({ doc_type: 'puc', expires_on: '2027-03-14' }), doc({ doc_type: 'insurance', expires_on: '2026-10-23' })], services: [service()] });
    const u = upcomingItems(b, TODAY);
    expect(u[0].title).toBe('Insurance');
    expect(u.map((x) => x.title)).toContain('Next service');
  });
  it('guesses document type from a file name', () => {
    expect(guessDocType('Insurance_2026.pdf')).toBe('insurance');
    expect(guessDocType('PUC certificate.jpg')).toBe('puc');
    expect(guessDocType('RC_front.png')).toBe('rc');
    expect(guessDocType('IMG_2291.jpg')).toBeNull();
  });
});
