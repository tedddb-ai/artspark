import type { LessonPlanData } from "./claude";

/**
 * Taste Profile — learned from plan events.
 * Analyzes what a teacher saves/shares/prints vs deletes
 * to build a preference model for recommendations.
 */

export interface TasteProfile {
  // Preferences (sorted by frequency, most preferred first)
  preferred_mess_levels: { level: string; count: number }[];
  preferred_techniques: { technique: string; count: number }[];
  preferred_topics: { topic: string; count: number }[];

  // Recent history (for avoiding repeats)
  recent_titles: string[];
  recent_tags: string[];

  // Stats
  total_plans: number;
  positive_signals: number; // save + share + print
  negative_signals: number; // delete
}

// Common technique keywords to extract from tags
const TECHNIQUE_KEYWORDS = [
  "painting", "collage", "sculpture", "drawing", "printmaking",
  "weaving", "stamping", "mixed media", "watercolor", "finger paint",
  "sponge paint", "splatter", "marbling", "tie dye", "stencil",
  "paper craft", "origami", "clay", "playdough", "mosaic",
];

// Topic keywords to extract from tags + titles
const TOPIC_KEYWORDS = [
  "animals", "nature", "ocean", "space", "flowers", "trees",
  "weather", "seasons", "food", "bugs", "birds", "fish",
  "dinosaurs", "rainbow", "self portrait", "family", "feelings",
  "shapes", "patterns", "letters", "numbers", "community",
  "transportation", "buildings", "music", "dance",
];

function extractKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k));
}

export function buildTasteProfile(
  plans: { id: string; plan_json: string; mess_level: string | null; tags: string | null; title: string }[],
  events: { plan_id: string; event: string }[]
): TasteProfile {
  // Map plan_id → event counts
  const planSignals = new Map<string, { positive: number; negative: number }>();
  for (const e of events) {
    const current = planSignals.get(e.plan_id) || { positive: 0, negative: 0 };
    if (["save", "share_plan", "share_list", "print"].includes(e.event)) {
      current.positive++;
    } else if (e.event === "delete") {
      current.negative++;
    }
    planSignals.set(e.plan_id, current);
  }

  const messCount = new Map<string, number>();
  const techCount = new Map<string, number>();
  const topicCount = new Map<string, number>();
  const recentTitles: string[] = [];
  const recentTags: string[] = [];
  let positiveTotal = 0;
  let negativeTotal = 0;

  for (const plan of plans) {
    const signals = planSignals.get(plan.id) || { positive: 0, negative: 0 };
    // Weight: +1 for each positive signal, -1 for each negative
    const weight = Math.max(signals.positive - signals.negative, 0);
    // Even plans with no events count as slight positive (they were generated and kept)
    const effectiveWeight = weight > 0 ? weight : 0.5;

    positiveTotal += signals.positive;
    negativeTotal += signals.negative;

    // Mess level preference
    if (plan.mess_level) {
      messCount.set(
        plan.mess_level,
        (messCount.get(plan.mess_level) || 0) + effectiveWeight
      );
    }

    // Extract techniques and topics from tags + title
    const tagText = (plan.tags || "") + " " + plan.title;
    let parsed: LessonPlanData | null = null;
    try {
      parsed = JSON.parse(plan.plan_json);
    } catch { /* skip */ }

    const fullText = tagText + " " + (parsed?.tags || []).join(" ");

    for (const tech of extractKeywords(fullText, TECHNIQUE_KEYWORDS)) {
      techCount.set(tech, (techCount.get(tech) || 0) + effectiveWeight);
    }
    for (const topic of extractKeywords(fullText, TOPIC_KEYWORDS)) {
      topicCount.set(topic, (topicCount.get(topic) || 0) + effectiveWeight);
    }

    // Track recent (last 10)
    if (recentTitles.length < 10) recentTitles.push(plan.title);
    if (parsed?.tags) {
      for (const t of parsed.tags) {
        if (recentTags.length < 30) recentTags.push(t);
      }
    }
  }

  const sortMap = (m: Map<string, number>) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ [key.includes("level") ? "level" : key.includes("technique") ? "technique" : "topic"]: key, count }));

  return {
    preferred_mess_levels: Array.from(messCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([level, count]) => ({ level, count })),
    preferred_techniques: Array.from(techCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([technique, count]) => ({ technique, count })),
    preferred_topics: Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, count })),
    recent_titles: recentTitles,
    recent_tags: [...new Set(recentTags)],
    total_plans: plans.length,
    positive_signals: positiveTotal,
    negative_signals: negativeTotal,
  };
}

/**
 * Build a recommendation prompt from the taste profile.
 * This tells Claude what to generate WITHOUT an image.
 */
export function buildRecommendationPrompt(
  profile: TasteProfile,
  supplies: string[],
  classSize: number,
  count = 3
): string {
  const lines: string[] = [];

  lines.push(`Generate ${count} art lesson plan recommendations for a class of ${classSize} kids ages 4-6.`);
  lines.push("");

  // Preferences
  if (profile.preferred_mess_levels.length > 0) {
    const top = profile.preferred_mess_levels[0];
    lines.push(`This teacher prefers ${top.level}-mess projects.`);
  }

  if (profile.preferred_techniques.length > 0) {
    const top3 = profile.preferred_techniques.slice(0, 3).map((t) => t.technique);
    lines.push(`Favorite techniques: ${top3.join(", ")}.`);
  }

  if (profile.preferred_topics.length > 0) {
    const top3 = profile.preferred_topics.slice(0, 3).map((t) => t.topic);
    lines.push(`Topics that work well: ${top3.join(", ")}.`);
  }

  // Avoid repeats
  if (profile.recent_titles.length > 0) {
    lines.push("");
    lines.push(`Recently done (avoid repeating): ${profile.recent_titles.slice(0, 5).join(", ")}.`);
  }

  // Supplies on hand
  if (supplies.length > 0) {
    lines.push("");
    lines.push(`Supplies already in the classroom: ${supplies.join(", ")}.`);
    lines.push("Prefer projects that use these materials. Minimize new purchases.");
  }

  // Season
  const month = new Date().getMonth();
  const seasons: Record<number, string> = {
    0: "winter (January)", 1: "winter (February)", 2: "early spring (March)",
    3: "spring (April)", 4: "late spring (May)", 5: "summer (June)",
    6: "summer (July)", 7: "late summer (August)", 8: "early fall (September)",
    9: "fall (October)", 10: "late fall (November)", 11: "winter (December)",
  };
  lines.push("");
  lines.push(`Current season: ${seasons[month]}. Include seasonal themes if appropriate.`);

  // Variety
  lines.push("");
  lines.push("Make each recommendation different — vary the technique, topic, and mess level across the 3 plans.");
  lines.push("For each plan, provide: title, overview (2 sentences), key technique, mess level, estimated cost, and why this teacher would love it based on their history.");

  return lines.join("\n");
}
