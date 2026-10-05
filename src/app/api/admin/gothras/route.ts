import { resolveGothra } from '../../../../lib/admin-store.ts';
import { json, postJson } from '../../../../lib/http.ts';
import { GothraResolutionSchema } from '../../../../lib/matrimony.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';

export const POST = postJson(GothraResolutionSchema, 'admin_gothra_failed', async (b, claims) =>
  json(200, await resolveGothra(dbContext(claims), b.gothraId, b.mergeInto)));
