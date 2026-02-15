export const supportedLocales = ['en', 'zh-cn'] as const
export type Locale = (typeof supportedLocales)[number]

export const defaultLocale: Locale = 'en'

/** 语言展示配置：桌面/手机语言切换共用，新增语言只改此处 */
export const localeDisplayConfig: Record<Locale, { label: string; flag: string }> = {
  'en': { label: 'English', flag: '🇺🇸' },
  'zh-cn': { label: '中文', flag: '🇨🇳' },
}

export function isValidLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale)
}

export function getLocale(value: string | undefined): Locale {
  if (value && isValidLocale(value)) return value
  return defaultLocale
}
