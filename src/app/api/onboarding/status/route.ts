import { NextResponse } from 'next/server';
import { dbContext, getOnboardingStatus } from '../../../../lib/onboarding-store.ts';
import { requireSession } from '../../../../lib/session.ts';

export async function GET(): Promise<NextResponse> {
  const claims = await requireSession();
  return NextResponse.json(await getOnboardingStatus(dbContext(claims)), { headers: { 'cache-control': 'no-store' } });
}
