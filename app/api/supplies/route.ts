import { NextRequest, NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/db";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await saveProfile({
      supplies: body.supplies || [],
      class_size: body.class_size || 15,
      age_range: body.age_range || "4-6",
      school_name: body.school_name || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save profile error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
