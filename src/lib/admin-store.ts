import 'server-only';
import { z } from 'zod';
import { unmaskContact, unmaskDoorAddress } from './crypto.ts';
import { withTx, type DbContext } from './db.ts';
import { AppError } from './http.ts';
import type { GrievanceActionSchema, ReviewActionSchema } from './matrimony.ts';
import { photoUrl } from './storage.ts';

// /nsm-admin queues. Scope is decided by the database (sub_admins assignment AND token role, via
// RLS and the SECURITY DEFINER routines); the page only chooses which queues to render.
type ReviewAction = z.infer<typeof ReviewActionSchema>;
type GrievanceAction = z.infer<typeof GrievanceActionSchema>;

const PhotoCols = z.object({ object_id: z.uuid().nullable(), variant: z.enum(['full', 'blurred']).nullable() });
const toUrl = (r: z.infer<typeof PhotoCols>) => (r.object_id && r.variant === 'full' ? photoUrl(r.object_id, 'full') : null);

// ---------------------------------------------------------------------- queue 1: verification
const ReviewRow = PhotoCols.extend({
  id: z.uuid(), matrimonial_id: z.string().nullable(), display_name: z.string(), gender: z.string(), age: z.number(),
  vocation: z.string(), salon_hub_slug: z.string().nullable(), education_degree: z.string().nullable(), occupation: z.string().nullable(),
  maternal_lineage: z.string().nullable(), gothra_en: z.string().nullable(), gothra_te: z.string().nullable(), gothra_ratified: z.boolean(),
  district_en: z.string(), mandal_en: z.string(), submitted_at: z.date().nullable(), assigned_to_me: z.boolean(),
});

export async function reviewQueue(ctx: DbContext) {
  const { rows } = await withTx(ctx, (tx) =>
    tx.query(
      `SELECT p.id, p.matrimonial_id, p.display_name, p.gender::text AS gender,
              extract(year FROM age((now() AT TIME ZONE 'Asia/Kolkata')::date, p.date_of_birth))::int AS age,
              p.vocation::text AS vocation, p.salon_hub_slug, p.education_degree, p.occupation, p.maternal_lineage,
              g.name_en AS gothra_en, g.name_te AS gothra_te, coalesce(g.is_verified, false) AS gothra_ratified,
              d.name_en AS district_en, m.name_en AS mandal_en, p.submitted_at,
              coalesce(p.assigned_coordinator_user_id = $1, false) AS assigned_to_me, ph.object_id, ph.variant
         FROM matrimony_shared.profiles p
         JOIN matrimony_shared.districts d ON d.slug = p.ancestral_native_district
         JOIN matrimony_shared.mandals m ON m.district = p.ancestral_native_district AND m.slug = p.ancestral_native_mandal
         LEFT JOIN matrimony_shared.gothra_master g ON g.id = p.gothra_id
         LEFT JOIN LATERAL matrimony_shared.fn_photo_access(p.id) ph ON true
        WHERE p.status = 'pending_mandal_review' AND p.root_user_id <> $1
        ORDER BY p.submitted_at`,
      [ctx.sub],
    ),
  );
  return z.array(ReviewRow).parse(rows).map((r) => ({ ...r, photoUrl: toUrl(r) }));
}

export async function reviewProfile(ctx: DbContext, a: ReviewAction) {
  return withTx(ctx, async (tx) => {
    if (a.action === 'door_address') return { address: await unmaskDoorAddress(tx, a.profileId) };
    const { rowCount } = await tx.query(
      `UPDATE matrimony_shared.profiles SET status = $3::matrimony_shared.profile_status, review_note = $4
        WHERE id = $1 AND root_user_id <> $2 AND status = 'pending_mandal_review'`,
      [a.profileId, ctx.sub, a.action === 'verify' ? 'verified' : 'rejected', a.action === 'reject' ? a.reason : null],
    );
    // Out of scope and nonexistent look the same.
    if (rowCount !== 1) throw new AppError(404, 'not_found');
    return { status: a.action === 'verify' ? 'verified' : 'rejected' };
  });
}

// --------------------------------------------------------------------- queue 2: gothra lineage
const ProposalRow = z.object({ id: z.uuid(), name_en: z.string(), name_te: z.string().nullable(), profiles: z.number() });
const GothraRow = z.object({ id: z.uuid(), name_en: z.string(), name_te: z.string() });

export async function gothraQueue(ctx: DbContext) {
  return withTx(ctx, async (tx) => {
    const proposals = await tx.query(
      `SELECT g.id, g.name_en, g.name_te, count(p.id)::int AS profiles
         FROM matrimony_shared.gothra_master g
         JOIN matrimony_shared.profiles p ON p.gothra_id = g.id AND p.status IN ('pending_mandal_review', 'rejected') AND p.root_user_id <> $1
        WHERE NOT g.is_verified
        GROUP BY g.id ORDER BY g.name_en`,
      [ctx.sub],
    );
    const verified = await tx.query('SELECT id, name_en, name_te FROM matrimony_shared.gothra_master WHERE is_verified AND active ORDER BY name_en');
    return { proposals: z.array(ProposalRow).parse(proposals.rows), verified: z.array(GothraRow).parse(verified.rows) };
  });
}

export async function resolveGothra(ctx: DbContext, gothraId: string, mergeInto: string | undefined) {
  await withTx(ctx, (tx) => tx.query('SELECT matrimony_shared.fn_resolve_gothra_proposal($1, $2)', [gothraId, mergeInto ?? null]));
  return { status: mergeInto ? 'merged' : 'ratified' };
}

// -------------------------------------------------------------------------- queue 3: grievances
const TicketRow = z.object({
  id: z.uuid(), category: z.string(), status: z.string(), description: z.string(), created_at: z.date(),
  subject_profile_id: z.uuid().nullable(), mine: z.boolean(), unassigned: z.boolean(), filed_by_me: z.boolean(),
});
const ActionRow = z.object({
  id: z.uuid(), ticket_id: z.uuid(), action: z.string(), note: z.string(), proposed_by_me: z.boolean(),
  proposed_at: z.date(), approved: z.boolean(), approved_by_me: z.boolean(), approved_at: z.date().nullable(),
});

export async function grievanceQueue(ctx: DbContext) {
  return withTx(ctx, async (tx) => {
    const tickets = z.array(TicketRow).parse((await tx.query(
      `SELECT id, category, status::text AS status, description, created_at, subject_profile_id,
              coalesce(assigned_officer_user_id = $1, false) AS mine, assigned_officer_user_id IS NULL AS unassigned,
              complainant_user_id = $1 AS filed_by_me
         FROM matrimony_shared.grievance_tickets WHERE status IN ('open', 'in_progress') ORDER BY created_at`,
      [ctx.sub],
    )).rows);
    const actions = z.array(ActionRow).parse((await tx.query(
      `SELECT id, ticket_id, action, note, proposed_by = $1 AS proposed_by_me, proposed_at, approved_by IS NOT NULL AS approved,
              coalesce(approved_by = $1, false) AS approved_by_me, approved_at
         FROM matrimony_shared.grievance_actions WHERE ticket_id = ANY ($2::uuid[]) ORDER BY proposed_at`,
      [ctx.sub, tickets.map((t) => t.id)],
    )).rows);
    const photos = new Map<string, string | null>();
    for (const t of tickets) {
      if (t.category !== 'unauthorized_photo' || !t.subject_profile_id || !t.mine) continue;
      const { rows } = await tx.query('SELECT object_id, variant FROM matrimony_shared.fn_photo_access($1)', [t.subject_profile_id]);
      photos.set(t.id, rows[0] === undefined ? null : toUrl(PhotoCols.parse(rows[0])));
    }
    return tickets.map((t) => ({ ...t, actions: actions.filter((a) => a.ticket_id === t.id), photoUrl: photos.get(t.id) ?? null }));
  });
}

/** Returns what the route should show, plus a photo object to delete after commit (takedown / erasure). */
export async function grievanceAction(ctx: DbContext, a: GrievanceAction): Promise<{ body: Record<string, unknown>; photoToDelete: string | null }> {
  return withTx(ctx, async (tx) => {
    if (a.action === 'assign') {
      const { rowCount } = await tx.query(
        `UPDATE matrimony_shared.grievance_tickets SET assigned_officer_user_id = $2, status = 'in_progress'
          WHERE id = $1 AND status IN ('open', 'in_progress') AND complainant_user_id <> $2`,
        [a.ticketId, ctx.sub],
      );
      if (rowCount !== 1) throw new AppError(404, 'not_found');
      return { body: { status: 'in_progress' }, photoToDelete: null };
    }
    if (a.action === 'propose') {
      const { rows } = await tx.query('SELECT matrimony_shared.fn_propose_grievance_action($1, $2, $3) AS id', [a.ticketId, a.kind, a.note]);
      return { body: { actionId: z.object({ id: z.uuid() }).parse(rows[0]).id, status: a.kind === 'resolve' ? 'resolved' : 'awaiting_second_officer' }, photoToDelete: null };
    }
    if (a.action === 'approve') {
      const { rows } = await tx.query('SELECT matrimony_shared.fn_approve_grievance_action($1) AS photo', [a.actionId]);
      return { body: { status: 'resolved' }, photoToDelete: z.object({ photo: z.uuid().nullable() }).parse(rows[0]).photo };
    }
    const { rows } = await tx.query('SELECT subject_profile_id FROM matrimony_shared.grievance_tickets WHERE id = $1', [a.ticketId]);
    const subject = rows[0]?.subject_profile_id;
    if (!subject) throw new AppError(404, 'not_found');
    return { body: { ...(await unmaskContact(tx, subject, a.ticketId)) }, photoToDelete: null };
  });
}
