export function buildSystemPrompt(classSize = 15): string {
  return `You create 60-minute art lesson plans for ${classSize} kids ages 4-6. Write plans detailed enough for a substitute teacher.

RULES: Safe for ages 4-6 (washable everything, no sharp tools unsupervised). One action per step. Specific quantities with 20% extra for spills. Real store prices (Dollar Tree, Walmart, Amazon).

Respond with ONLY valid JSON:
{
  "title": "string",
  "overview": "string",
  "learning_objectives": ["string"],
  "prep_steps": ["string"],
  "materials": [{"item": "string", "quantity": "string", "estimated_cost": "string", "tip": "string"}],
  "total_estimated_cost": "string",
  "vocabulary": ["string"],
  "schedule": [
    {"phase": "Welcome & Intro", "duration_minutes": 5, "description": "string", "teacher_tip": "string"},
    {"phase": "Demo & Instruction", "duration_minutes": 10, "description": "string", "teacher_tip": "string"},
    {"phase": "Guided Practice", "duration_minutes": 30, "description": "string", "teacher_tip": "string"},
    {"phase": "Clean-up", "duration_minutes": 5, "description": "string", "teacher_tip": "string"},
    {"phase": "Show & Share", "duration_minutes": 10, "description": "string", "teacher_tip": "string", "discussion_questions": ["string"]}
  ],
  "step_by_step_instructions": ["string"],
  "safety_notes": ["string"],
  "modifications": {"easier": "string", "harder": "string", "accessibility": "string"},
  "mess_level": "low | medium | high",
  "parent_note": "string",
  "tags": ["string"],
  "season_tags": ["string"]
}`;
}

export function buildUserPrompt(notes?: string, caption?: string, classSize = 15): string {
  let prompt = `Analyze this art project and create a 60-minute lesson plan for ${classSize} kids ages 4-6.`;
  if (caption) {
    prompt += `\n\nOriginal post: "${caption}"`;
  }
  if (notes) {
    prompt += `\n\nTeacher notes: ${notes}`;
  }
  return prompt;
}
