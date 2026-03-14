# ArtSpark Backlog

## P1 — Ship Next

- [ ] **Verify Vercel plan (Hobby vs Pro)** — If Hobby, maxDuration=60 is ignored and Opus polish has been silently failing since launch. Check dashboard, upgrade if needed. Size: XS.
- [ ] **Set APP_SECRET + NEXT_PUBLIC_APP_SECRET in Vercel env** — API key protection is deployed but inactive until env vars are set. Size: XS.
- [ ] **Add tests for pure functions** — `lib/social.ts`, `lib/taste.ts`, `lib/prompts.ts` are deterministic with zero side effects. Unit tests run in <1s. Catches regressions in hashtag mapping, carousel splitting, taste weighting. Size: M.
- [ ] **Error boundaries in React** — Any `JSON.parse` crash on client (corrupt plan_json, bad API response) shows white screen. Add React error boundary wrapper with friendly fallback UI. Size: S.
- [ ] **Fix ensureTable() cold start failure** — If Turso is unreachable at module import, the promise rejects once and ALL subsequent DB calls fail permanently until function recycles. Add retry logic. Size: S.

## P2 — Hardening

- [ ] **Extract supply injection into shared function** — Duplicated in /api/generate and /api/generate-text. DRY violation. Size: S.
- [ ] **Safe JSON parse utility** — `JSON.parse(saved.plan_json)` with no try/catch appears in 5+ locations (client and server). Create `safeParsePlan()` that returns null on failure. Size: S.
- [ ] **Structured logging on API routes** — Log entry/exit with request ID, duration, success/fail, and Claude token usage. Currently just console.error on failures. Size: M.
- [ ] **Gallery pagination** — `getAllPlans()` loads every plan's full plan_json blob. At 50+ plans this is multi-MB. Add pagination or at minimum exclude plan_json from the listing query. Size: S.
- [ ] **Double-tap protection on generate** — Recommendation tap fires generate-text with no debounce. Two quick taps = two API calls. Add `disabled` state while generating. Size: S.
- [ ] **Split app/page.tsx god component** — 391 lines mixing generation, saving, sharing, polish, errors. Extract into hooks or sub-components before adding more features. Size: M.

## P3 — Growth Features (Phase B/C)

- [ ] **Automated carousel image download as ZIP** — Currently downloads 7 individual files. Bundle as ZIP for single download. Size: S.
- [ ] **TikTok/Reels script generator** — AI-powered (single Claude call per plan): hook → cuts → CTA. Added to plan page. Size: M.
- [ ] **Post-class feedback ("How did it go?")** — 24-48hr after print event, show a feedback nudge. One tap + optional note. Feeds taste profile. Size: M.
- [ ] **Affiliate links in material tips** — Amazon Associates ASIN lookup for common art supplies. Size: M.
- [ ] **PWA + offline library** — Service worker, install prompt, cache plans for offline classroom use. Size: L.
- [ ] **Share-to-ArtSpark (Web Share Target)** — Browse Instagram → share → ArtSpark opens with URL pre-filled. Requires PWA. Size: S (after PWA).
