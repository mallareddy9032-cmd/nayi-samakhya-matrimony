import { json, postJson } from '../../../../lib/http.ts';
import { RevealContactSchema } from '../../../../lib/matrimony.ts';
import { revealContact } from '../../../../lib/match-store.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';

// POST, not GET: every reveal is an audited disclosure and must not be prefetched or cached.
export const POST = postJson(RevealContactSchema, 'contact_reveal_failed', async (b, claims) =>
  json(200, await revealContact(dbContext(claims), b.interestId)));
