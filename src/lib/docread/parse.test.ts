import { describe, expect, it } from 'vitest';
import { detectDocType, findDates, findRegistration, parseDocument, toFuel } from './parse';

// All samples below are invented, in the layouts Indian documents commonly use.

const INSURANCE = `
BAJAJ ALLIANZ GENERAL INSURANCE COMPANY LIMITED
Private Car Package Policy - Schedule
Policy No.: OG-26-1234-5678-00001234
Insured Name: SAMPLE OWNER
Period of Insurance: From 00:00 Hrs on 25/10/2025 To Midnight of 24/10/2026
Vehicle Registration No: KA-01-MN-4821
IDV: Rs. 5,40,000
Total Premium: 14,230
`;

const PUC = `
GOVERNMENT OF KARNATAKA
POLLUTION UNDER CONTROL CERTIFICATE
PUCC No: KA0123456789
Name of Testing Centre: Sample Emission Centre
Vehicle No: KA01MN4821
Date of Testing: 23/08/2026
Valid Upto: 22/08/2027
CO %: 0.12   HC (ppm): 85
`;

const CNG = `
HYDROSTATIC TEST CERTIFICATE FOR CNG CYLINDER
Approved by PESO
Cylinder Serial No: CYL4455667
Testing Station: Sample Cylinder Testing Works
Date of Test: 12 Jul 2026
Registration: MH 12 XY 9034
`;

const RC = `
CERTIFICATE OF REGISTRATION
Regn. No: MH12XY9034
Date of Regn: 19-04-2024
Registering Authority: RTO PUNE
Owner Name: SAMPLE OWNER
Maker / Model: HYUNDAI MOTOR INDIA LTD / CRETA SX DIESEL
Fuel: DIESEL
Colour: SUNSET ORANGE
Cubic Cap/Horse Power: 1493.00 / 85
Chassis No: MALXXXXXXXXXXXXXX
Vehicle Class: MOTOR CAR (LMV)
`;

describe('dates', () => {
  it('reads the usual Indian layouts, day first', () => {
    const iso = (s: string) => findDates(s).map((d) => d.iso);
    expect(iso('24/10/2026')).toEqual(['2026-10-24']);
    expect(iso('24-10-2026')).toEqual(['2026-10-24']);
    expect(iso('24.10.2026')).toEqual(['2026-10-24']);
    expect(iso('24 Oct 2026')).toEqual(['2026-10-24']);
    expect(iso('24-OCT-2026')).toEqual(['2026-10-24']);
    expect(iso('Oct 24, 2026')).toEqual(['2026-10-24']);
    expect(iso('2026-10-24')).toEqual(['2026-10-24']);
  });
  it('ignores things that are not dates', () => {
    expect(findDates('31/02/2026 and 45/13/2026')).toEqual([]);
  });
});

describe('registration numbers', () => {
  it('finds a plate however it is spaced', () => {
    expect(findRegistration('Vehicle Registration No: KA-01-MN-4821')).toBe('KA01MN4821');
    expect(findRegistration('MH 12 XY 9034')).toBe('MH12XY9034');
    expect(findRegistration('22 BH 1234 AA')).toBe('22BH1234AA');
  });
  it('does not take a non-state prefix for a plate', () => {
    expect(findRegistration('ZZ 12 AB 1234')).toBeNull();
  });
});

describe('what kind of document', () => {
  it('tells the four apart', () => {
    expect(detectDocType(INSURANCE)?.value).toBe('insurance');
    expect(detectDocType(PUC)?.value).toBe('puc');
    expect(detectDocType(CNG)?.value).toBe('cng_certificate');
    expect(detectDocType(RC)?.value).toBe('rc');
  });
  it('says nothing about text it does not understand', () => {
    expect(detectDocType('Dear customer, thank you for shopping with us.')).toBeUndefined();
  });
});

describe('insurance', () => {
  it('reads the insurer, policy number and period', () => {
    const p = parseDocument(INSURANCE);
    expect(p.issuer?.value).toBe('Bajaj Allianz');
    expect(p.reference_number?.value).toBe('OG-26-1234-5678-00001234');
    expect(p.issued_on?.value).toBe('2025-10-25');
    expect(p.expires_on?.value).toBe('2026-10-24');
    expect(p.registration_number?.value).toBe('KA01MN4821');
  });
  it('falls back to an expiry label', () => {
    const p = parseDocument('ICICI Lombard\nPolicy Number 3001/12345678/00/000\nDate of Expiry: 03/03/2027', 'insurance');
    expect(p.issuer?.value).toBe('ICICI Lombard');
    expect(p.expires_on?.value).toBe('2027-03-03');
  });
});

describe('PUC', () => {
  it('reads the centre, number and both dates', () => {
    const p = parseDocument(PUC);
    expect(p.issuer?.value).toBe('Sample Emission Centre');
    expect(p.reference_number?.value).toBe('KA0123456789');
    expect(p.issued_on?.value).toBe('2026-08-23');
    expect(p.expires_on?.value).toBe('2027-08-22');
  });
});

describe('CNG hydro-test', () => {
  it('reads the test date and counts three years when no due date is printed', () => {
    const p = parseDocument(CNG);
    expect(p.issued_on?.value).toBe('2026-07-12');
    expect(p.expires_on?.value).toBe('2029-07-12');
    expect(p.expires_on?.confidence).toBe('low');
    expect(p.issuer?.value).toBe('Sample Cylinder Testing Works');
  });
  it('trusts a printed due date', () => {
    const p = parseDocument('Hydro test certificate\nDate of Test: 12/07/2026\nNext Test Due: 11/07/2029', 'cng_certificate');
    expect(p.expires_on?.value).toBe('2029-07-11');
    expect(p.expires_on?.confidence).toBe('high');
  });
});

describe('RC', () => {
  it('reads the vehicle and leaves the owner alone', () => {
    const p = parseDocument(RC);
    const v = p.vehicle;
    expect(v.registration_number?.value).toBe('MH12XY9034');
    expect(v.registration_date?.value).toBe('2024-04-19');
    expect(v.make?.value).toBe('Hyundai');
    expect(v.model?.value).toBe('Creta');
    expect(v.variant?.value).toBe('SX Diesel');
    expect(v.fuel_type?.value).toBe('diesel');
    expect(v.engine_cc?.value).toBe(1493);
    expect(v.colour_name?.value).toBe('Sunset Orange');
    expect(v.vehicle_type?.value).toBe('car');
    expect(p.issuer?.value).toBe('RTO PUNE');
    expect(JSON.stringify(p)).not.toMatch(/SAMPLE OWNER|MALX/);
  });
  it('keeps a number in the model name, like Classic 350', () => {
    const p = parseDocument('CERTIFICATE OF REGISTRATION\nMaker: ROYAL ENFIELD (UNIT OF EICHER MOTORS LTD)\nModel: CLASSIC 350 SIGNALS\nFuel: PETROL\nVehicle Class: M-CYCLE/SCOOTER (2WN)');
    expect(p.vehicle.make?.value).toBe('Royal Enfield');
    expect(p.vehicle.model?.value).toBe('Classic 350');
    expect(p.vehicle.variant?.value).toBe('Signals');
    expect(p.vehicle.vehicle_type?.value).toBe('motorcycle');
  });
});

describe('fuel words', () => {
  it('maps them', () => {
    expect(toFuel('PETROL/CNG')).toBe('petrol_cng');
    expect(toFuel('ELECTRIC(BOV)')).toBe('electric');
    expect(toFuel('Diesel')).toBe('diesel');
    expect(toFuel('???')).toBeNull();
  });
});

describe('sanity', () => {
  it('drops an expiry that comes before the issue date', () => {
    const p = parseDocument('PUC\nDate of Testing: 10/10/2026\nValid Upto: 01/01/2020', 'puc');
    expect(p.expires_on).toBeUndefined();
  });
  it('returns nothing for empty text', () => {
    expect(parseDocument('', 'insurance').expires_on).toBeUndefined();
  });
});

import { vehicleFindings } from './findings';
import { vehicle } from '../fixtures';

describe('RC findings', () => {
  const parsed = parseDocument(RC).vehicle;
  it('only offers what differs, and ticks only what is blank', () => {
    const v = vehicle({ make: 'Hyundai', model: 'Creta', variant: null, registration_number: null, engine_cc: null, fuel_type: 'diesel', registration_date: null, colour_name: null, vehicle_type: 'car' });
    const f = vehicleFindings(v, parsed);
    const keys = f.map((x) => x.key);
    expect(keys).not.toContain('make');
    expect(keys).not.toContain('model');
    expect(keys).not.toContain('fuel_type');
    expect(keys).toEqual(expect.arrayContaining(['registration_number', 'variant', 'engine_cc', 'registration_date', 'colour']));
    expect(f.every((x) => x.defaultOn)).toBe(true);
  });
  it('leaves a different make unticked for the owner to decide', () => {
    const f = vehicleFindings(vehicle({ make: 'Kia' }), parsed);
    const make = f.find((x) => x.key === 'make');
    expect(make?.current).toBe('Kia');
    expect(make?.next).toBe('Hyundai');
    expect(make?.defaultOn).toBe(false);
  });
  it('maps a colour name onto a swatch', () => {
    const c = vehicleFindings(vehicle({ colour_name: null }), parsed).find((x) => x.key === 'colour');
    expect(c?.patch.colour_hex).toBe('#F97316');
  });
});
