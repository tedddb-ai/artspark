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

const IG_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "@littlebayartsandcrafts";

function getHashtags(plan: LessonPlanData, max = 25): string[] {
  const tags = new Set<string>();

  const allTags = [...(plan.tags || []), ...(plan.season_tags || [])];
  for (const tag of allTags) {
    const lower = tag.toLowerCase();
    for (const [key, hashtags] of Object.entries(TAG_HASHTAG_MAP)) {
      if (lower.includes(key)) {
        hashtags.forEach((h) => tags.add(h));
      }
    }
  }

  const titleHash = plan.title.length % STANDARD_HASHTAGS.length;
  for (let i = 0; i < STANDARD_HASHTAGS.length && tags.size < max; i++) {
    tags.add(STANDARD_HASHTAGS[(i + titleHash) % STANDARD_HASHTAGS.length]);
  }

  return Array.from(tags).slice(0, max);
}

// --- Extract discussion questions from schedule phases ---
function getDiscussionQuestions(plan: LessonPlanData): string[] {
  const questions: string[] = [];
  for (const phase of plan.schedule || []) {
    if (phase.discussion_questions) {
      questions.push(...phase.discussion_questions);
    }
  }
  return questions;
}

// --- Extract teacher tips from schedule phases + materials ---
function getTeacherTips(plan: LessonPlanData): string[] {
  const tips: string[] = [];
  for (const phase of plan.schedule || []) {
    if (phase.teacher_tip) tips.push(phase.teacher_tip);
  }
  for (const mat of plan.materials || []) {
    if (mat.tip) tips.push(mat.tip);
  }
  return tips;
}

// --- Hook generation ---
function generateHook(plan: LessonPlanData): string {
  const questions = getDiscussionQuestions(plan);
  const tips = getTeacherTips(plan);
  const variant = plan.title.length % 5;

  if (variant === 0 && questions.length > 0) {
    return `Ask your kids: "${questions[0]}" — their answers will surprise you`;
  }
  if (variant === 1 && plan.parent_note) {
    return `Parents keep telling me: "${plan.parent_note}"`;
  }
  if (variant === 2 && tips.length > 0) {
    return `Teacher hack: ${tips[0]}`;
  }
  if (variant === 3 && plan.modifications?.harder) {
    return `Think this is too easy for your class? Wait for the challenge version...`;
  }
  if (plan.parent_note) {
    return `"${plan.parent_note}" — Here's the project that did it`;
  }
  if (questions.length > 0) {
    return `Ask your kids: "${questions[0]}"`;
  }
  return `${plan.title} — and it only costs ${plan.total_estimated_cost} for the whole class`;
}

// --- Engagement CTA generation ---
function generateEngagementCTA(plan: LessonPlanData): string {
  const questions = getDiscussionQuestions(plan);
  const variant = plan.title.length % 4;

  if (variant === 0 && questions.length > 1) {
    return `Which part would your kids love most? Tell me below 👇`;
  }
  if (variant === 1 && plan.modifications) {
    return `Would you try the easier or harder version? Comment below! 👇`;
  }
  if (variant === 2 && questions.length > 0) {
    return `${questions[questions.length > 1 ? 1 : 0]} Let me know below 👇`;
  }
  return `Tag a teacher friend who needs this 👇`;
}

// --- Instagram Caption ---

export function generateInstagramCaption(
  plan: LessonPlanData,
  planUrl: string
): string {
  const mess = MESS_EMOJI[plan.mess_level] || "🎨";
  const lines: string[] = [];

  // Hook (first 3 lines are critical — Instagram truncates after this)
  lines.push(generateHook(plan));
  lines.push("");

  // Overview
  lines.push(plan.overview);
  lines.push("");

  // Proof point
  const tips = getTeacherTips(plan);
  if (plan.parent_note && plan.title.length % 2 === 0) {
    lines.push(`💬 "${plan.parent_note}"`);
    lines.push("");
  } else if (tips.length > 0) {
    lines.push(`💡 Pro tip: ${tips[0]}`);
    lines.push("");
  }

  // Quick stats
  lines.push(
    `${mess} ${plan.mess_level} mess | ⏱ 60 min | 💰 ${plan.total_estimated_cost}`
  );
  lines.push("");

  // What they'll learn
  if (plan.learning_objectives?.length) {
    lines.push("Kids will learn:");
    for (const obj of plan.learning_objectives.slice(0, 3)) {
      lines.push(`→ ${obj}`);
    }
    lines.push("");
  }

  // Engagement CTA (drives comments — algorithm gold)
  lines.push(generateEngagementCTA(plan));
  lines.push("");

  // Link + follow
  lines.push(`Full lesson plan + free shopping list: ${planUrl}`);
  lines.push(`Follow ${IG_HANDLE} for daily art ideas 🎨`);
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
  accent?: string;
}

export function generateCarouselSlides(
  plan: LessonPlanData,
  planUrl: string
): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  const questions = getDiscussionQuestions(plan);
  const materialTips = (plan.materials || []).filter((m) => m.tip).map((m) => `💡 ${m.item}: ${m.tip}`);

  // 1. Cover
  slides.push({
    title: plan.title,
    body: [
      plan.overview,
      "",
      `${MESS_EMOJI[plan.mess_level] || "🎨"} ${plan.mess_level} mess | 60 min | ${plan.total_estimated_cost}`,
    ],
    slideNumber: 1,
    totalSlides: 0,
    accent: "crayon-red",
  });

  // 2. Art Words (if vocabulary exists)
  if (plan.vocabulary && plan.vocabulary.length >= 3) {
    slides.push({
      title: "Art Words They'll Learn 📚",
      body: plan.vocabulary.slice(0, 6).map((v) => `• ${v}`),
      slideNumber: 0,
      totalSlides: 0,
      accent: "crayon-blue",
    });
  }

  // 3. Materials / Shopping List
  const materials = (plan.materials || []).slice(0, 8).map(
    (m) => `• ${m.item} — ${m.quantity} (${m.estimated_cost})`
  );
  if (plan.materials?.length > 8) {
    materials.push(`+ ${plan.materials.length - 8} more...`);
  }
  slides.push({
    title: "Shopping List 🛒",
    body: [...materials, "", `Total: ~${plan.total_estimated_cost}`],
    slideNumber: 0,
    totalSlides: 0,
    accent: "crayon-green",
  });

  // 4. Prep Steps
  if (plan.prep_steps?.length) {
    slides.push({
      title: "Before Class ✅",
      body: plan.prep_steps.map((s) => `☐ ${s}`),
      slideNumber: 0,
      totalSlides: 0,
      accent: "crayon-blue",
    });
  }

  // 5-6. Step by Step (split across 2 slides)
  const steps = plan.step_by_step_instructions || [];
  const mid = Math.ceil(steps.length / 2);
  if (steps.length > 0) {
    slides.push({
      title: "Steps 1–" + mid,
      body: steps.slice(0, mid).map((s, i) => `${i + 1}. ${s}`),
      slideNumber: 0,
      totalSlides: 0,
      accent: "crayon-orange",
    });
  }
  if (steps.length > mid) {
    slides.push({
      title: `Steps ${mid + 1}–${steps.length}`,
      body: steps.slice(mid).map((s, i) => `${mid + i + 1}. ${s}`),
      slideNumber: 0,
      totalSlides: 0,
      accent: "crayon-orange",
    });
  }

  // 7. Tips & Modifications
  const modTips: string[] = [];
  if (plan.safety_notes?.length) {
    modTips.push("⚠️ " + plan.safety_notes[0]);
  }
  if (plan.modifications?.easier) {
    modTips.push("🟢 Easier: " + plan.modifications.easier);
  }
  if (plan.modifications?.harder) {
    modTips.push("🔴 Challenge: " + plan.modifications.harder);
  }
  if (modTips.length) {
    slides.push({
      title: "Tips & Modifications",
      body: modTips,
      slideNumber: 0,
      totalSlides: 0,
      accent: "crayon-pink",
    });
  }

  // 8. Pro Tips (if material tips exist)
  if (materialTips.length >= 2) {
    slides.push({
      title: "Teacher Tips 💡",
      body: materialTips.slice(0, 4),
      slideNumber: 0,
      totalSlides: 0,
      accent: "crayon-pink",
    });
  }

  // 9. CTA with engagement question
  const ctaBody = [
    "Full lesson plan with detailed",
    "instructions + shopping list:",
    "",
    planUrl,
    "",
  ];
  if (questions.length > 0) {
    ctaBody.push(`${questions[0]} 👇`);
    ctaBody.push("");
  }
  ctaBody.push(`Follow ${IG_HANDLE} for daily`);
  ctaBody.push("art lesson inspiration! 🎨");

  slides.push({
    title: "Try This! 📌",
    body: ctaBody,
    slideNumber: 0,
    totalSlides: 0,
    accent: "crayon-red",
  });

  // Re-number all slides
  for (let i = 0; i < slides.length; i++) {
    slides[i].slideNumber = i + 1;
    slides[i].totalSlides = slides.length;
  }

  return slides;
}
