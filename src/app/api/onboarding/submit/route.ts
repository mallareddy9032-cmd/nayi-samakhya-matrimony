import type { NextRequest, NextResponse } from 'next/server';
import { consentEvidence, dbError, json, readJson } from '../../../../lib/http.ts';
import { OnboardingSchema } from '../../../../lib/onboarding.ts';
import { dbContext, submitOnboarding } from '../../../../lib/onboarding-store.ts';
import { requireSession } from '../../../../lib/session.ts';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const claims = await requireSession();
  const evidence = consentEvidence(req);
  if (!evidence) return json(400, { error: 'consent_evidence_unavailable' });
  const body = await readJson(req, OnboardingSchema);
  if ('res' in body) return body.res;
  try {
    return json(201, await submitOnboarding(dbContext(claims), claims.ns_membership_id, body.data, evidence));
  } catch (err) {
    return dbError(err, req, 'onboarding_submit_failed');
  }
}
