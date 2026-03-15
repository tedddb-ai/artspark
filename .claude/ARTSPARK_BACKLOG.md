# ArtSpark Backlog

## P1 — Ship Next

- [x] ~~**Verify Vercel plan (Hobby vs Pro)**~~ — Confirmed Hobby. Streaming workaround in place.
- [x] ~~**Set APP_SECRET + NEXT_PUBLIC_APP_SECRET in Vercel env**~~ — Done.
- [x] ~~**Apply streaming fix to /api/generate-text**~~ — ReadableStream + keepalive pings, matches /api/generate pattern.
- [ ] **Add tests for pure functions** — `lib/social.ts`, `lib/taste.ts`, `lib/prompts.ts`, `lib/affiliate.ts`. Size: M.
- [x] ~~**Error boundaries in React**~~ — Global error.tsx + not-found.tsx + safeJsonParse at all critical sites.
- [ ] **Fix ensureTable() cold start failure** — If Turso unreachable at import, all DB ops fail permanently. Size: S.

## P2 — Hardening

- [ ] **Extract supply injection into shared function** — Duplicated in /api/generate and /api/generate-text. Size: S.
- [x] ~~**Safe JSON parse utility**~~ — `lib/safe-json.ts` with discriminated union return type.
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
- [x] ~~**Vercel Analytics**~~ — Traffic visibility, zero-config.
- [x] ~~**Owner bypass**~~ — Secret URL activation for Ted + Amy.
- [x] ~~**Server-side usage enforcement**~~ — Turso-backed session tracking, closes localStorage bypass.
- [x] ~~**UTM tracking on affiliate links**~~ — Campaign params on all Amazon links.
- [x] ~~**Annual pricing tier**~~ — $79/yr with toggle in UpgradeWall.
- [x] ~~**Class cost calculator**~~ — Per-class cost estimate in SupplyList.
- [ ] **Pinterest API auto-pinning** — Autonomous pin posting for each new plan. Size: M. → Cowork.
- [ ] **Instagram auto-carousel posting** — Meta Graph API auto-posting. Size: M. → Cowork.
- [ ] **Email capture + weekly auto-email** — Turso table + Resend + GitHub Action. Size: M. → Cowork.
- [ ] **More landing pages** — `/preschool-art`, `/kindergarten-art`, `/daycare-activities`. Size: S each. → Cowork.
- [ ] **Footer + About page + Privacy/Terms** — Trust signals for conversion. Size: S. → Cowork.
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
