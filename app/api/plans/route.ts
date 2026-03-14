import { NextRequest, NextResponse } from "next/server";
import { savePlan, getAllPlans, searchPlans, getPlan, deletePlan } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const id = searchParams.get("id");

  if (id) {
    const plan = await getPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  }

  const plans = query ? await searchPlans(query) : await getAllPlans();
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await savePlan(body);
    return NextResponse.json({ success: true, id: body.id });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Failed to save plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }
  await deletePlan(id);
  return NextResponse.json({ success: true });
}
