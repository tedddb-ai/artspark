import Anthropic from "@anthropic-ai/sdk";
import { LESSON_PLAN_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

export interface LessonPlanData {
  title: string;
  overview: string;
  learning_objectives: string[];
  materials: { item: string; quantity: string; estimated_cost: string; tip?: string }[];
  total_estimated_cost: string;
  prep_steps?: string[];
  schedule: {
    phase: string;
    duration_minutes: number;
    description: string;
    teacher_tip?: string;
    discussion_questions?: string[];
  }[];
  step_by_step_instructions: string[];
  safety_notes: string[];
  modifications: {
    easier: string;
    harder: string;
    accessibility: string;
  };
  mess_level: "low" | "medium" | "high";
  vocabulary?: string[];
  parent_note?: string;
  tags: string[];
  season_tags: string[];
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

function extractJson(text: string): string {
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  return jsonStr;
}

/** Step 1: Sonnet generates the draft (fast, ~5-8s) */
export async function generateLessonPlan(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  notes?: string
): Promise<LessonPlanData> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: LESSON_PLAN_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          { type: "text", text: buildUserPrompt(notes) },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return JSON.parse(extractJson(textBlock.text)) as LessonPlanData;
}

const POLISH_PROMPT = `You are an expert early childhood art teacher reviewing a lesson plan draft for a class of 15 kids ages 4-6.

Enhance this lesson plan while keeping the same JSON structure. Focus on:
- More creative, engaging title and overview
- Sharper, more specific learning objectives (measurable, not vague)
- Prep steps that are specific and actionable ("Pre-cut 15 circles" not "Prepare materials")
- Teacher tips that include actual words to say out loud and transition cues
- Step-by-step instructions written like a recipe — one action per step
- Specific clean-up steps (who does what, sponges vs paper towels)
- Discussion questions that are open-ended and age-appropriate
- Material tips with real store suggestions (Dollar Tree, Amazon, Walmart) or substitutions
- Accurate 2024-2025 cost estimates with 20% extra for spills
- A warm, specific parent note
- Better safety notes specific to ages 4-6
- Better tags for searchability

Return ONLY valid JSON with the exact same schema. Do not add or remove fields.`;

/** Step 2: Opus polishes the draft (deeper, ~15-25s) */
export async function polishLessonPlan(
  draft: LessonPlanData
): Promise<LessonPlanData> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: POLISH_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the draft lesson plan to enhance:\n\n${JSON.stringify(draft, null, 2)}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return JSON.parse(extractJson(textBlock.text)) as LessonPlanData;
}
