import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ConsentChangeSchema,
  DiscoverQuerySchema,
  ExpressSchema,
  GrievanceSchema,
  badgesFor,
  parseCursor,
} from '../src/lib/matrimony.ts';
import { NOTICES } from '../src/lib/onboarding.ts';

const id = '6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f';

test('badges: NS-ID always, heritage stream for the three streams, enterprise only for salon founders', () => {
  assert.deepEqual(badgesFor({ vocation: 'scholarly_academic', salonHubSlug: null }).map((b) => b.en), ['NS-ID Verified']);
  assert.deepEqual(badgesFor({ vocation: 'nadopasana', salonHubSlug: null }).map((b) => b.en), ['NS-ID Verified', 'Heritage Stream · Nadopasana']);
  const salon = badgesFor({ vocation: 'wellness_artisan', salonHubSlug: 'kodad-glow-studio' });
  assert.equal(salon.at(-1)?.href, '/salon-hub/kodad-glow-studio');
  assert.equal(badgesFor({ vocation: 'nadopasana', salonHubSlug: 'kodad-glow-studio' }).length, 2);
});

test('discover filters: blanks ignored, cursor and ranges validated, no gothra filter', () => {
  assert.ok(Object.values(DiscoverQuerySchema.parse({ gender: '', district: '', ageMin: '' })).every((v) => v === undefined));
  assert.deepEqual(parseCursor(DiscoverQuerySchema.parse({ after: `1.${id}` }).after), { tier: 1, id });
  assert.ok(!DiscoverQuerySchema.safeParse({ after: `1.${id}' OR 1=1` }).success);
  assert.ok(!DiscoverQuerySchema.safeParse({ ageMin: '30', ageMax: '25' }).success);
  assert.ok(!DiscoverQuerySchema.safeParse({ ageMin: '17' }).success);
  assert.ok(!('gothra' in DiscoverQuerySchema.parse({ gothra: 'kashyapa' })));
});

test('identity never from the body; consents pinned to the shown notice; photo consent only with an upload', () => {
  assert.ok(!ExpressSchema.safeParse({ profileId: id, fromProfileId: id }).success);
  const change = { purpose: 'profile_processing', grant: false, lang: 'te', noticeVersion: NOTICES.profileProcessing.version };
  assert.ok(ConsentChangeSchema.safeParse(change).success);
  assert.ok(!ConsentChangeSchema.safeParse({ ...change, noticeVersion: NOTICES.pledge.version }).success);
  assert.ok(ConsentChangeSchema.safeParse({ ...change, purpose: 'photo_display', noticeVersion: NOTICES.photoDisplay.version }).success);
  assert.ok(!ConsentChangeSchema.safeParse({ ...change, purpose: 'photo_display', grant: true, noticeVersion: NOTICES.photoDisplay.version }).success);
  assert.ok(!ConsentChangeSchema.safeParse({ ...change, purpose: 'contact_share' }).success);
});

test('grievances: erasure only of own profile, reports must name a profile', () => {
  assert.ok(GrievanceSchema.safeParse({ category: 'data_erasure', profileId: null, description: 'Erase my data' }).success);
  assert.ok(!GrievanceSchema.safeParse({ category: 'data_erasure', profileId: id, description: 'Erase them' }).success);
  assert.ok(!GrievanceSchema.safeParse({ category: 'unauthorized_photo', profileId: null, description: 'x' }).success);
});
