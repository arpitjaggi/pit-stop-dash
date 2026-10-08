import { describe, expect, it } from 'vitest';
import { istDate, reminderMessage, reminderSentence, whenText } from '../../supabase/functions/_shared/messages';

const base = { vehicleName: 'Swift', registration: 'KA01MN4821', docType: 'insurance' as const, expiresOn: '2026-10-13', appUrl: 'https://app.example' };

describe('reminder sentences', () => {
  it('says how long is left in plain words', () => {
    expect(whenText(0)).toBe('today');
    expect(whenText(1)).toBe('tomorrow');
    expect(whenText(7)).toBe('in 7 days');
  });
  it('names the vehicle, its plate and the date', () => {
    expect(reminderSentence({ ...base, daysLeft: 7 })).toBe('Swift (KA 01 MN 4821): insurance expires in 7 days (13 Oct 2026).');
  });
  it('drops the date on the last two days', () => {
    expect(reminderSentence({ ...base, daysLeft: 1 })).toBe('Swift (KA 01 MN 4821): insurance expires tomorrow.');
    expect(reminderSentence({ ...base, daysLeft: 0 })).toBe('Swift (KA 01 MN 4821): insurance expires today.');
  });
  it('words the CNG test as due, not expired', () => {
    expect(reminderSentence({ ...base, docType: 'cng_certificate', daysLeft: 30, expiresOn: '2026-11-05' })).toBe('Swift (KA 01 MN 4821): CNG hydro-test is due in 30 days (5 Nov 2026).');
  });
  it('copes with a vehicle that has no registration yet', () => {
    expect(reminderSentence({ ...base, registration: null, docType: 'puc', daysLeft: 2 })).toBe('Swift: PUC expires in 2 days (13 Oct 2026).');
  });
  it('gives a next step and a link, and escapes anything it was handed', () => {
    const m = reminderMessage({ ...base, vehicleName: 'A<b>', daysLeft: 7 });
    expect(m.text).toContain('Renew the policy');
    expect(m.text).toContain('https://app.example');
    expect(m.html).toContain('A&lt;b&gt;');
    expect(m.html).not.toContain('<b>');
  });
});

describe('India date', () => {
  it('rolls over at 5:30 ahead of UTC', () => {
    expect(istDate(new Date('2026-10-05T18:29:00Z'))).toBe('2026-10-05');
    expect(istDate(new Date('2026-10-05T18:31:00Z'))).toBe('2026-10-06');
  });
});
