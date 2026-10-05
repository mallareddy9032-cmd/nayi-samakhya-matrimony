import { json, postJson } from '../../../lib/http.ts';
import { GrievanceSchema } from '../../../lib/matrimony.ts';
import { fileGrievance } from '../../../lib/match-store.ts';
import { dbContext } from '../../../lib/onboarding-store.ts';

export const POST = postJson(GrievanceSchema, 'grievance_file_failed', async (b, claims) =>
  json(201, await fileGrievance(dbContext(claims), b.category, b.profileId, b.description)));
