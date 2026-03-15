import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const ownerSecret = process.env.OWNER_SECRET;
  return NextResponse.json({
    has_secret: !!ownerSecret,
    secret_length: ownerSecret?.length ?? 0,
    secret_trimmed_length: ownerSecret?.trim().length ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const { secret } = await request.json();
  const ownerSecret = process.env.OWNER_SECRET?.trim();

  if (!ownerSecret || secret !== ownerSecret) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
