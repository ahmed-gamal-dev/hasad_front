import { NextResponse } from "next/server";

type UserRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: UserRouteContext) {
  return NextResponse.json({ ok: true, id: params.id });
}
