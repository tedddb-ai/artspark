import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/prompts";
import { getProfile, getFrequentMaterials } from "@/lib/db";
import { checkAuth } from "@/lib/auth";
import { safeJsonParse } from "@/lib/safe-json";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

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

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const userContent = `Create a lesson plan for this art project concept:\n\n${description}${enrichedNotes ? `\n\nAdditional notes: ${enrichedNotes}` : ""}`;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const messageStream = anthropic.messages.stream({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 4096,
            system: buildSystemPrompt(classSize),
            messages: [{ role: "user", content: userContent }],
          });

          // Keepalive pings to prevent Vercel timeout
          const keepalive = setInterval(() => {
            controller.enqueue(encoder.encode(" "));
          }, 5000);

          const finalMessage = await messageStream.finalMessage();
          clearInterval(keepalive);

          const textBlock = finalMessage.content.find((b) => b.type === "text");
          if (!textBlock || textBlock.type !== "text") {
            controller.enqueue(
              encoder.encode(JSON.stringify({ error: "No response from AI" }))
            );
          } else {
            let jsonStr = textBlock.text.trim();
            const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) jsonStr = jsonMatch[1].trim();

            const result = safeJsonParse(jsonStr);
            if (result.ok) {
              controller.enqueue(
                encoder.encode(JSON.stringify({ plan: result.data }))
              );
            } else {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({ error: "AI returned invalid JSON" })
                )
              );
            }
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Generation failed";
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ error: msg }))
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate-text error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
