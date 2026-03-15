#!/usr/bin/env node
/**
 * Daily automated plan seeding — generates 5 SEO-targeted plans per run.
 * Designed to run via GitHub Actions cron.
 * Each plan = indexed page with affiliate links = passive revenue.
 */

import { randomUUID } from "crypto";
import { createClient } from "@libsql/client";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!ANTHROPIC_KEY || !TURSO_URL || !TURSO_TOKEN) {
  console.error("Missing required env vars");
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

// Large rotating pool — each day picks 5 random ones never generated before
const ALL_TOPICS = [
  // Painting techniques
  "Dot painting art for kids inspired by aboriginal art — using cotton swabs and washable paint",
  "Blow painting with straws — drip watered-down paint and blow through straws to make tree shapes",
  "Spin art with a salad spinner — put paper in a spinner, drip paint, and spin for abstract art",
  "Marble painting in a box — roll marbles through paint on paper inside a shoebox lid",
  "Tape resist watercolor painting — place masking tape in patterns, paint over, peel to reveal",
  "Splatter painting like Jackson Pollock — outdoor messy art with big paper and lots of color",
  "Color mixing exploration — use only red, blue, and yellow to discover all the colors",
  "Painting with unusual tools — paint with forks, sponges, feathers, and cotton balls",
  // Sculpture & 3D
  "Papier-mache bowl — tear newspaper strips and layer over a balloon with paste",
  "Cardboard castle construction — build a castle from cardboard boxes, tubes, and foil",
  "Wire sculpture for beginners — bend pipe cleaners into people, animals, or abstract shapes",
  "Egg carton caterpillar — cut and paint egg cartons into colorful caterpillars",
  "Paper bag puppets — decorate lunch bags as characters for a puppet show",
  "Tin foil sculpture — crumple, fold, and shape aluminum foil into animals",
  // Printmaking
  "Leaf printing with real leaves — press paint-covered leaves onto paper for botanical prints",
  "Styrofoam plate printing — scratch designs into styrofoam plates and press with paint",
  "Vegetable stamp art — cut potatoes, celery, and peppers to make stamps",
  "String printing — dip string in paint and press between folded paper",
  // Collage & mixed media
  "Magazine collage self-portrait — cut shapes from magazines to create a face",
  "Torn paper mosaic — tear colored paper into small pieces and arrange into an image",
  "Fabric scrap collage — use fabric scraps, buttons, and ribbon to make textured art",
  "Ocean diorama in a shoebox — create an underwater scene with paper, paint, and string",
  // Seasonal (evergreen for SEO)
  "Snowflake cutting and painting — fold and cut paper snowflakes, then watercolor paint them",
  "Spring flower garden painting — paint a garden scene with handprint flowers",
  "Summer sun catcher craft — create a sun catcher with clear contact paper and tissue",
  "Fall leaf wreath — collect autumn leaves and arrange on a paper plate wreath",
  "Rainbow craft for kids — create a rainbow using cotton balls, paint, and paper",
  // Cultural & art history inspired
  "Matisse-inspired paper cutouts — cut organic shapes from painted paper like Henri Matisse",
  "Mondrian grid painting — use tape to create grids and fill with primary colors",
  "Kandinsky circles art — paint concentric circles inspired by Kandinsky",
  "Monet water lilies — create a water lily pond using sponges and watercolors",
  "Keith Haring figures — draw dancing figures with bold outlines and bright colors",
  // Practical/gift crafts
  "Handmade greeting cards — fold, cut, stamp, and decorate cards for any occasion",
  "Painted rock garden — paint smooth rocks with animals, patterns, or words",
  "Photo frame decoration — decorate a cardboard frame with buttons, gems, and paint",
  "Friendship bracelet making — simple braided bracelets with yarn or embroidery floss",
  "Bookmark craft for kids — paint and decorate custom bookmarks with tassels",
  // Sensory & process art
  "Ice painting — freeze paint in ice cube trays and paint as they melt",
  "Shaving cream marbling — swirl paint in shaving cream and press paper on top",
  "Sand art in bottles — layer colored sand in clear containers",
  "Sensory painting with pudding — edible finger paint for the youngest artists",
  "Rain painting — put drops of food coloring on paper and let the rain blend them",
];

async function getExistingTitles() {
  const result = await db.execute("SELECT title FROM lesson_plans");
  return new Set(result.rows.map((r) => String(r.title).toLowerCase()));
}

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
  const existing = await getExistingTitles();
  console.log(`${existing.size} plans already in gallery`);

  // Pick 5 random topics we haven't covered yet
  const available = ALL_TOPICS.filter(
    (t) => !existing.has(t.split("—")[0].trim().toLowerCase())
  );

  if (available.length === 0) {
    console.log("All topics exhausted! Add more to the pool.");
    return;
  }

  // Shuffle and take 5
  const shuffled = available.sort(() => Math.random() - 0.5);
  const batch = shuffled.slice(0, 5);

  console.log(`Generating ${batch.length} new plans...\n`);

  let success = 0;
  for (const desc of batch) {
    const shortName = desc.split("—")[0].trim();
    process.stdout.write(`  ${shortName}... `);

    try {
      const plan = await generatePlan(desc);
      const id = await savePlan(plan);
      console.log(`done! "${plan.title}" [${id}]`);
      success++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\n${success}/${batch.length} new plans seeded.`);
  console.log(`Gallery now has ${existing.size + success} plans.`);
  db.close();
}

main().catch(console.error);
