import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:db/artspark.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function ensureTable() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS lesson_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      overview TEXT,
      plan_json TEXT NOT NULL,
      source_url TEXT,
      source_image_base64 TEXT,
      mess_level TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS plan_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id TEXT NOT NULL,
      event TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Initialize table on first import
const tableReady = ensureTable();

export interface SavedPlan {
  id: string;
  title: string;
  overview: string | null;
  plan_json: string;
  source_url: string | null;
  source_image_base64: string | null;
  mess_level: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export async function savePlan(plan: {
  id: string;
  title: string;
  overview: string;
  plan_json: string;
  source_url?: string;
  mess_level: string;
  tags: string;
}): Promise<void> {
  await tableReady;
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO lesson_plans (id, title, overview, plan_json, source_url, mess_level, tags, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      plan.id,
      plan.title,
      plan.overview,
      plan.plan_json,
      plan.source_url || null,
      plan.mess_level,
      plan.tags,
    ],
  });
}

export async function getPlan(id: string): Promise<SavedPlan | undefined> {
  await tableReady;
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM lesson_plans WHERE id = ?",
    args: [id],
  });
  return result.rows[0] as unknown as SavedPlan | undefined;
}

export async function getAllPlans(): Promise<SavedPlan[]> {
  await tableReady;
  const db = getDb();
  const result = await db.execute(
    "SELECT * FROM lesson_plans ORDER BY created_at DESC"
  );
  return result.rows as unknown as SavedPlan[];
}

export async function searchPlans(query: string): Promise<SavedPlan[]> {
  await tableReady;
  const db = getDb();
  const pattern = `%${query}%`;
  const result = await db.execute({
    sql: `SELECT * FROM lesson_plans
          WHERE title LIKE ? OR overview LIKE ? OR tags LIKE ?
          ORDER BY created_at DESC`,
    args: [pattern, pattern, pattern],
  });
  return result.rows as unknown as SavedPlan[];
}

export async function deletePlan(id: string): Promise<void> {
  await tableReady;
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM lesson_plans WHERE id = ?",
    args: [id],
  });
}

// --- Feedback events ---
// Events: "save", "share_plan", "share_list", "print", "delete", "polish"
export type PlanEvent = "save" | "share_plan" | "share_list" | "print" | "delete" | "polish";

/** Fire-and-forget event tracking — never throws */
export async function trackEvent(planId: string, event: PlanEvent): Promise<void> {
  try {
    await tableReady;
    const db = getDb();
    await db.execute({
      sql: "INSERT INTO plan_events (plan_id, event) VALUES (?, ?)",
      args: [planId, event],
    });
  } catch (e) {
    console.error("Failed to track event:", e);
  }
}

/** Get the most common materials from saved+shared plans (positive signal) */
export async function getFrequentMaterials(limit = 20): Promise<string[]> {
  try {
    await tableReady;
    const db = getDb();
    // Get plan_json from plans that have positive signals (save, share, print)
    const result = await db.execute(`
      SELECT DISTINCT lp.plan_json
      FROM lesson_plans lp
      INNER JOIN plan_events pe ON lp.id = pe.plan_id
      WHERE pe.event IN ('save', 'share_plan', 'share_list', 'print')
      ORDER BY lp.created_at DESC
      LIMIT 30
    `);
    // Extract material items from JSON blobs
    const materialCounts = new Map<string, number>();
    for (const row of result.rows) {
      try {
        const plan = JSON.parse(row.plan_json as string);
        if (Array.isArray(plan.materials)) {
          for (const m of plan.materials) {
            if (m.item) {
              const key = m.item.toLowerCase().trim();
              materialCounts.set(key, (materialCounts.get(key) || 0) + 1);
            }
          }
        }
      } catch { /* skip bad JSON */ }
    }
    return Array.from(materialCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  } catch {
    return [];
  }
}
