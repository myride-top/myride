## Learned User Preferences

- Prefers Czech for product discussions and UI/UX feedback.
- Prefers a single navbar Clubs entry (not separate Explore clubs and Clubs tabs).
- In car share flows, QR code is the primary action; IG Story should be a secondary control that reveals preview and download only after click.
- Wants UI/UX consistency across pages via shared layout shells and design tokens rather than one-off page chrome.
- Club product rules: users may belong to multiple clubs; public club URLs use `/c/[slug]`; club badges are uploaded images managed by founder/admin.

## Learned Workspace Facts

- MyRide is a car-community app (garages, car specs/photos, clubs, map events, premium, analytics) at myride.top.
- Clubs require premium to create; roles are founder/admin/member; key routes include `/clubs`, `/clubs/new`, `/clubs/explore`, `/c/[slug]`, and `/c/[slug]/manage`.
- Club features include member garage feed, club-linked events, join requests, primary-club badge with `+N`, and club explore/search.
- Club schema/migrations live under `migrations/` (including clubs and club extensions); club badge images use the Supabase Storage `club-badges` bucket.
- Shared page chrome centers on `PageLayout` plus `SectionHeader` / `LoadingSpinner` / `EmptyState`, with semantic design tokens instead of raw gray/purple classes.
- Car OG/story images are generated at `/api/og/car` with `format=story` and `format=og`.
- Navbar Clubs links authenticated users to `/clubs` and guests to `/clubs/explore`.
- i18n locales in use: en, cs, de, es.
