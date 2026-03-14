import { NextRequest, NextResponse } from "next/server";
import { generateLessonPlan } from "@/lib/claude";
import { getProfile, getFrequentMaterials } from "@/lib/db";
import { checkAuth } from "@/lib/auth";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const imageBase64Input = formData.get("imageBase64") as string | null;
    const mediaTypeInput = formData.get("mediaType") as string | null;
    const notes = formData.get("notes") as string | null;
    const caption = formData.get("caption") as string | null;

    let base64: string;
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      base64 = Buffer.from(buffer).toString("base64");
      mediaType = (imageFile.type || "image/jpeg") as typeof mediaType;
    } else if (imageBase64Input && mediaTypeInput) {
      base64 = imageBase64Input;
      mediaType = mediaTypeInput as typeof mediaType;
    } else {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Inject supply context: explicit profile first, fall back to inferred supply memory
    let enrichedNotes = notes || "";
    let classSize = 15;
    try {
      const profile = await getProfile();
      if (profile && profile.supplies.length > 0) {
        classSize = profile.class_size;
        const supplyNote = `\n\nThis teacher's classroom already has: ${profile.supplies.join(", ")}. Class size: ${classSize} kids. Prefer these materials when possible. Only suggest buying new items when the project truly requires something not listed.`;
        enrichedNotes = (enrichedNotes + supplyNote).trim();
      } else {
        // Fall back to inferred supply memory
        const knownSupplies = await getFrequentMaterials(15);
        if (knownSupplies.length >= 3) {
          const supplyNote = `\n\nThis teacher's classroom already has: ${knownSupplies.join(", ")}. Prefer these materials when possible. Only suggest buying new items when the project truly requires something she doesn't have.`;
          enrichedNotes = (enrichedNotes + supplyNote).trim();
        }
      }
    } catch { /* supply context unavailable — proceed without */ }

    const plan = await generateLessonPlan(
      base64,
      mediaType,
      enrichedNotes || undefined,
      caption || undefined,
      classSize
    );

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
