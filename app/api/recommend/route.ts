import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTasteData, getProfile } from "@/lib/db";
import { buildTasteProfile, buildRecommendationPrompt } from "@/lib/taste";

export const maxDuration = 60;

const RECOMMEND_SYSTEM = `You are ArtSpark, an AI that recommends art lesson plans for early childhood art teachers (kids ages 4-6).

Given the teacher's preferences and constraints, recommend exactly 3 lesson plans they would love.

Respond with ONLY valid JSON matching this schema:
{
  "recommendations": [
    {
      "title": "string",
      "overview": "string (2 sentences)",
      "technique": "string",
      "mess_level": "low | medium | high",
      "estimated_cost": "string",
      "reason": "string (why this teacher would love it, based on their history)",
      "materials_needed": ["string"],
      "seasonal_tie": "string | null"
    }
  ]
}`;

export interface Recommendation {
  title: string;
  overview: string;
  technique: string;
  mess_level: string;
  estimated_cost: string;
  reason: string;
  materials_needed: string[];
  seasonal_tie: string | null;
}

export async function GET() {
  try {
    const [tasteData, profile] = await Promise.all([
      getTasteData(),
      getProfile(),
    ]);

    const tasteProfile = buildTasteProfile(tasteData.plans, tasteData.events);
    const supplies = profile?.supplies || [];
    const classSize = profile?.class_size || 15;

    // Need at least a few plans to make meaningful recommendations
    // But even with 0, we can make seasonal/general recommendations
    const userPrompt = buildRecommendationPrompt(
      tasteProfile,
      supplies,
      classSize
    );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: RECOMMEND_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response");
    }

    let jsonStr = textBlock.text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    const parsed = JSON.parse(jsonStr);
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid recommendation format");
    }

    return NextResponse.json({
      recommendations: parsed.recommendations as Recommendation[],
      taste_summary: {
        total_plans: tasteProfile.total_plans,
        top_technique: tasteProfile.preferred_techniques[0]?.technique || null,
        top_mess_level: tasteProfile.preferred_mess_levels[0]?.level || null,
        has_profile: !!profile,
      },
    });
  } catch (error) {
    console.error("Recommend error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recommendation failed" },
      { status: 500 }
    );
  }
}
