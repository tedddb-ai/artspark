import { NextRequest, NextResponse } from "next/server";
import { polishLessonPlan } from "@/lib/claude";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { draft } = await request.json();
    if (!draft) {
      return NextResponse.json({ error: "No draft provided" }, { status: 400 });
    }

    const polished = await polishLessonPlan(draft);
    return NextResponse.json({ plan: polished });
  } catch (error) {
    console.error("Polish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Polish failed" },
      { status: 500 }
    );
  }
}
