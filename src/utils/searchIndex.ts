// 搜索索引类型定义
export interface SearchItem {
  title: string;
  content: string;
  url: string;
  type: 'product' | 'insight' | 'help' | 'about' | 'support';
  locale: string;
  category?: string;
}

type SearchLocale = 'en' | 'zh-cn' | 'ja';

interface SearchStaticText {
  aboutUs: string;
  aboutUsContent: string;
  brandStory: string;
  brandStoryContent: string;
  dealer: string;
  dealerContent: string;
  production: string;
  productionContent: string;
  products: string;
  productsContent: string;
  insights: string;
  insightsContent: string;
  support: string;
  supportContent: string;
  contact: string;
  contactContent: string;
  downloads: string;
  downloadsContent: string;
  helpCenter: string;
  helpCenterContent: string;
  privacy: string;
  privacyContent: string;
}

const SEARCH_TEXTS: Record<SearchLocale, SearchStaticText> = {
  en: {
    aboutUs: 'About Us',
    aboutUsContent: 'About Us content',
    brandStory: 'Brand Story',
    brandStoryContent: 'Brand Story content',
    dealer: 'Dealer',
    dealerContent: 'Dealer content',
    production: 'Production',
    productionContent: 'Production content',
    products: 'Products',
    productsContent: 'Products list content',
    insights: 'Insights',
    insightsContent: 'Insights articles list content',
    support: 'Support',
    supportContent: 'Support center content',
    contact: 'Contact Us',
    contactContent: 'Contact Us form',
    downloads: 'Downloads',
    downloadsContent: 'Downloads files list content',
    helpCenter: 'Help Center',
    helpCenterContent: 'Help Center categories list',
    privacy: 'Privacy Policy',
    privacyContent: 'Privacy Policy content',
  },
  'zh-cn': {
    aboutUs: '关于我们',
    aboutUsContent: '关于我们内容',
    brandStory: '品牌故事',
    brandStoryContent: '品牌故事内容',
    dealer: '经销商',
    dealerContent: '经销商内容',
    production: '生产制造',
    productionContent: '生产制造内容',
    products: '产品',
    productsContent: '产品列表内容',
    insights: '洞察',
    insightsContent: '洞察文章列表内容',
    support: '支持',
    supportContent: '支持中心内容',
    contact: '联系我们',
    contactContent: '联系我们表单',
    downloads: '下载中心',
    downloadsContent: '下载文件列表内容',
    helpCenter: '帮助中心',
    helpCenterContent: '帮助中心分类列表',
    privacy: '隐私政策',
    privacyContent: '隐私政策内容',
  },
  ja: {
    aboutUs: '会社情報',
    aboutUsContent: '会社情報ページ',
    brandStory: 'ブランドストーリー',
    brandStoryContent: 'ブランドストーリーの内容',
    dealer: '販売代理店',
    dealerContent: '販売代理店向け情報',
    production: '生産拠点',
    productionContent: '生産拠点の紹介',
    products: '製品',
    productsContent: '製品一覧',
    insights: 'インサイト',
    insightsContent: 'インサイト記事一覧',
    support: 'サポート',
    supportContent: 'サポートセンター情報',
    contact: 'お問い合わせ',
    contactContent: 'お問い合わせフォーム',
    downloads: 'ダウンロード',
    downloadsContent: 'ダウンロード資料一覧',
    helpCenter: 'ヘルプセンター',
    helpCenterContent: 'ヘルプカテゴリ一覧',
    privacy: 'プライバシーポリシー',
    privacyContent: 'プライバシーポリシーの内容',
  },
};

function resolveSearchTexts(locale: string): SearchStaticText {
  if (locale === 'zh-cn' || locale === 'ja') return SEARCH_TEXTS[locale];
  return SEARCH_TEXTS.en;
}

// 生成搜索索引
export async function generateSearchIndex(locale: string): Promise<SearchItem[]> {
  const items: SearchItem[] = [];
  const texts = resolveSearchTexts(locale);

  // 关于我们页面
  items.push({
    title: texts.aboutUs,
    content: texts.aboutUsContent,
    url: `/${locale}/about`,
    type: 'about',
    locale,
  });
  items.push({
    title: texts.brandStory,
    content: texts.brandStoryContent,
    url: `/${locale}/about/brand-story`,
    type: 'about',
    locale,
  });
  items.push({
    title: texts.dealer,
    content: texts.dealerContent,
    url: `/${locale}/about/dealer`,
    type: 'about',
    locale,
  });
  items.push({
    title: texts.production,
    content: texts.productionContent,
    url: `/${locale}/about/insights/news/our-factory`,
    type: 'about',
    locale,
  });

  // 产品页面
  items.push({
    title: texts.products,
    content: texts.productsContent,
    url: `/${locale}/products`,
    type: 'product',
    locale,
  });

  // 洞察页面
  items.push({
    title: texts.insights,
    content: texts.insightsContent,
    url: `/${locale}/about/insights`,
    type: 'insight',
    locale,
  });

  // 支持页面
  items.push({
    title: texts.support,
    content: texts.supportContent,
    url: `/${locale}/support`,
    type: 'support',
    locale,
  });
  items.push({
    title: texts.contact,
    content: texts.contactContent,
    url: `/${locale}/support/customer-service`,
    type: 'support',
    locale,
  });
  items.push({
    title: texts.downloads,
    content: texts.downloadsContent,
    url: `/${locale}/support/download`,
    type: 'support',
    locale,
  });

  // 帮助中心
  items.push({
    title: texts.helpCenter,
    content: texts.helpCenterContent,
    url: `/${locale}/help`,
    type: 'help',
    locale,
  });

  // 隐私政策
  items.push({
    title: texts.privacy,
    content: texts.privacyContent,
    url: `/${locale}/privacy-policy`,
    type: 'support',
    locale,
  });

  return items;
}
