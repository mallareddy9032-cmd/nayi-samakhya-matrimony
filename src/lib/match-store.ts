import 'server-only';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { unmaskContact } from './crypto.ts';
import { withTx, type DbContext } from './db.ts';
import { AppError, type ConsentEvidence } from './http.ts';
import { CONSENT_NOTICES, parseCursor, type ConsentPurpose, type DiscoverQuery } from './matrimony.ts';
import { NOTICES, type Lang } from './onboarding.ts';
import { photoUrl } from './storage.ts';

// Member-facing reads and writes. Every query runs as nsm_app_user under RLS; the explicit
// verified / non-self / non-Sagothra predicates below repeat the policy on purpose, because a
// coordinator's own policy would otherwise let in-scope profiles into their member views.
const PAGE = 20;
const TODAY = "(now() AT TIME ZONE 'Asia/Kolkata')::date";
const VISIBLE = `p.status = 'verified' AND p.root_user_id <> $1
  AND NOT (p.gothra_id = ANY ((SELECT matrimony_shared.fn_viewer_sagothra_ids())::uuid[]))`;

export type Photo = { url: string; variant: 'full' | 'blurred' } | null;
const PhotoCols = z.object({ object_id: z.uuid().nullable(), variant: z.enum(['full', 'blurred']).nullable() });
const toPhoto = (r: z.infer<typeof PhotoCols>): Photo => (r.object_id && r.variant ? { url: photoUrl(r.object_id, r.variant), variant: r.variant } : null);

const ViewerRow = z.object({ id: z.uuid(), status: z.string(), gender: z.enum(['male', 'female']).nullable() });
async function viewer(tx: PoolClient, sub: string) {
  const { rows } = await tx.query('SELECT id, status, gender FROM matrimony_shared.profiles WHERE root_user_id = $1', [sub]);
  return rows[0] === undefined ? null : ViewerRow.parse(rows[0]);
}

// ------------------------------------------------------------------------------------ discover
const CardRow = PhotoCols.extend({
  id: z.uuid(), first_name: z.string(), age: z.number(), vocation: z.string(), salon_hub_slug: z.string().nullable(),
  district_en: z.string(), district_te: z.string(), tier: z.number(),
});

/** Same mandal, then same district, then the rest of Telangana; keyset-paginated on (tier, id). */
export async function discover(ctx: DbContext, q: DiscoverQuery) {
  return withTx(ctx, async (tx) => {
    const me = await viewer(tx, ctx.sub);
    if (me?.status !== 'verified') return { viewerStatus: me?.status ?? 'not_started', gender: null, cards: [], next: null };
    const gender = q.gender ?? (me.gender === 'male' ? 'female' : 'male');
    const cursor = parseCursor(q.after);
    const { rows } = await tx.query(
      `SELECT c.*, ph.object_id, ph.variant FROM (
         SELECT p.id, split_part(p.display_name, ' ', 1) AS first_name,
                extract(year FROM age(${TODAY}, p.date_of_birth))::int AS age,
                p.vocation::text AS vocation, p.salon_hub_slug, d.name_en AS district_en, d.name_te AS district_te,
                CASE WHEN p.ancestral_native_district = me.district AND p.ancestral_native_mandal = me.mandal THEN 0
                     WHEN p.ancestral_native_district = me.district THEN 1 ELSE 2 END AS tier
           FROM matrimony_shared.profiles p
           JOIN matrimony_shared.districts d ON d.slug = p.ancestral_native_district
          CROSS JOIN (SELECT ancestral_native_district AS district, ancestral_native_mandal AS mandal
                        FROM matrimony_shared.profiles WHERE root_user_id = $1) me
          WHERE ${VISIBLE}
            AND p.gender = $2::matrimony_shared.gender
            AND ($3::text IS NULL OR p.ancestral_native_district = $3)
            AND ($4::text IS NULL OR p.vocation::text = $4)
            AND ($5::int IS NULL OR p.date_of_birth <= ${TODAY} - make_interval(years => $5))
            AND ($6::int IS NULL OR p.date_of_birth > ${TODAY} - make_interval(years => $6 + 1))
       ) c
       LEFT JOIN LATERAL matrimony_shared.fn_photo_access(c.id) ph ON true
       WHERE ($7::int IS NULL OR (c.tier, c.id) > ($7, $8::uuid))
       ORDER BY c.tier, c.id
       LIMIT $9`,
      [ctx.sub, gender, q.district ?? null, q.vocation ?? null, q.ageMin ?? null, q.ageMax ?? null, cursor?.tier ?? null, cursor?.id ?? null, PAGE + 1],
    );
    const cards = z.array(CardRow).parse(rows).map((r) => ({
      id: r.id, firstName: r.first_name, age: r.age, vocation: r.vocation, salonHubSlug: r.salon_hub_slug,
      district: { en: r.district_en, te: r.district_te }, tier: r.tier, photo: toPhoto(r),
    }));
    const last = cards.length > PAGE ? cards[PAGE - 1] : undefined;
    return { viewerStatus: me.status, gender, cards: cards.slice(0, PAGE), next: last ? `${last.tier}.${last.id}` : null };
  });
}

// ------------------------------------------------------------------------------------- profile
const ProfileRow = PhotoCols.extend({
  id: z.uuid(), display_name: z.string(), age: z.number(), vocation: z.string(), salon_hub_slug: z.string().nullable(),
  education_degree: z.string().nullable(), occupation: z.string().nullable(), income_bracket: z.string().nullable(),
  nakshatra: z.string().nullable(), birth_time: z.string().nullable(), birth_place: z.string().nullable(),
  district_en: z.string(), district_te: z.string(), mandal_en: z.string(),
});
const InterestRow = z.object({
  id: z.uuid(), status: z.string(), sent_by_me: z.boolean(), my_consent: z.boolean(), their_consent: z.boolean(),
});
export type InterestState = { id: string; status: string; sentByMe: boolean; myConsent: boolean; theirConsent: boolean } | null;

export async function getProfileView(ctx: DbContext, profileId: string) {
  return withTx(ctx, async (tx) => {
    const me = await viewer(tx, ctx.sub);
    if (me?.status !== 'verified') return null;
    const { rows } = await tx.query(
      `SELECT p.id, p.display_name, extract(year FROM age(${TODAY}, p.date_of_birth))::int AS age, p.vocation::text AS vocation,
              p.salon_hub_slug, p.education_degree, p.occupation, p.income_bracket::text AS income_bracket, p.nakshatra::text AS nakshatra,
              to_char(p.birth_time, 'HH24:MI') AS birth_time, p.birth_place,
              d.name_en AS district_en, d.name_te AS district_te, m.name_en AS mandal_en, ph.object_id, ph.variant
         FROM matrimony_shared.profiles p
         JOIN matrimony_shared.districts d ON d.slug = p.ancestral_native_district
         JOIN matrimony_shared.mandals m ON m.district = p.ancestral_native_district AND m.slug = p.ancestral_native_mandal
         LEFT JOIN LATERAL matrimony_shared.fn_photo_access(p.id) ph ON true
        WHERE p.id = $2 AND ${VISIBLE}`,
      [ctx.sub, z.uuid().parse(profileId)],
    );
    if (rows[0] === undefined) return null;
    const p = ProfileRow.parse(rows[0]);
    const i = await tx.query(
      `SELECT id, status::text AS status, from_profile_id = $1 AS sent_by_me,
              CASE WHEN from_profile_id = $1 THEN sender_contact_consent_at ELSE recipient_contact_consent_at END IS NOT NULL AS my_consent,
              CASE WHEN from_profile_id = $1 THEN recipient_contact_consent_at ELSE sender_contact_consent_at END IS NOT NULL AS their_consent
         FROM matrimony_shared.interests
        WHERE (from_profile_id = $1 AND to_profile_id = $2) OR (from_profile_id = $2 AND to_profile_id = $1)`,
      [me.id, p.id],
    );
    const row = i.rows[0] === undefined ? null : InterestRow.parse(i.rows[0]);
    const interest: InterestState = row && { id: row.id, status: row.status, sentByMe: row.sent_by_me, myConsent: row.my_consent, theirConsent: row.their_consent };
    // Exact birth time and place only once both sides have accepted (horoscope matching).
    const accepted = interest?.status === 'accepted' || interest?.status === 'contact_unlocked';
    return {
      id: p.id, displayName: p.display_name, age: p.age, vocation: p.vocation, salonHubSlug: p.salon_hub_slug,
      educationDegree: p.education_degree, occupation: p.occupation, incomeBracket: p.income_bracket, nakshatra: p.nakshatra,
      birthTime: accepted ? p.birth_time : null, birthPlace: accepted ? p.birth_place : null,
      district: { en: p.district_en, te: p.district_te }, mandal: p.mandal_en, photo: toPhoto(p), interest,
    };
  });
}

// ----------------------------------------------------------------------------------- interests
const InterestListRow = z.object({
  id: z.uuid(), status: z.string(), sent_by_me: z.boolean(), other_id: z.uuid().nullable(), other_name: z.string().nullable(),
});
export async function listInterests(ctx: DbContext) {
  const { rows } = await withTx(ctx, (tx) =>
    tx.query(
      `WITH me AS (SELECT id FROM matrimony_shared.profiles WHERE root_user_id = $1)
       SELECT i.id, i.status::text AS status, i.from_profile_id = me.id AS sent_by_me, p.id AS other_id,
              split_part(p.display_name, ' ', 1) AS other_name
         FROM matrimony_shared.interests i CROSS JOIN me
         LEFT JOIN matrimony_shared.profiles p
                ON p.id = CASE WHEN i.from_profile_id = me.id THEN i.to_profile_id ELSE i.from_profile_id END AND ${VISIBLE}
        ORDER BY i.created_at DESC`,
      [ctx.sub],
    ),
  );
  return z.array(InterestListRow).parse(rows).map((r) => ({ id: r.id, status: r.status, sentByMe: r.sent_by_me, otherId: r.other_id, otherName: r.other_name }));
}

const StatusOut = z.object({ status: z.string() });

export async function expressInterest(ctx: DbContext, profileId: string) {
  const { rows } = await withTx(ctx, (tx) =>
    tx.query(
      `INSERT INTO matrimony_shared.interests (from_profile_id, to_profile_id)
       VALUES (matrimony_shared.fn_current_profile_id(), $1) RETURNING id, status::text AS status`,
      [profileId],
    ),
  );
  return z.object({ id: z.uuid(), status: z.string() }).parse(rows[0]);
}

export async function respondToInterest(ctx: DbContext, interestId: string, decision: 'accepted' | 'declined') {
  const { rows } = await withTx(ctx, (tx) =>
    tx.query(
      `UPDATE matrimony_shared.interests SET status = $2::matrimony_shared.interest_status
        WHERE id = $1 AND to_profile_id = matrimony_shared.fn_current_profile_id() AND status = 'sent'
        RETURNING status::text AS status`,
      [interestId, decision],
    ),
  );
  if (rows[0] === undefined) throw new AppError(404, 'no_pending_interest');
  return StatusOut.parse(rows[0]);
}

export async function setContactConsent(ctx: DbContext, interestId: string, grant: boolean, lang: Lang, evidence: ConsentEvidence) {
  const fn = grant ? 'fn_grant_contact_share' : 'fn_withdraw_contact_share';
  const { rows } = await withTx(ctx, (tx) =>
    tx.query(`SELECT matrimony_shared.${fn}($1, $2, $3, $4::inet, $5)::text AS status`, [
      interestId, `${NOTICES.contactShare.version}.${lang}`, NOTICES.contactShare[lang], evidence.ip, evidence.userAgent,
    ]),
  );
  return StatusOut.parse(rows[0]);
}

/** Decrypts the other party's contact; the database refuses (42501) unless both consents stand, and audits it. */
export async function revealContact(ctx: DbContext, interestId: string) {
  return withTx(ctx, async (tx) => {
    const { rows } = await tx.query(
      `SELECT CASE WHEN from_profile_id = matrimony_shared.fn_current_profile_id() THEN to_profile_id ELSE from_profile_id END AS other
         FROM matrimony_shared.interests WHERE id = $1`,
      [interestId],
    );
    if (rows[0] === undefined) throw new AppError(404, 'not_found');
    return unmaskContact(tx, z.object({ other: z.uuid() }).parse(rows[0]).other);
  });
}

// ------------------------------------------------------------------------------------- privacy
const ConsentRow = z.object({ purpose: z.string(), granted: z.boolean(), notice_version: z.string(), created_at: z.date() });
const TicketRow = z.object({ id: z.uuid(), category: z.string(), status: z.string(), created_at: z.date() });

export async function privacyOverview(ctx: DbContext) {
  return withTx(ctx, async (tx) => {
    const me = await viewer(tx, ctx.sub);
    const consents = await tx.query(
      `SELECT DISTINCT ON (purpose) purpose::text AS purpose, granted, notice_version, created_at
         FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = $1 AND interest_id IS NULL
        ORDER BY purpose, seq DESC`,
      [ctx.sub],
    );
    const photo = me ? await tx.query('SELECT object_id, variant FROM matrimony_shared.fn_photo_access($1)', [me.id]) : { rows: [] };
    const tickets = await tx.query(
      `SELECT id, category, status::text AS status, created_at FROM matrimony_shared.grievance_tickets
        WHERE complainant_user_id = $1 ORDER BY created_at DESC`,
      [ctx.sub],
    );
    return {
      status: me?.status ?? 'not_started',
      consents: Object.fromEntries(z.array(ConsentRow).parse(consents.rows).map((c) => [c.purpose, { granted: c.granted, version: c.notice_version, at: c.created_at }])),
      photo: photo.rows[0] === undefined ? null : toPhoto(PhotoCols.parse(photo.rows[0])),
      tickets: z.array(TicketRow).parse(tickets.rows),
    };
  });
}

async function logConsent(tx: PoolClient, sub: string, purpose: ConsentPurpose, granted: boolean, lang: Lang, evidence: ConsentEvidence) {
  const notice = CONSENT_NOTICES[purpose];
  await tx.query(
    `INSERT INTO matrimony_shared.dpdp_consent_logs (root_user_id, purpose, notice_version, statement, granted, ip, user_agent)
     VALUES ($1, $2::matrimony_shared.consent_purpose, $3, $4, $5, $6::inet, $7)`,
    [sub, purpose, `${notice.version}.${lang}`, notice[lang], granted, evidence.ip, evidence.userAgent],
  );
}

/**
 * One ledger row per click. Withdrawal suspends the profile (DB trigger); withdrawing photo consent
 * also detaches the photo, whose objects the caller deletes after commit. Re-granting the last
 * missing onboarding consent of a suspended profile re-submits it for review.
 */
export async function changeConsent(ctx: DbContext, purpose: ConsentPurpose, grant: boolean, lang: Lang, evidence: ConsentEvidence) {
  return withTx(ctx, async (tx) => {
    let photoToDelete: string | null = null;
    if (purpose === 'photo_display' && !grant) {
      const { rows } = await tx.query('SELECT matrimony_shared.fn_set_profile_photo(NULL) AS previous');
      photoToDelete = z.object({ previous: z.uuid().nullable() }).parse(rows[0]).previous;
    }
    await logConsent(tx, ctx.sub, purpose, grant, lang, evidence);
    if (grant) {
      const { rows } = await tx.query(
        `SELECT p.status = 'suspended' AND (
                  SELECT bool_and(l.granted) = true AND count(*) = 3 FROM (
                    SELECT DISTINCT ON (purpose) granted FROM matrimony_shared.dpdp_consent_logs
                     WHERE root_user_id = $1 AND interest_id IS NULL
                       AND purpose IN ('community_pledge', 'profile_processing', 'coordinator_verification')
                     ORDER BY purpose, seq DESC) l) AS resume
           FROM matrimony_shared.profiles p WHERE p.root_user_id = $1`,
        [ctx.sub],
      );
      if (rows[0]?.resume === true) await tx.query('SELECT * FROM matrimony_shared.fn_submit_profile()');
    }
    const { rows } = await tx.query('SELECT status::text AS status FROM matrimony_shared.profiles WHERE root_user_id = $1', [ctx.sub]);
    return { status: rows[0] === undefined ? null : StatusOut.parse(rows[0]).status, photoToDelete };
  });
}

/** Photo consent row and the new photo in one transaction; returns the replaced object id. */
export async function attachPhoto(ctx: DbContext, objectId: string, lang: Lang, evidence: ConsentEvidence) {
  return withTx(ctx, async (tx) => {
    await logConsent(tx, ctx.sub, 'photo_display', true, lang, evidence);
    const { rows } = await tx.query('SELECT matrimony_shared.fn_set_profile_photo($1) AS previous', [objectId]);
    return z.object({ previous: z.uuid().nullable() }).parse(rows[0]).previous;
  });
}

export async function fileGrievance(ctx: DbContext, category: string, profileId: string | null, description: string) {
  return withTx(ctx, async (tx) => {
    const subject = profileId === null
      ? (await tx.query('SELECT matrimony_shared.fn_current_profile_id() AS id')).rows[0]?.id
      : (await tx.query(`SELECT p.id FROM matrimony_shared.profiles p WHERE p.id = $2 AND ${VISIBLE}`, [ctx.sub, profileId])).rows[0]?.id;
    if (!subject) throw new AppError(404, 'not_found');
    const { rows } = await tx.query(
      `INSERT INTO matrimony_shared.grievance_tickets (complainant_user_id, subject_profile_id, category, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [ctx.sub, subject, category, description],
    );
    return z.object({ id: z.uuid() }).parse(rows[0]);
  });
}
