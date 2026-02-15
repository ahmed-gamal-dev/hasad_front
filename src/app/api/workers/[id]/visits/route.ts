import { NextResponse } from 'next/server';

type WorkerVisitsRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: WorkerVisitsRouteContext) {
  return NextResponse.json({
    ok: true,
    worker_id: params.id,
    visits: [],
  });
}
