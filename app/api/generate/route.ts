import { NextRequest, NextResponse } from "next/server";
import { generateLessonPlan } from "@/lib/claude";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const imageBase64Input = formData.get("imageBase64") as string | null;
    const mediaTypeInput = formData.get("mediaType") as string | null;
    const notes = formData.get("notes") as string | null;

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

    const plan = await generateLessonPlan(base64, mediaType, notes || undefined);

    return NextResponse.json({
      plan,
      imageBase64: base64,
      mediaType,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
