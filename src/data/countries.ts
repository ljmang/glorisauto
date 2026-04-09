/**
 * 国家/地区列表，用于经销商表单等下拉选择
 * value 为英文名（提交给后端），label 按 locale 显示
 */
export interface CountryOption {
  value: string;
  labelEn: string;
  labelZh: string;
}

export const countryOptions: CountryOption[] = [
  { value: 'China', labelEn: 'China', labelZh: '中国' },
  { value: 'India', labelEn: 'India', labelZh: '印度' },
  { value: 'United States', labelEn: 'United States', labelZh: '美国' },
  { value: 'United Kingdom', labelEn: 'United Kingdom', labelZh: '英国' },
  { value: 'Germany', labelEn: 'Germany', labelZh: '德国' },
  { value: 'France', labelEn: 'France', labelZh: '法国' },
  { value: 'Japan', labelEn: 'Japan', labelZh: '日本' },
  { value: 'South Korea', labelEn: 'South Korea', labelZh: '韩国' },
  { value: 'Australia', labelEn: 'Australia', labelZh: '澳大利亚' },
  { value: 'Canada', labelEn: 'Canada', labelZh: '加拿大' },
  { value: 'Italy', labelEn: 'Italy', labelZh: '意大利' },
  { value: 'Spain', labelEn: 'Spain', labelZh: '西班牙' },
  { value: 'Netherlands', labelEn: 'Netherlands', labelZh: '荷兰' },
  { value: 'Brazil', labelEn: 'Brazil', labelZh: '巴西' },
  { value: 'Mexico', labelEn: 'Mexico', labelZh: '墨西哥' },
  { value: 'Indonesia', labelEn: 'Indonesia', labelZh: '印度尼西亚' },
  { value: 'Thailand', labelEn: 'Thailand', labelZh: '泰国' },
  { value: 'Vietnam', labelEn: 'Vietnam', labelZh: '越南' },
  { value: 'Malaysia', labelEn: 'Malaysia', labelZh: '马来西亚' },
  { value: 'Singapore', labelEn: 'Singapore', labelZh: '新加坡' },
  { value: 'United Arab Emirates', labelEn: 'United Arab Emirates', labelZh: '阿联酋' },
  { value: 'Saudi Arabia', labelEn: 'Saudi Arabia', labelZh: '沙特阿拉伯' },
  { value: 'South Africa', labelEn: 'South Africa', labelZh: '南非' },
  { value: 'Russia', labelEn: 'Russia', labelZh: '俄罗斯' },
  { value: 'Turkey', labelEn: 'Turkey', labelZh: '土耳其' },
  { value: 'Poland', labelEn: 'Poland', labelZh: '波兰' },
  { value: 'Other', labelEn: 'Other', labelZh: '其他' },
];

export function getCountryLabel(option: CountryOption, locale: string): string {
  return locale.startsWith('zh') ? option.labelZh : option.labelEn;
}
