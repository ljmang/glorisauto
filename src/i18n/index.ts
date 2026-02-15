import {
  type Locale,
  supportedLocales,
  defaultLocale,
  isValidLocale,
  getLocale,
} from './config'

export type Messages = Record<string, unknown>

const messagesCache: Partial<Record<Locale, Messages>> = {}

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (messagesCache[locale]) return messagesCache[locale]!
  const mod = await import(`./locales/${locale}.json`)
  const messages = mod.default as Messages
  messagesCache[locale] = messages
  return messages
}

/** Get message by dot path, e.g. t(messages, 'pageTitle.home'). Supports {param} in value. */
export function t(messages: Messages, key: string, params?: Record<string, string>): string {
  const value = key.split('.').reduce<unknown>((obj, k) => {
    if (obj != null && typeof obj === 'object' && k in obj) return (obj as Record<string, unknown>)[k]
    return undefined
  }, messages)
  if (typeof value !== 'string') return key
  if (!params) return value
  return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), value)
}

export { supportedLocales, defaultLocale, isValidLocale, getLocale }
export type { Locale }
