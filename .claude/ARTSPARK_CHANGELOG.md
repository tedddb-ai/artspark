# ArtSpark Changelog

## 2026-03-15 (session 5) — Reliability Hardening

- **Streaming for /api/generate-text** — ReadableStream + keepalive pings prevent Vercel Hobby timeouts (matches /api/generate pattern)
- **safeJsonParse utility** — Discriminated union wrapper replaces bare JSON.parse at 5 critical sites (both API routes, both client handlers, plan detail page)
- **Global error boundary** — app/error.tsx catches unhandled React errors with Try Again + Go Home UI
- **404 page** — app/not-found.tsx for missing routes

## 2026-03-15 (session 4) — Revenue Machine

**14 commits. Full monetization stack shipped. ArtSpark now earns money autonomously.**

### Revenue Infrastructure
- **Amazon Associates** — Live (`artspark2005-20`). "Buy" button on every supply item + "Shop All on Amazon" CTA. Affiliate links in shared shopping lists (email/text). Disclosure added for compliance.
- **Stripe subscriptions** — Live product, $10/mo price, payment link. Auto-activates premium on redirect. Daily payouts to Wells Fargo.
- **Premium tier + usage gating** — Free users get 3 plans/month, then upgrade wall. Counter badge shows remaining plans.

### Autonomous Content Engine
- **Daily plan seeding** — GitHub Action runs at 06:00 UTC, generates 5 Opus-quality plans from 40+ rotating SEO topics. Each plan = new indexed page with affiliate links.
- **Gallery seeded** — 16+ Opus plans live targeting high-traffic search terms (watercolor, paper plate animals, salt dough, etc.)

### SEO & Discovery
- **Homeschool landing page** — `/homeschool` targeting "free art curriculum for homeschool"
- **Dynamic sitemap** — Auto-includes all plan pages
- **robots.txt** — Points Google to sitemap
- **SEO metadata** — Plan pages + gallery optimized for "free art lesson plan" keywords
- **OG image CTA** — "FREE Lesson Plan + Shopping List" badge on social previews
- **Social post templates** — Ready-to-paste posts for Facebook, Reddit, Pinterest

### Verify
- Visit https://artspark-alpha.vercel.app/gallery → should show 16+ plans
- Click any supply item "Buy" button → should go to Amazon with `tag=artspark2005-20` in URL
- Generate 3 plans → should see upgrade wall on 4th attempt
- Upgrade wall "Upgrade Now" button → should open live Stripe checkout

## 2026-03-14 (session 3) — SEO, Affiliates, Debugging

### Fixed
- **Turso env var newline** — trailing `\n` in TURSO_DATABASE_URL was silently breaking all builds. Trimmed in code.
- **Generation timeout** — Sonnet + vision takes ~80s, exceeds Vercel 60s limit. Fixed with streaming keepalive (space chars every 5s keep connection alive).
- **Removed "Get" button** — paste URL → tap Generate in one step now.
- **Dropped Opus polish** — was dead on Hobby anyway (10s timeout). Sonnet-only.
- **API key protection activated** — APP_SECRET env vars set in Vercel.

### Added (by Ted)
- Amazon affiliate links in all supply lists (`lib/affiliate.ts`)
- Homeschool landing page (`/homeschool`)
- Dynamic sitemap (`/sitemap.xml`)
- SEO metadata optimization on gallery + plan pages

### Verify
- Paste an Instagram URL → tap Generate → should complete in ~60-80s
- Save a plan → check Library → plan should persist
- Share a plan URL → should show rich preview with OG image

## 2026-03-14 — Social Media Engine + Hardening

**10 commits this session. Major feature expansion + first hardening pass.**

### Features Shipped
- **My Supplies profile** — checklist of classroom supplies + class size slider → personalizes every plan
- **Dynamic class size** — flows through system prompt, user prompt, and material quantities
- **Social media pipeline** — Instagram caption generator with smart hashtag mapping, carousel preview
- **OG images** — dynamic 1200x630 branded images on every plan page (rich link previews)
- **Server-side plan metadata** — `generateMetadata()` on /plan/[id] for crawlers + social cards
- **Carousel image generation** — server-rendered 1080x1080 PNGs via Satori, one-tap download
- **Taste profile engine** — learns from save/share/print/delete events, weights preferences
- **Recommendation API** — generates 3 personalized plan ideas (no image needed)
- **Text-only generation** — `/api/generate-text` for recommendation-driven plans
- **"For You" on home page** — returning users see personalized recommendations
- **Public gallery page** — SEO-optimized listing of all plans
- **Pinterest Pin button** — one-tap pin using OG image
- **JSON-LD HowTo schema** — Google rich snippets for lesson plan search results
- **HOW-TO-USE.md** — plain-English guide for non-technical users

### Hardening (from CEO plan review)
- **Fixed taste profile bug** — event signals were never applied (plan_id vs title mismatch)
- **API key protection** — all Claude-calling routes check x-app-key header (env var activated)
- **Cache headers** — recommend (4hr), OG images (24hr), carousel images (24hr)
- **Prioritized backlog** — 16 items written to ARTSPARK_BACKLOG.md

### Verify
- Visit any saved plan → share the URL → confirm rich preview renders
- Home page as returning user → "For You" section should appear
- Plan page → "Copy for Instagram" → confirm caption + hashtags copy
- Plan page → "Carousel Preview" → "Download All" → confirm PNGs download
