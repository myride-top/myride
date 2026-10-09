-- Add unique public slug to events for shareable /events/[slug] pages

ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill: slugify title + short id suffix for uniqueness
UPDATE events
SET slug = lower(
  regexp_replace(
    regexp_replace(
      trim(both '-' FROM regexp_replace(
        regexp_replace(
          translate(
            lower(coalesce(nullif(trim(title), ''), 'event')),
            'áäčďéěíňóöřšťúůüýžàâãåæçèêëìîïñòôõøùûÿ',
            'aacdeeinoorstuuuyzaaaaaeceeeiiinoooouuy'
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        ),
        '^-+|-+$',
        '',
        'g'
      )),
      '-{2,}',
      '-',
      'g'
    ),
    '^$',
    'event'
  )
) || '-' || substr(replace(id::text, '-', ''), 1, 8)
WHERE slug IS NULL OR slug = '';

ALTER TABLE events ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events (slug);
