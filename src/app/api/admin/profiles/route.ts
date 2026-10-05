import { reviewProfile } from '../../../../lib/admin-store.ts';
import { json, postJson } from '../../../../lib/http.ts';
import { ReviewActionSchema } from '../../../../lib/matrimony.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';

// Scope (mandal / district) and the review transitions are enforced by RLS and the profile guard;
// the door address by unmask_door_address(), which audits every read.
export const POST = postJson(ReviewActionSchema, 'admin_review_failed', async (b, claims) =>
  json(200, await reviewProfile(dbContext(claims), b)));
