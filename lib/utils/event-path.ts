import { buildLocalePath, type Locale } from '@/lib/i18n/config'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isEventUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/** Prefer slug; fall back to id until migration is applied / backfilled. */
export function getEventPublicSegment(event: {
  id: string
  slug?: string | null
}): string {
  return event.slug || event.id
}

export function getEventPublicPath(
  locale: Locale,
  event: { id: string; slug?: string | null }
): string {
  return buildLocalePath(locale, `/events/${getEventPublicSegment(event)}`)
}
