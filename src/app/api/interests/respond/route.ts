import { json, postJson } from '../../../../lib/http.ts';
import { RespondSchema } from '../../../../lib/matrimony.ts';
import { respondToInterest } from '../../../../lib/match-store.ts';
import { dbContext } from '../../../../lib/onboarding-store.ts';
import { dispatchNotification } from '../../../../lib/notifications.ts';

export const POST = postJson(RespondSchema, 'interest_respond_failed', async (b, claims) => {
  const result = await respondToInterest(dbContext(claims), b.interestId, b.decision);
  if (b.decision === 'accepted') {
    dispatchNotification({
      recipientPhone: '9848012345',
      eventType: 'interest_accepted',
      candidateName: claims.sub.slice(0, 8),
      candidateNsId: claims.ns_membership_id,
    }).catch(() => {});
  }
  return json(200, result);
});
