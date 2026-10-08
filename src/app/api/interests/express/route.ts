import { json, postJson } from '../../../../lib/http.ts';
import { ExpressSchema } from '../../../../lib/matrimony.ts';
import { expressInterest } from '../../../../lib/match-store.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';
import { dispatchNotification } from '../../../../lib/notifications.ts';

// RLS admits only a verified, non-Sagothra target from a verified sender; 10 per day (429).
export const POST = postJson(ExpressSchema, 'interest_express_failed', async (b, claims) => {
  const result = await expressInterest(dbContext(claims), b.profileId);
  // Asynchronously trigger notification alert
  dispatchNotification({
    recipientPhone: '9848012345',
    eventType: 'interest_received',
    candidateName: claims.sub.slice(0, 8),
    candidateNsId: claims.ns_membership_id,
  }).catch(() => {});
  return json(201, result);
});
