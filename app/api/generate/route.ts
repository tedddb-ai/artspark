import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { getProfile, getFrequentMaterials } from "@/lib/db";
import { checkAuth } from "@/lib/auth";

export const maxDuration = 300;

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
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Supply context
    let enrichedNotes = notes || "";
    let classSize = 15;
    try {
      const profile = await getProfile();
      if (profile && profile.supplies.length > 0) {
        classSize = profile.class_size;
        enrichedNotes = (enrichedNotes + `\n\nClassroom supplies: ${profile.supplies.join(", ")}. Class size: ${classSize}.`).trim();
      } else {
        const knownSupplies = await getFrequentMaterials(15);
        if (knownSupplies.length >= 3) {
          enrichedNotes = (enrichedNotes + `\n\nTeacher has: ${knownSupplies.join(", ")}.`).trim();
        }
      }
    } catch { /* proceed without */ }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    // Stream response to prevent serverless timeout
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = anthropic.messages.stream({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 4096,
            system: buildSystemPrompt(classSize),
            messages: [
              {
                role: "user",
                content: [
                  { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
                  { type: "text", text: buildUserPrompt(enrichedNotes || undefined, caption || undefined, classSize) },
                ],
              },
            ],
          });

          // Send keepalive pings while waiting for tokens
          const keepalive = setInterval(() => {
            controller.enqueue(new TextEncoder().encode(" "));
          }, 5000);

          const finalMessage = await messageStream.finalMessage();
          clearInterval(keepalive);

          const textBlock = finalMessage.content.find((b) => b.type === "text");
          if (!textBlock || textBlock.type !== "text") {
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: "No response from AI" })));
          } else {
            // Extract JSON from response
            let jsonStr = textBlock.text.trim();
            const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) jsonStr = jsonMatch[1].trim();
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ plan: JSON.parse(jsonStr) })));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Generation failed";
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ error: msg })));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
