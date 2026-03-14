import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

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

/** Validate that a parsed object has the required LessonPlanData fields */
function validatePlan(obj: unknown): obj is LessonPlanData {
  if (!obj || typeof obj !== "object") return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.title === "string" &&
    typeof p.overview === "string" &&
    Array.isArray(p.learning_objectives) &&
    Array.isArray(p.materials) &&
    typeof p.total_estimated_cost === "string" &&
    Array.isArray(p.schedule) &&
    Array.isArray(p.step_by_step_instructions) &&
    Array.isArray(p.safety_notes) &&
    p.modifications != null &&
    typeof p.mess_level === "string" &&
    Array.isArray(p.tags)
  );
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

/** Parse + validate JSON, throw descriptive error on failure */
function parsePlan(text: string): LessonPlanData {
  const parsed = JSON.parse(extractJson(text));
  if (!validatePlan(parsed)) {
    throw new Error("Response JSON is missing required fields");
  }
  return parsed;
}

/** Sonnet with extended thinking for best one-shot quality */
export async function generateLessonPlan(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  notes?: string,
  caption?: string,
  classSize?: number
): Promise<LessonPlanData> {
  const anthropic = getClient();
  const systemPrompt = buildSystemPrompt(classSize);

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: imageBase64 },
        },
        { type: "text", text: buildUserPrompt(notes, caption, classSize) },
      ],
    },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 16000,
    thinking: { type: "enabled", budget_tokens: 4096 },
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Try parsing; on failure, retry once with a JSON-only nudge
  try {
    return parsePlan(textBlock.text);
  } catch (firstError) {
    console.warn("First parse failed, retrying:", firstError);
    const retry = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        ...messages,
        { role: "assistant", content: textBlock.text },
        { role: "user", content: "That response was not valid JSON. Please respond with ONLY the valid JSON object, no markdown fences, no explanation." },
      ],
    });
    const retryText = retry.content.find((b) => b.type === "text");
    if (!retryText || retryText.type !== "text") {
      throw new Error("No text response on retry");
    }
    return parsePlan(retryText.text);
  }
}

/** Text-only generation — no image needed. Used for recommendations. */
export async function generateFromText(
  description: string,
  notes?: string,
  classSize?: number
): Promise<LessonPlanData> {
  const anthropic = getClient();
  const systemPrompt = buildSystemPrompt(classSize);

  const userContent = `Create a lesson plan for this art project concept:\n\n${description}${notes ? `\n\nAdditional notes: ${notes}` : ""}`;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userContent },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 16000,
    thinking: { type: "enabled", budget_tokens: 4096 },
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  try {
    return parsePlan(textBlock.text);
  } catch (firstError) {
    console.warn("First parse failed, retrying:", firstError);
    const retry = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        ...messages,
        { role: "assistant", content: textBlock.text },
        { role: "user", content: "That response was not valid JSON. Please respond with ONLY the valid JSON object, no markdown fences, no explanation." },
      ],
    });
    const retryText = retry.content.find((b) => b.type === "text");
    if (!retryText || retryText.type !== "text") {
      throw new Error("No text response on retry");
    }
    return parsePlan(retryText.text);
  }
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

/** Opus polishes the draft — called separately from client */
export async function polishLessonPlan(
  draft: LessonPlanData
): Promise<LessonPlanData> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
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

  // Validate polished plan has required fields; if not, return draft unchanged
  try {
    return parsePlan(textBlock.text);
  } catch {
    console.error("Polish returned invalid JSON, keeping draft");
    return draft;
  }
}
