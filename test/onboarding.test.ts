import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NOTICES, OnboardingSchema, meetsLegalAge, stepForState, todayInIndia } from '../src/lib/onboarding.ts';

const yearsAgo = (n: number) => `${Number(todayInIndia().slice(0, 4)) - n}${todayInIndia().slice(4)}`;

const valid = () => ({
  lang: 'te',
  pledge: { accepted: true, noticeVersion: NOTICES.pledge.version },
  heritage: {
    displayName: 'Ravi Kumar',
    gender: 'male',
    dateOfBirth: yearsAgo(30),
    gothra: { kind: 'listed', id: '6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f' },
    maternalLineage: null,
    vocation: 'nadopasana',
    ancestralNativeDistrict: 'suryapet',
    ancestralNativeMandal: ' Kodad ',
  },
  career: { educationDegree: 'B.Mus', occupation: 'Nadaswaram Vidwan', incomeBracket: '6l_12l', salonHubSlug: null, birthTime: '05:42', birthPlace: null, nakshatra: 'rohini' },
  privacy: {
    photoVisibility: 'blurred',
    contactMaskingAcknowledged: true,
    profileProcessingConsent: true,
    coordinatorVerificationConsent: true,
    profileNoticeVersion: NOTICES.profileProcessing.version,
    coordinatorNoticeVersion: NOTICES.coordinatorVerification.version,
  },
  contact: { phone: '+91 99001 12233', email: null, whatsapp: null, doorAddress: '12-3 Temple Street, Kodad' },
});

const fails = (mutate: (p: ReturnType<typeof valid>) => void): string[] => {
  const p = valid();
  mutate(p);
  const r = OnboardingSchema.safeParse(p);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}:${i.message}`);
};

test('legal marriage age: 21 male / 18 female, exact on the birthday, Feb 29 safe', () => {
  assert.ok(meetsLegalAge('2005-10-04', 'male', '2026-10-04'));
  assert.ok(!meetsLegalAge('2005-10-05', 'male', '2026-10-04'));
  assert.ok(meetsLegalAge('2008-10-04', 'female', '2026-10-04'));
  assert.ok(!meetsLegalAge('2008-10-05', 'female', '2026-10-04'));
  assert.ok(meetsLegalAge('2007-02-28', 'male', '2028-02-29'));
  assert.ok(!meetsLegalAge('2007-03-01', 'male', '2028-02-29'));
});

test('a complete payload parses; mandal is slugified and phone normalised', () => {
  const r = OnboardingSchema.parse(valid());
  assert.equal(r.heritage.ancestralNativeMandal, 'kodad');
  assert.equal(r.contact.phone, '+919900112233');
});

test('under-age and implausible dates are rejected before reaching the database', () => {
  assert.deepEqual(fails((p) => { p.heritage.dateOfBirth = yearsAgo(20); }), ['heritage.dateOfBirth:below_legal_marriage_age']);
  assert.deepEqual(fails((p) => { p.heritage.gender = 'female'; p.heritage.dateOfBirth = yearsAgo(17); }), ['heritage.dateOfBirth:below_legal_marriage_age']);
  assert.equal(fails((p) => { p.heritage.gender = 'female'; p.heritage.dateOfBirth = yearsAgo(18); }).length, 0);
  assert.deepEqual(fails((p) => { p.heritage.dateOfBirth = '1900-01-01'; }), ['heritage.dateOfBirth:invalid_date']);
});

test('identity can never come from the body (strict objects)', () => {
  assert.ok(fails((p) => Object.assign(p, { sub: '00000000-0000-4000-8000-000000000000' })).length > 0);
  assert.ok(fails((p) => Object.assign(p.heritage, { nsMembershipId: 'NS-TG-SRPT-1' })).length > 0);
});

test('every consent is required separately and pinned to the current notice version', () => {
  assert.ok(fails((p) => { p.pledge.accepted = false as true; }).some((f) => f.startsWith('pledge.accepted')));
  assert.ok(fails((p) => { p.privacy.profileProcessingConsent = false as true; }).some((f) => f.startsWith('privacy.profileProcessingConsent')));
  assert.ok(fails((p) => { p.privacy.coordinatorVerificationConsent = false as true; }).some((f) => f.startsWith('privacy.coordinatorVerificationConsent')));
  assert.ok(fails((p) => { p.privacy.contactMaskingAcknowledged = false as true; }).length > 0);
  assert.ok(fails((p) => { p.pledge.noticeVersion = 'pledge-v0' as 'pledge-v1'; }).length > 0);
});

test('enterprise badge only for Soundarya & Wellness artisans; proposed gothra names are constrained', () => {
  assert.deepEqual(fails((p) => { p.career.salonHubSlug = 'kodad-glow-studio' as unknown as null; }), ['career.salonHubSlug:enterprise_badge_needs_wellness_artisan']);
  assert.equal(fails((p) => { p.heritage.vocation = 'wellness_artisan'; p.career.salonHubSlug = 'kodad-glow-studio' as unknown as null; }).length, 0);
  assert.equal(fails((p) => { p.heritage.gothra = { kind: 'proposed', nameEn: 'Kasyapa', nameTe: null } as never; }).length, 0);
  assert.ok(fails((p) => { p.heritage.gothra = { kind: 'proposed', nameEn: '<script>', nameTe: null } as never; }).length > 0);
});

test('notices: both languages present, versions fit the ledger column format', () => {
  for (const n of Object.values(NOTICES)) {
    assert.ok(n.en.length > 50 && n.te.length > 50);
    for (const lang of ['en', 'te']) assert.match(`${n.version}.${lang}`, /^[a-z0-9._-]{1,32}$/);
  }
});

test('status -> resume step', () => {
  assert.equal(stepForState('not_started'), 1);
  assert.equal(stepForState('rejected'), 1);
  assert.equal(stepForState('pending_mandal_review'), 7);
  assert.equal(stepForState('verified'), 7);
});
