import { NextResponse } from 'next/server';
import { dbContext, listGothras } from '../../../lib/onboarding-store.ts';
import { requireSession } from '../../../lib/session.ts';

// Unlisted variants are proposed inside the onboarding submission (heritage.gothra.kind = "proposed").
export async function GET(): Promise<NextResponse> {
  const claims = await requireSession();
  const gothras = await listGothras(dbContext(claims));
  return NextResponse.json(
    { gothras, proposal: { allowed: true, field: 'heritage.gothra', kind: 'proposed' } },
    { headers: { 'cache-control': 'no-store' } },
  );
}
