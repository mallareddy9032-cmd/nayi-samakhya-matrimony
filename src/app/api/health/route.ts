import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'HEALTHY',
    service: 'nayi-samakhya-matrimony',
    base_path: '/matrimony',
    timestamp: new Date().toISOString(),
  });
}
