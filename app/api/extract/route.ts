import { NextRequest, NextResponse } from "next/server";
import { extractImageFromUrl, fetchImageAsBase64 } from "@/lib/extract";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const { imageUrl, error } = await extractImageFromUrl(url);
    if (!imageUrl) {
      return NextResponse.json(
        { error: error || "Could not extract image from URL" },
        { status: 400 }
      );
    }

    const imageData = await fetchImageAsBase64(imageUrl);
    if (!imageData) {
      return NextResponse.json(
        { error: "Could not download the image" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      imageUrl,
      base64: imageData.base64,
      mediaType: imageData.mediaType,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract image" },
      { status: 500 }
    );
  }
}
