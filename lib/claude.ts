import Anthropic from "@anthropic-ai/sdk";
import { LESSON_PLAN_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

export interface LessonPlanData {
  title: string;
  overview: string;
  learning_objectives: string[];
  materials: { item: string; quantity: string; estimated_cost: string }[];
  total_estimated_cost: string;
  schedule: {
    phase: string;
    duration_minutes: number;
    description: string;
  }[];
  step_by_step_instructions: string[];
  safety_notes: string[];
  modifications: {
    easier: string;
    harder: string;
    accessibility: string;
  };
  mess_level: "low" | "medium" | "high";
  tags: string[];
  season_tags: string[];
}

export async function generateLessonPlan(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  notes?: string
): Promise<LessonPlanData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    system: LESSON_PLAN_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: buildUserPrompt(notes),
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle possible markdown code blocks)
  let jsonStr = textBlock.text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  return JSON.parse(jsonStr) as LessonPlanData;
}
