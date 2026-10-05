import { describe, expect, it } from 'vitest';
import { addMonths, ago, diffDays, formatDate, formatDateShort, todayISO } from './dates';
import { formatInr, formatKm, parseNumber } from './format';
import { formatRegistration, looksLikeRegistration, normaliseRegistration } from './plate';

describe('dates', () => {
  it('formats with a spelled-out month so day/month can never be misread', () => {
    expect(formatDate('2026-09-14')).toBe('14 Sep 2026');
    expect(formatDateShort('2026-09-14', '2026-10-05')).toBe('14 Sep');
    expect(formatDateShort('2025-09-14', '2026-10-05')).toBe('14 Sep 2025');
  });
  it('counts whole days across a daylight-saving boundary', () => {
    expect(diffDays('2026-03-30', '2026-03-28')).toBe(2);
    expect(diffDays('2026-10-05', '2026-10-05')).toBe(0);
    expect(diffDays('2027-01-01', '2026-01-01')).toBe(365);
  });
  it('adds months and clamps to month end', () => {
    expect(addMonths('2026-08-31', 6)).toBe('2027-02-28');
    expect(addMonths('2026-08-12', 12)).toBe('2027-08-12');
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
  });
  it('reads local calendar date', () => {
    expect(todayISO(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05');
  });
  it('speaks relative past in human terms', () => {
    expect(ago('2026-10-04', '2026-10-05')).toBe('yesterday');
    expect(ago('2026-09-14', '2026-10-05')).toBe('3 weeks ago');
    expect(ago('2026-05-05', '2026-10-05')).toBe('5 months ago');
  });
});

describe('format', () => {
  it('groups digits the Indian way', () => {
    expect(formatKm(124560)).toBe('1,24,560 km');
    expect(formatKm(45210)).toBe('45,210 km');
    expect(formatInr(12500)).toBe('₹12,500');
  });
  it('parses typed numbers', () => {
    expect(parseNumber('1,24,560 km')).toBe(124560);
    expect(parseNumber('')).toBeNull();
  });
});

describe('registration numbers', () => {
  it('normalises and groups like the plate', () => {
    expect(normaliseRegistration('ka-01 ab 1234')).toBe('KA01AB1234');
    expect(formatRegistration('KA01AB1234')).toBe('KA 01 AB 1234');
    expect(formatRegistration('22BH1234AA')).toBe('22 BH 1234 AA');
    expect(formatRegistration('MH12AB1')).toBe('MH 12 AB 1');
  });
  it('flags odd formats softly', () => {
    expect(looksLikeRegistration('KA01AB1234')).toBe(true);
    expect(looksLikeRegistration('22BH1234AA')).toBe(true);
    expect(looksLikeRegistration('TEMP123')).toBe(false);
  });
});
