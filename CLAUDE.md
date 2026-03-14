# ArtSpark

Art project photos → classroom-ready 60-minute lesson plans for early childhood teachers (kids 4-6).

**Live:** https://artspark-alpha.vercel.app | **Stack:** Next.js 16 + React 19 + Tailwind 4 + Turso

## Architecture

```
Upload image/text → POST /api/generate → Sonnet 4.5 (extended thinking) → LessonPlanData JSON
                                              ↓ (async, non-blocking)
                                    POST /api/polish → Opus 4.6 enhancement
```

**Supply context injection:** Explicit teacher profile (`/supplies`) or inferred from saved plan materials. Appended to prompt before generation.

**Taste-based recommendations:** `/api/recommend` builds profile from saved plans + events → Sonnet generates 3 personalized suggestions.

## Repo Map

```
app/
  page.tsx              # Home: upload form + recommendations + results
  library/page.tsx      # Saved plans: search + mess-level filters
  supplies/page.tsx     # Teacher profile: supplies + class size
  plan/[id]/page.tsx    # Plan detail view
  api/
    generate/route.ts   # Image → Sonnet lesson plan
    generate-text/      # Text → lesson plan (recommendations use this)
    polish/route.ts     # Opus background enhancement
    plans/route.ts      # CRUD + event tracking (save/share/print/delete)
    recommend/route.ts  # Taste profile → 3 suggestions
    supplies/route.ts   # Teacher profile CRUD
components/             # InputForm, LessonPlan, Recommendations, LibraryCard, PrintView, SupplyList
lib/
  claude.ts             # generateLessonPlan() + polishLessonPlan()
  prompts.ts            # buildSystemPrompt() + buildUserPrompt()
  db.ts                 # Turso client + all DB queries
  taste.ts              # Taste profile builder + recommendation prompt
db/artspark.db          # Local SQLite fallback (Turso in prod)
```

## Rules

- **Sonnet for generation, Opus for polish only.** Never swap — Sonnet's extended thinking is tuned for lesson structure.
- **Polish is always optional.** If Opus fails, Sonnet draft stands. Never block the user.
- **Event tracking never throws.** Wrapped in try-catch, logs silently. Feedback loop is nice-to-have, not critical.
- **Supply context has priority order:** explicit profile > inferred from frequent materials > nothing.
- **No auth.** Single implicit user per browser session. Don't add auth complexity.
- **60-second API timeout** (Vercel limit). Generation must complete within this.

## DB Schema (Turso SQLite)

- `lesson_plans`: id, title, overview, plan_json (full LessonPlanData), mess_level, tags, source_url
- `plan_events`: plan_id, event (save|share_plan|share_list|print|delete|polish), created_at
- `user_profile`: supplies (JSON array), class_size, age_range, school_name

## Environment

- `ANTHROPIC_API_KEY` (required)
- `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (prod; local defaults to `file:db/artspark.db`)

## Commands

```bash
npm run dev          # Local dev server
npm run build        # Production build
npm run lint         # ESLint
```
