import { consentEvidence, json, postJson } from '../../../lib/http.ts';
import { ConsentChangeSchema } from '../../../lib/matrimony.ts';
import { changeConsent } from '../../../lib/match-store.ts';
import { dbContext } from '../../../lib/onboarding-store.ts';
import { deletePhoto } from '../../../lib/storage.ts';

export const POST = postJson(ConsentChangeSchema, 'consent_change_failed', async (b, claims, req) => {
  const evidence = consentEvidence(req);
  if (!evidence) return json(400, { error: 'consent_evidence_unavailable' });
  const result = await changeConsent(dbContext(claims), b.purpose, b.grant, b.lang, evidence);
  // ponytail: a failed delete leaves an orphan object (unreferenced, unreadable); needs a bucket sweeper.
  if (result.photoToDelete) await deletePhoto(result.photoToDelete).catch(() => console.warn(JSON.stringify({ event: 'photo_delete_failed' })));
  return json(200, { status: result.status });
});
