import 'server-only';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { setContactDetails } from './crypto.ts';
import { withTx, type DbContext } from './db.ts';
import { AppError, type ConsentEvidence } from './http.ts';
import { NOTICES, stepForState, type OnboardingInput, type OnboardingStatus } from './onboarding.ts';
import type { SsoClaims } from './sso.ts';

export const dbContext = (claims: SsoClaims): DbContext => ({ sub: claims.sub, roles: claims.roles });

const GothraRow = z.object({ id: z.uuid(), slug: z.string(), name_en: z.string(), name_te: z.string() });
const DistrictRow = z.object({ slug: z.string(), code: z.string(), name_en: z.string(), name_te: z.string() });
const StatusRow = z.object({
  status: z.enum(['draft', 'pending_mandal_review', 'verified', 'rejected', 'suspended', 'erased']),
  matrimonial_id: z.string().nullable(),
  coordinator_assigned: z.boolean(),
  review_note: z.string().nullable(),
});
const SubmitRow = z.object({ matrimonial_id: z.string(), coordinator_assigned: z.boolean() });

export async function listGothras(ctx: DbContext) {
  const { rows } = await withTx(ctx, (tx) =>
    tx.query('SELECT id, slug, name_en, name_te FROM matrimony_shared.gothra_master WHERE is_verified AND active ORDER BY name_en'),
  );
  return z.array(GothraRow).parse(rows).map((g) => ({ id: g.id, slug: g.slug, nameEn: g.name_en, nameTe: g.name_te }));
}

export async function listDistricts(ctx: DbContext) {
  const { rows } = await withTx(ctx, (tx) =>
    tx.query('SELECT slug, code, name_en, name_te FROM matrimony_shared.districts ORDER BY name_en'),
  );
  return z.array(DistrictRow).parse(rows).map((d) => ({ slug: d.slug, code: d.code, nameEn: d.name_en, nameTe: d.name_te }));
}

const MandalRow = z.object({ district: z.string(), slug: z.string(), name_en: z.string() });
export async function listMandals(ctx: DbContext) {
  const { rows } = await withTx(ctx, (tx) => tx.query('SELECT district, slug, name_en FROM matrimony_shared.mandals ORDER BY district, name_en'));
  return z.array(MandalRow).parse(rows).map((m) => ({ district: m.district, slug: m.slug, nameEn: m.name_en }));
}

export async function getOnboardingStatus(ctx: DbContext): Promise<OnboardingStatus> {
  // Filter on root_user_id explicitly: coordinators can see other rows through RLS.
  const { rows } = await withTx(ctx, (tx) =>
    tx.query(
      `SELECT status, matrimonial_id, assigned_coordinator_user_id IS NOT NULL AS coordinator_assigned, review_note
         FROM matrimony_shared.profiles WHERE root_user_id = $1`,
      [ctx.sub],
    ),
  );
  const row = rows[0] === undefined ? undefined : StatusRow.parse(rows[0]);
  const state = row?.status ?? 'not_started';
  return {
    state,
    step: stepForState(state),
    matrimonialId: row?.matrimonial_id ?? null,
    coordinatorAssigned: row?.coordinator_assigned ?? false,
    reviewNote: row?.review_note ?? null,
  };
}

async function resolveGothra(tx: PoolClient, choice: OnboardingInput['heritage']['gothra']): Promise<string> {
  if (choice.kind === 'proposed') {
    const { rows } = await tx.query('SELECT matrimony_shared.fn_propose_gothra($1, $2) AS id', [choice.nameEn, choice.nameTe]);
    return z.object({ id: z.uuid() }).parse(rows[0]).id;
  }
  const { rows } = await tx.query(
    'SELECT id FROM matrimony_shared.gothra_master WHERE id = $1 AND is_verified AND active',
    [choice.id],
  );
  if (rows.length !== 1) throw new AppError(422, 'unknown_gothra');
  return choice.id;
}

/**
 * One transaction: draft profile (insert, or update after rejection), encrypted contact, one
 * consent-ledger row per purpose, then fn_submit_profile() checks consents, assigns the mandal
 * coordinator and issues the matrimonial ID. Identity comes only from the verified token.
 */
export async function submitOnboarding(ctx: DbContext, nsMembershipId: string, input: OnboardingInput, evidence: ConsentEvidence) {
  const { heritage: h, career: c, privacy, contact, lang } = input;
  return withTx(ctx, async (tx) => {
    const gothraId = await resolveGothra(tx, h.gothra);
    const saved = await tx.query(
      `INSERT INTO matrimony_shared.profiles AS p
         (root_user_id, ns_membership_id, display_name, gender, date_of_birth, gothra_id, maternal_lineage, vocation,
          ancestral_native_district, ancestral_native_mandal, education_degree, occupation, income_bracket,
          salon_hub_slug, birth_time, birth_place, nakshatra, photo_visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (root_user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name, gender = EXCLUDED.gender, date_of_birth = EXCLUDED.date_of_birth,
         gothra_id = EXCLUDED.gothra_id, maternal_lineage = EXCLUDED.maternal_lineage, vocation = EXCLUDED.vocation,
         ancestral_native_district = EXCLUDED.ancestral_native_district, ancestral_native_mandal = EXCLUDED.ancestral_native_mandal,
         education_degree = EXCLUDED.education_degree, occupation = EXCLUDED.occupation, income_bracket = EXCLUDED.income_bracket,
         salon_hub_slug = EXCLUDED.salon_hub_slug, birth_time = EXCLUDED.birth_time, birth_place = EXCLUDED.birth_place,
         nakshatra = EXCLUDED.nakshatra, photo_visibility = EXCLUDED.photo_visibility
       WHERE p.status IN ('draft', 'rejected')
       RETURNING p.id`,
      [ctx.sub, nsMembershipId, h.displayName, h.gender, h.dateOfBirth, gothraId, h.maternalLineage, h.vocation,
       h.ancestralNativeDistrict, h.ancestralNativeMandal, c.educationDegree, c.occupation, c.incomeBracket,
       c.salonHubSlug, c.birthTime, c.birthPlace, c.nakshatra, privacy.photoVisibility],
    );
    if (saved.rowCount !== 1) throw new AppError(409, 'already_submitted');

    await setContactDetails(tx, contact);

    const notices = [
      ['community_pledge', NOTICES.pledge],
      ['profile_processing', NOTICES.profileProcessing],
      ['coordinator_verification', NOTICES.coordinatorVerification],
    ] as const;
    await tx.query(
      `INSERT INTO matrimony_shared.dpdp_consent_logs (root_user_id, purpose, notice_version, statement, granted, ip, user_agent)
       SELECT $1, n.purpose::matrimony_shared.consent_purpose, n.version, n.statement, true, $2::inet, $3
         FROM unnest($4::text[], $5::text[], $6::text[]) WITH ORDINALITY AS n(purpose, version, statement, ord)
        ORDER BY n.ord`,
      [ctx.sub, evidence.ip, evidence.userAgent,
       notices.map(([purpose]) => purpose),
       notices.map(([, n]) => `${n.version}.${lang}`),
       notices.map(([, n]) => n[lang])],
    );

    const { rows } = await tx.query('SELECT matrimonial_id, coordinator_assigned FROM matrimony_shared.fn_submit_profile()');
    const result = SubmitRow.parse(rows[0]);
    return { matrimonialId: result.matrimonial_id, coordinatorAssigned: result.coordinator_assigned, status: 'pending_mandal_review' as const };
  });
}
