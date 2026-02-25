# Platform Optimization + i18n Rollout Plan

## Scope
- Performance and database optimization without changing theme tokens or visual language.
- i18n rollout for `en`, `cs`, `es`, `de`.
- SEO metadata and structured data hardening for multilingual URLs.

## Baseline (2026-02-17)
- `next build` passes, with invalid `next.config.ts` key: `swcMinify`.
- Lint warnings include `@next/next/no-img-element` and a few hook dependency issues.
- Heaviest route payload: `/u/[username]/[car]`.
- Analytics path has N+1 query loops in `lib/database/analytics.ts`.
- Stats recount pattern in `lib/database/cars-client.ts` for view/share/comment writes.
- Browse page filters full dataset on client (`app/(platform)/browse/page.tsx`).
- i18n infrastructure absent; `<html lang="en">` is static.
- Structured data currently injected client-side and replaces existing JSON-LD scripts.

## KPI Targets
- Analytics endpoint P95 latency improvement >= 50%.
- Remove query-in-loop N+1 from analytics pipeline.
- Zero `@next/next/no-img-element` warnings.
- Lower JS payload for `/u/[username]/[car]`.
- Locale switch (`en/cs/es/de`) with cookie persistence and route compatibility.

## Rollout Waves
1. DB indexes + RPC analytics functions.
2. Counter synchronization using DB triggers.
3. Analytics server refactor to RPC.
4. Frontend image/hook performance fixes.
5. Browse/map data-load scaling.
6. i18n module + switcher + middleware locale support.
7. SEO/structured-data multilingual hardening.
8. Logging + DX cleanup and overfetch reduction.

## Verification Checklist
- Build and lint after each wave.
- Validate analytics response shape remains unchanged.
- Validate locale routing with and without prefixes.
- Validate no theme token changes in `app/globals.css`.

## Execution Status (2026-02-17)
- Wave 1 complete: added index + RPC migration (`migrations/20260217_01_perf_indexes_rpc.sql`).
- Wave 2 complete: trigger-based counter sync migration (`migrations/20260217_02_counters_triggers.sql`).
- Wave 3 complete: analytics DB layer refactored to RPC aggregation.
- Wave 4 complete: key routes/components moved to `next/image`, dynamic imports added on car detail.
- Wave 5 complete: browse switched to server query + pagination (`/api/cars`), map popup data loading made lazy-on-open.
- Wave 6 in progress: i18n infrastructure + locale middleware + language switcher implemented, core pages partially localized.
- Wave 7 in progress: structured data moved to SSR, locale-aware metadata/sitemap updated.
- Wave 8 in progress: invalid Next config fixed, high-traffic overfetch reduced in counter/count queries.

## Latest Metrics Snapshot (2026-02-17)
- `bun run lint`: clean (`0` warnings, `0` errors).
- `bun run build`: pass.
- Added API route: `/api/cars` for paginated browse.
- Middleware bundle size: `67.4 kB`.
- Route JS snapshot:
  - `/browse` first load: `240 kB`
  - `/u/[username]/[car]` first load: `228 kB`
