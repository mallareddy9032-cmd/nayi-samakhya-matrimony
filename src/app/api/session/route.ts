import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-nsm-user-id');
  const role = request.headers.get('x-nsm-user-role');
  const district = request.headers.get('x-nsm-user-district');

  return NextResponse.json({
    authenticated: true,
    user_id: userId,
    role: role,
    district: district,
    scope: 'matrimony_shared',
    timestamp: new Date().toISOString(),
  });
}
