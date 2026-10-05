import { json, postJson } from '../../../../lib/http.ts';
import { ExpressSchema } from '../../../../lib/matrimony.ts';
import { expressInterest } from '../../../../lib/match-store.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';

// RLS admits only a verified, non-Sagothra target from a verified sender; 10 per day (429).
export const POST = postJson(ExpressSchema, 'interest_express_failed', async (b, claims) =>
  json(201, await expressInterest(dbContext(claims), b.profileId)));
