import type { LessonPlanData } from "./claude";

// --- Hashtag mapping ---

const STANDARD_HASHTAGS = [
  "#artteacher", "#preschoolart", "#kidsart", "#artlessonplan",
  "#earlychildhood", "#prek", "#kindergartenart", "#processart",
  "#artsandcrafts", "#teacherlife", "#arteducation", "#kidsactivities",
];

const TAG_HASHTAG_MAP: Record<string, string[]> = {
  painting: ["#kidspainting", "#paintingwithkids", "#temperapaint"],
  collage: ["#collageart", "#kidscollage", "#mixedmedia"],
  sculpture: ["#kidssculpture", "#3dart", "#clayforkids"],
  drawing: ["#kidsdrawing", "#drawingforkids"],
  printmaking: ["#printmaking", "#stampart"],
  weaving: ["#weavingforkids", "#fiberforkids"],
  "paper plate": ["#paperplatecraft", "#paperplateart"],
  "paper craft": ["#papercraft", "#cuttingskills"],
  nature: ["#natureart", "#naturecraft", "#outdoorart"],
  recycled: ["#recycledart", "#upcyclecraft", "#ecofriendly"],
  sensory: ["#sensoryplay", "#sensoryart"],
  texture: ["#textureart", "#tactileart"],
  color: ["#colormixing", "#colortheory", "#primarycolors"],
  spring: ["#springcrafts", "#springart"],
  summer: ["#summercrafts", "#summerart"],
  fall: ["#fallcrafts", "#autumnart"],
  winter: ["#wintercrafts", "#winterart"],
  christmas: ["#christmascraft", "#holidayart"],
  halloween: ["#halloweencraft", "#spookyart"],
  valentine: ["#valentinecraft", "#valentineart"],
  easter: ["#eastercraft", "#easterart"],
  "mothers day": ["#mothersdaycraft", "#giftfromkids"],
  "fathers day": ["#fathersdaycraft"],
  animals: ["#animalart", "#animalcraft"],
  ocean: ["#oceanart", "#undertheseacraft"],
  space: ["#spaceart", "#spacecraft"],
};

const MESS_EMOJI: Record<string, string> = {
  low: "✨",
  medium: "🎨",
  high: "🌈",
};

function getHashtags(plan: LessonPlanData, max = 25): string[] {
  const tags = new Set<string>();

  // Tag-specific hashtags
  const allTags = [...(plan.tags || []), ...(plan.season_tags || [])];
  for (const tag of allTags) {
    const lower = tag.toLowerCase();
    for (const [key, hashtags] of Object.entries(TAG_HASHTAG_MAP)) {
      if (lower.includes(key)) {
        hashtags.forEach((h) => tags.add(h));
      }
    }
  }

  // Fill with standard hashtags (rotate by using title hash for variety)
  const titleHash = plan.title.length % STANDARD_HASHTAGS.length;
  for (let i = 0; i < STANDARD_HASHTAGS.length && tags.size < max; i++) {
    tags.add(STANDARD_HASHTAGS[(i + titleHash) % STANDARD_HASHTAGS.length]);
  }

  return Array.from(tags).slice(0, max);
}

// --- Instagram Caption ---

export function generateInstagramCaption(
  plan: LessonPlanData,
  planUrl: string
): string {
  const mess = MESS_EMOJI[plan.mess_level] || "🎨";
  const lines: string[] = [];

  // Hook
  lines.push(plan.title.toUpperCase());
  lines.push("");

  // Overview
  lines.push(plan.overview);
  lines.push("");

  // Quick stats
  lines.push(
    `${mess} Mess level: ${plan.mess_level} | ⏱ 60 min | 💰 ${plan.total_estimated_cost}`
  );
  lines.push("");

  // What they'll learn
  if (plan.learning_objectives?.length) {
    lines.push("Kids will:");
    for (const obj of plan.learning_objectives.slice(0, 3)) {
      lines.push(`→ ${obj}`);
    }
    lines.push("");
  }

  // CTA
  lines.push("Save this for your next class! 📌");
  lines.push(`Full lesson plan + shopping list: ${planUrl}`);
  lines.push("");

  // Hashtags
  lines.push(getHashtags(plan).join(" "));

  return lines.join("\n");
}

// --- Carousel Slides ---

export interface CarouselSlide {
  title: string;
  body: string[];
  slideNumber: number;
  totalSlides: number;
  accent?: string; // color hint for rendering
}

export function generateCarouselSlides(
  plan: LessonPlanData,
  planUrl: string
): CarouselSlide[] {
  const slides: CarouselSlide[] = [];

  // 1. Cover
  slides.push({
    title: plan.title,
    body: [plan.overview, `${MESS_EMOJI[plan.mess_level] || "🎨"} ${plan.mess_level} mess | 60 min | ${plan.total_estimated_cost}`],
    slideNumber: 1,
    totalSlides: 0, // filled in at the end
    accent: "crayon-red",
  });

  // 2. Materials / Shopping List
  const materials = (plan.materials || []).slice(0, 8).map(
    (m) => `• ${m.item} — ${m.quantity} (${m.estimated_cost})`
  );
  if (plan.materials?.length > 8) {
    materials.push(`+ ${plan.materials.length - 8} more...`);
  }
  slides.push({
    title: "Shopping List 🛒",
    body: [...materials, "", `Total: ~${plan.total_estimated_cost}`],
    slideNumber: 2,
    totalSlides: 0,
    accent: "crayon-green",
  });

  // 3. Prep Steps
  if (plan.prep_steps?.length) {
    slides.push({
      title: "Before Class ✅",
      body: plan.prep_steps.map((s) => `☐ ${s}`),
      slideNumber: 3,
      totalSlides: 0,
      accent: "crayon-blue",
    });
  }

  // 4-5. Step by Step (split across 2 slides)
  const steps = plan.step_by_step_instructions || [];
  const mid = Math.ceil(steps.length / 2);
  if (steps.length > 0) {
    slides.push({
      title: "Steps 1–" + mid,
      body: steps.slice(0, mid).map((s, i) => `${i + 1}. ${s}`),
      slideNumber: slides.length + 1,
      totalSlides: 0,
      accent: "crayon-orange",
    });
  }
  if (steps.length > mid) {
    slides.push({
      title: `Steps ${mid + 1}–${steps.length}`,
      body: steps.slice(mid).map((s, i) => `${mid + i + 1}. ${s}`),
      slideNumber: slides.length + 1,
      totalSlides: 0,
      accent: "crayon-orange",
    });
  }

  // 6. Tips & Modifications
  const tips: string[] = [];
  if (plan.safety_notes?.length) {
    tips.push("⚠️ " + plan.safety_notes[0]);
  }
  if (plan.modifications?.easier) {
    tips.push("🟢 Easier: " + plan.modifications.easier);
  }
  if (plan.modifications?.harder) {
    tips.push("🔴 Challenge: " + plan.modifications.harder);
  }
  if (tips.length) {
    slides.push({
      title: "Tips & Modifications",
      body: tips,
      slideNumber: slides.length + 1,
      totalSlides: 0,
      accent: "crayon-pink",
    });
  }

  // 7. CTA
  slides.push({
    title: "Save This! 📌",
    body: [
      "Full lesson plan with detailed",
      "instructions + shopping list:",
      "",
      planUrl,
      "",
      "Follow @artspark for daily",
      "art lesson inspiration!",
    ],
    slideNumber: slides.length + 1,
    totalSlides: 0,
    accent: "crayon-red",
  });

  // Fill in total count and re-number
  for (let i = 0; i < slides.length; i++) {
    slides[i].slideNumber = i + 1;
    slides[i].totalSlides = slides.length;
  }

  return slides;
}
