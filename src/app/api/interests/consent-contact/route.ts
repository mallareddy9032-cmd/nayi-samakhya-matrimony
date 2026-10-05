import { consentEvidence, json, postJson } from '../../../../lib/http.ts';
import { ContactConsentSchema } from '../../../../lib/matrimony.ts';
import { setContactConsent } from '../../../../lib/match-store.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';

// Grant and withdraw are the same call (DPDP s.6(4)); both consents -> contact_unlocked.
export const POST = postJson(ContactConsentSchema, 'contact_consent_failed', async (b, claims, req) => {
  const evidence = consentEvidence(req);
  if (!evidence) return json(400, { error: 'consent_evidence_unavailable' });
  return json(200, await setContactConsent(dbContext(claims), b.interestId, b.grant, b.lang, evidence));
});
