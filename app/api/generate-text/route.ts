import { NextRequest, NextResponse } from "next/server";
import { generateFromText } from "@/lib/claude";
import { getProfile, getFrequentMaterials } from "@/lib/db";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, notes } = body;

    if (!description) {
      return NextResponse.json(
        { error: "No description provided" },
        { status: 400 }
      );
    }

    // Inject supply context
    let enrichedNotes = notes || "";
    let classSize = 15;
    try {
      const profile = await getProfile();
      if (profile && profile.supplies.length > 0) {
        classSize = profile.class_size;
        const supplyNote = `\n\nThis teacher's classroom already has: ${profile.supplies.join(", ")}. Class size: ${classSize} kids. Prefer these materials when possible.`;
        enrichedNotes = (enrichedNotes + supplyNote).trim();
      } else {
        const knownSupplies = await getFrequentMaterials(15);
        if (knownSupplies.length >= 3) {
          const supplyNote = `\n\nThis teacher's classroom already has: ${knownSupplies.join(", ")}. Prefer these materials when possible.`;
          enrichedNotes = (enrichedNotes + supplyNote).trim();
        }
      }
    } catch { /* proceed without */ }

    const plan = await generateFromText(
      description,
      enrichedNotes || undefined,
      classSize
    );

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Generate-text error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
