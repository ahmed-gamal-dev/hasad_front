import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, workers: [] });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  return NextResponse.json({ ok: true, action: 'create', payload });
}
