#!/usr/bin/env node
/**
 * Seed the production gallery with SEO-targeted lesson plans.
 * Each plan = an indexed page with affiliate links.
 *
 * Usage: node scripts/seed-gallery.mjs
 */

import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { createClient } from "@libsql/client";

// Load production env
const envFile = readFileSync(new URL("../.env.production.local", import.meta.url), "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)="(.*)"$/);
  if (match) env[match[1].trim()] = match[2].replace(/\\n/g, "").trim();
}

const ANTHROPIC_KEY = env.ANTHROPIC_API_KEY;
const TURSO_URL = env.TURSO_DATABASE_URL;
const TURSO_TOKEN = env.TURSO_AUTH_TOKEN;

if (!ANTHROPIC_KEY || !TURSO_URL || !TURSO_TOKEN) {
  console.error("Missing env vars.");
  console.error("ANTHROPIC_API_KEY:", !!ANTHROPIC_KEY);
  console.error("TURSO_DATABASE_URL:", !!TURSO_URL);
  console.error("TURSO_AUTH_TOKEN:", !!TURSO_TOKEN);
  process.exit(1);
}

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const SYSTEM_PROMPT = `You create 60-minute art lesson plans for 15 kids ages 4-6. Write plans detailed enough for a substitute teacher. Also make the plan work well for homeschool families with mixed ages.

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

const SEED_PLANS = [
  "Easy watercolor painting for kids — simple wet-on-wet watercolor techniques, perfect for beginners",
  "Paper plate animal craft — turn paper plates into fun animal faces with paint and googly eyes",
  "Nature collage art project — collect leaves, flowers, and sticks to create beautiful collages",
  "Salt dough ornaments — make, bake, and paint salt dough shapes, great for gifts",
  "Bubble wrap printing art — use bubble wrap as stamps for colorful textured prints",
  "Tissue paper stained glass — layer colored tissue paper on contact paper for sun catchers",
  "Easy clay pinch pot — make a simple pinch pot from air-dry clay, then paint it",
  "Sponge painting for preschool — cut sponges into shapes and stamp colorful patterns",
  "Recycled robot sculpture — build robots from cardboard boxes, bottle caps, and foil",
  "Finger painting for toddlers — mess-friendly finger painting with washable paint on large paper",
];

async function generatePlan(description) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Create a lesson plan for: ${description}` },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");
  return JSON.parse(jsonMatch[0]);
}

async function savePlan(plan) {
  const id = randomUUID();
  const tags = [...(plan.tags || []), ...(plan.season_tags || [])].join(", ");

  await db.execute({
    sql: `INSERT INTO lesson_plans (id, title, overview, plan_json, source_url, mess_level, tags, created_at, updated_at)
          VALUES (?, ?, ?, ?, '', ?, ?, datetime('now'), datetime('now'))`,
    args: [id, plan.title, plan.overview, JSON.stringify(plan), plan.mess_level, tags],
  });

  return id;
}

async function main() {
  console.log(`Seeding ${SEED_PLANS.length} plans...\n`);

  let success = 0;
  for (const desc of SEED_PLANS) {
    const shortName = desc.split("—")[0].trim();
    process.stdout.write(`Generating: ${shortName}... `);

    try {
      const plan = await generatePlan(desc);
      process.stdout.write("saving... ");
      const id = await savePlan(plan);
      console.log(`done! "${plan.title}" [${id}]`);
      success++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\n${success}/${SEED_PLANS.length} plans seeded to production gallery.`);
  db.close();
}

main().catch(console.error);
