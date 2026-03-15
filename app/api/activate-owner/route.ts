import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { secret } = await request.json();
  const ownerSecret = process.env.OWNER_SECRET;

  if (!ownerSecret || secret !== ownerSecret) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
