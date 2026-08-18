export const supportedLocales = ['en', 'zh-cn', 'ja', 'ar', 'es'] as const
export type Locale = (typeof supportedLocales)[number]

export const defaultLocale: Locale = 'en'

/** Remove a supported locale prefix while keeping the rest of the route intact. */
export function stripLocalePrefix(path: string): string {
  const pattern = new RegExp(
    `^/(?:${supportedLocales.join('|')})(?=/|$)`,
    'i'
  )
  const normalized = path.replace(pattern, '')
  const withoutTrailing = normalized.replace(/\/+$/, '')
  return withoutTrailing || '/'
}

/** 语言展示配置：桌面/手机语言切换共用，新增语言只改此处 */
export const localeDisplayConfig: Record<Locale, { label: string; flag: string }> = {
  'en': { label: 'English', flag: '🇺🇸' },
  'zh-cn': { label: '中文', flag: '🇨🇳' },
  'ja': { label: '日本語', flag: '🇯🇵' },
  'ar': { label: 'العربية', flag: '🇸🇦' },
  'es': { label: 'Español', flag: '🇪🇸' },
}

export const localeLanguageTag: Record<Locale, string> = {
  'en': 'en',
  'zh-cn': 'zh-CN',
  'ja': 'ja-JP',
  'ar': 'ar',
  'es': 'es',
}

export const localeDateTag: Record<Locale, string> = {
  'en': 'en-US',
  'zh-cn': 'zh-CN',
  'ja': 'ja-JP',
  'ar': 'ar-SA',
  'es': 'es-ES',
}

export const localeOgTag: Record<Locale, string> = {
  'en': 'en_US',
  'zh-cn': 'zh_CN',
  'ja': 'ja_JP',
  'ar': 'ar_AR',
  'es': 'es_ES',
}

const rtlLocales = new Set<Locale>(['ar'])

export function isValidLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale)
}

export function getLocale(value: string | undefined): Locale {
  if (value && isValidLocale(value)) return value
  return defaultLocale
}

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.has(locale)
}
