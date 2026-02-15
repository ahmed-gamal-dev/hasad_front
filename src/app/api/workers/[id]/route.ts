import { NextResponse } from 'next/server';

type WorkerRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: WorkerRouteContext) {
  return NextResponse.json({ ok: true, id: params.id });
}
