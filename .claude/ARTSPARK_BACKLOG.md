# ArtSpark Backlog

## P1 — Ship Next

- [x] ~~**Verify Vercel plan (Hobby vs Pro)**~~ — Confirmed Hobby. Streaming workaround in place.
- [x] ~~**Set APP_SECRET + NEXT_PUBLIC_APP_SECRET in Vercel env**~~ — Done.
- [ ] **Apply streaming fix to /api/generate-text** — Same timeout risk as /api/generate. Currently not streaming. Size: S.
- [ ] **Add tests for pure functions** — `lib/social.ts`, `lib/taste.ts`, `lib/prompts.ts`, `lib/affiliate.ts`. Size: M.
- [ ] **Error boundaries in React** — Any `JSON.parse` crash on client shows white screen. Size: S.
- [ ] **Fix ensureTable() cold start failure** — If Turso unreachable at import, all DB ops fail permanently. Size: S.

## P2 — Hardening

- [ ] **Extract supply injection into shared function** — Duplicated in /api/generate and /api/generate-text. Size: S.
- [ ] **Safe JSON parse utility** — `JSON.parse(saved.plan_json)` with no try/catch in 5+ locations. Size: S.
- [ ] **Structured logging on API routes** — Log entry/exit with duration, success/fail, token usage. Size: M.
- [ ] **Gallery pagination** — `getAllPlans()` loads full plan_json blobs. Size: S.
- [ ] **Double-tap protection on generate** — No debounce on recommendation tap. Size: S.
- [ ] **Split app/page.tsx god component** — Now 400+ lines. Size: M.
- [ ] **Restore richer prompt** — Current prompt is trimmed for speed. Once streaming is stable, can restore quality bar criteria. Size: S.

## P3 — Growth Features

- [x] ~~**Affiliate links in material tips**~~ — Amazon search URLs added to supply lists and shared plans.
- [x] ~~**Premium tier + usage gating**~~ — 3 free plans/month, $10/mo Stripe subscription.
- [x] ~~**Autonomous content seeding**~~ — GitHub Action seeds 5 Opus plans daily.
- [x] ~~**Amazon Associates setup**~~ — Live with tag `artspark2005-20`.
- [x] ~~**Stripe live payments**~~ — Product, price, payment link all live. Daily payouts to Wells Fargo.
- [ ] **Pinterest API auto-pinning** — Autonomous pin posting for each new plan. Size: M.
- [ ] **More landing pages** — `/preschool-art`, `/kindergarten-art`, `/daycare-activities`. Size: S each.
- [ ] **Blog/content roundups** — "Top 10 Spring Art Projects" from saved plans. Size: M.
- [ ] **TikTok/Reels script generator** — AI-powered: hook → cuts → CTA. Size: M.
- [ ] **Post-class feedback ("How did it go?")** — Feedback nudge after print. Size: M.
- [ ] **PWA + offline library** — Service worker, install prompt. Size: L.
- [ ] **Automated carousel image download as ZIP** — Size: S.

## P3b — SEO & Discovery (added 2026-03-14)

- [x] ~~**Dynamic sitemap**~~ — `/sitemap.xml` auto-generates from saved plans.
- [x] ~~**Homeschool landing page**~~ — `/homeschool` for organic search discovery.
- [x] ~~**SEO metadata optimization**~~ — Gallery + plan pages optimized for "free art lesson plans" keywords.
- [x] ~~**robots.txt**~~ — Points crawlers to sitemap.
- [x] ~~**OG image CTA badge**~~ — "FREE Lesson Plan + Shopping List" on social previews.
- [x] ~~**Amazon Associates disclosure**~~ — Required compliance text on supply lists + footer.
