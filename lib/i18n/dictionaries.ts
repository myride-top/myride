import enMessages from '@/messages/en.json'
import csMessages from '@/messages/cs.json'
import esMessages from '@/messages/es.json'
import deMessages from '@/messages/de.json'
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'

export type MessageDictionary = typeof enMessages

export const DICTIONARIES: Record<Locale, MessageDictionary> = {
  en: enMessages,
  cs: csMessages,
  es: esMessages,
  de: deMessages,
}

export const getDictionary = async (
  locale: Locale
): Promise<MessageDictionary> => {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]
}
