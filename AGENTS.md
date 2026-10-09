## Learned User Preferences

- Prefers Czech for product discussions and UI/UX feedback.
- Prefers a single navbar Clubs entry (not separate Explore clubs and Clubs tabs).
- In car share flows, QR code is the primary action; IG Story should be a secondary control that reveals preview and download only after click.
- Wants UI/UX consistency across pages via shared layout shells and design tokens rather than one-off page chrome.
- Club product rules: users may belong to multiple clubs; public club URLs use `/c/[slug]`; club badges are uploaded images managed by founder/admin.
- Prefers sitemap and canonical URLs on `https://www.myride.top` (www); do not submit redirecting URLs (apex or bare `/{locale}` roots).
- Prefers localized SEO metadata (title/description/OG locale) via `getTranslations({ locale, namespace: 'meta' })`; hreflang `x-default` points to `/en/`.

## Learned Workspace Facts

- MyRide is a car-community app (garages, car specs/photos, clubs, map events, premium, analytics) at myride.top.
- Clubs require premium to create; roles are founder/admin/member; key routes include `/clubs`, `/clubs/new`, `/clubs/explore`, `/c/[slug]`, and `/c/[slug]/manage`.
- Club features include member garage feed, club-linked events, join requests, primary-club badge with `+N`, and club explore/search.
- Club schema/migrations live under `migrations/` (including clubs and club extensions); club badge images use the Supabase Storage `club-badges` bucket.
- Shared page chrome centers on `PageLayout` plus `SectionHeader` / `LoadingSpinner` / `EmptyState`, with semantic design tokens instead of raw gray/purple classes.
- Car OG/story images are generated at `/api/og/car` with `format=story` and `format=og`; site default social image is PNG via `app/opengraph-image.tsx` (not SVG).
- Navbar Clubs links authenticated users to `/clubs` and guests to `/clubs/explore`.
- i18n locales in use: en, cs, de, es; `SITE_URL` is `https://www.myride.top` for metadataBase, canonicals, OG, and JSON-LD.
- `/{locale}` 308-redirects to `/{locale}/browse`; sitemap lists www final destinations only (browse, clubs/explore, legal, public cars, premium profiles)—not bare locale roots or non-premium profiles.
- Public browse/clubs/explore/legal/car pages are indexable; map and auth stay noindex; robots disallows `/*/dashboard`, `/*/create`, `/*/profile`; non-premium profiles are noindex; missing cars/profiles use `notFound()`.
- Browse, car detail, and premium profile pages SSR public HTML (H1, car links); next/font variable classes belong on `<html>`, not `<body>`.
- Map events use the basic Leaflet OSM tile layer (avoid tile providers that require an API key).
