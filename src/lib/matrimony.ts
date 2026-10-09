// Phase 4 request contracts and display rules (discovery, interests, privacy, admin). Pure: shared by
// route handlers, pages and client components. Strict objects: identity never comes from a body.
import { z } from 'zod';
import { NOTICES, VOCATIONS, type Bilingual } from './onboarding.ts';

const uuid = z.uuid();
const lang = z.enum(['en', 'te']);
const text = (max: number) => z.string().trim().min(1).max(max);
const slug = z.string().regex(/^[a-z][a-z-]{1,40}$/);
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

// ------------------------------------------------------------------------------------- badges
const HERITAGE_STREAMS: Partial<Record<string, Bilingual>> = {
  nadopasana: { en: 'Heritage Stream · Nadopasana', te: 'వారసత్వ ధార · నాదోపాసన' },
  wellness_artisan: { en: 'Heritage Stream · Wellness Artisan', te: 'వారసత్వ ధార · సౌందర్య కళాకారులు' },
  corporate_tech_civil: { en: 'Heritage Stream · Corporate', te: 'వారసత్వ ధార · కార్పొరేట్' },
};
export type Badge = Bilingual & { href?: string };

/** Every listed profile is verified, so "NS-ID Verified" is unconditional; the rest follow the profile. */
export function badgesFor(p: { vocation: string; salonHubSlug: string | null }): Badge[] {
  const out: Badge[] = [{ en: 'NS-ID Verified', te: 'ఎన్ఎస్-ఐడి ధృవీకరించబడింది' }];
  const stream = HERITAGE_STREAMS[p.vocation];
  if (stream) out.push(stream);
  if (p.salonHubSlug !== null && p.vocation === 'wellness_artisan') {
    out.push({ en: 'Enterprise Modernist', te: 'ఆధునిక వ్యాపారవేత్త', href: `/salon-hub/${p.salonHubSlug}` });
  }
  return out;
}

// ------------------------------------------------------------------------------------ discover
const vocationKeys = Object.keys(VOCATIONS) as [keyof typeof VOCATIONS & string, ...(keyof typeof VOCATIONS & string)[]];
const age = z.coerce.number().int().min(18).max(80);

/** GET filters. Gothra is deliberately not a filter (never in URLs); Sagothra exclusion is in SQL. */
export const DiscoverQuerySchema = z
  .object({
    gender: z.preprocess(blankToUndefined, z.enum(['male', 'female']).optional()),
    district: z.preprocess(blankToUndefined, slug.optional()),
    vocation: z.preprocess(blankToUndefined, z.enum(vocationKeys).optional()),
    ageMin: z.preprocess(blankToUndefined, age.optional()),
    ageMax: z.preprocess(blankToUndefined, age.optional()),
    after: z.preprocess(blankToUndefined, z.string().regex(/^[0-4]\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).optional()),
    includeBorderDistricts: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
    excludeMaternalGotra: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  })
  .refine((q) => q.ageMin === undefined || q.ageMax === undefined || q.ageMin <= q.ageMax, { path: ['ageMax'] });
export type DiscoverQuery = z.infer<typeof DiscoverQuerySchema>;

export function parseCursor(after: string | undefined): { tier: number; id: string } | null {
  return after === undefined ? null : { tier: Number(after.slice(0, 1)), id: after.slice(2) };
}

// ----------------------------------------------------------------------------------- interests
export const ExpressSchema = z.strictObject({ profileId: uuid });
export const RespondSchema = z.strictObject({ interestId: uuid, decision: z.enum(['accepted', 'declined']) });
export const ContactConsentSchema = z.strictObject({
  interestId: uuid,
  grant: z.boolean(),
  lang,
  noticeVersion: z.literal(NOTICES.contactShare.version),
});
export const RevealContactSchema = z.strictObject({ interestId: uuid });

// ------------------------------------------------------------------------------------- privacy
export const CONSENT_NOTICES = {
  community_pledge: NOTICES.pledge,
  profile_processing: NOTICES.profileProcessing,
  coordinator_verification: NOTICES.coordinatorVerification,
  photo_display: NOTICES.photoDisplay,
} as const;
export type ConsentPurpose = keyof typeof CONSENT_NOTICES;

export const ConsentChangeSchema = z
  .strictObject({
    purpose: z.enum(['community_pledge', 'profile_processing', 'coordinator_verification', 'photo_display']),
    grant: z.boolean(),
    lang,
    noticeVersion: z.string().max(32),
  })
  // Photo consent is granted together with an upload (POST /api/photos), never on its own.
  .refine((c) => !(c.purpose === 'photo_display' && c.grant), { path: ['grant'] })
  .refine((c) => c.noticeVersion === CONSENT_NOTICES[c.purpose].version, { path: ['noticeVersion'] });

export const PhotoFieldsSchema = z.object({ lang, consent: z.literal('yes'), noticeVersion: z.literal(NOTICES.photoDisplay.version) });
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const GrievanceSchema = z
  .strictObject({
    category: z.enum(['profile_dispute', 'unauthorized_photo', 'data_erasure']),
    profileId: uuid.nullable(),
    description: text(2000),
  })
  // Erasure is always about the requester's own profile (the server fills it in).
  .refine((g) => (g.category === 'data_erasure') === (g.profileId === null), { path: ['profileId'] });

// --------------------------------------------------------------------------------------- admin
export const ADMIN_ROLES = ['mandal_coordinator', 'district_lineage_officer', 'grievance_officer'] as const;

export const ReviewActionSchema = z.discriminatedUnion('action', [
  z.strictObject({ action: z.literal('verify'), profileId: uuid }),
  z.strictObject({ action: z.literal('reject'), profileId: uuid, reason: text(500) }),
  z.strictObject({ action: z.literal('door_address'), profileId: uuid }),
]);
export const GothraResolutionSchema = z.strictObject({ gothraId: uuid, mergeInto: z.preprocess(blankToUndefined, uuid.optional()) });
export const GrievanceActionSchema = z.discriminatedUnion('action', [
  z.strictObject({ action: z.literal('assign'), ticketId: uuid }),
  z.strictObject({ action: z.literal('propose'), ticketId: uuid, kind: z.enum(['erase_profile', 'remove_photo', 'resolve']), note: text(1000) }),
  z.strictObject({ action: z.literal('approve'), actionId: uuid }),
  z.strictObject({ action: z.literal('contact'), ticketId: uuid }),
]);
