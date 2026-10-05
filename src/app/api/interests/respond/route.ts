import { json, postJson } from '../../../../lib/http.ts';
import { RespondSchema } from '../../../../lib/matrimony.ts';
import { respondToInterest } from '../../../../lib/match-store.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';

export const POST = postJson(RespondSchema, 'interest_respond_failed', async (b, claims) =>
  json(200, await respondToInterest(dbContext(claims), b.interestId, b.decision)));
