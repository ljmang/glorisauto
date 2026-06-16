// 搜索索引类型定义
import {
  api,
  fetchApi,
  fetchApiWithLocaleFallback,
} from './strapiApi';
import { sanitizeInlineText } from './contentSanitizers';
import { toHref } from './navigationData';
import type {
  CategoryAttributes,
  DownloadFileAttributes,
  HelpCategoryAttributes,
  HelpCenterAttributes,
  InsightAttributes,
  InsightCategoryAttributes,
  ProductAttributes,
} from '@/types/content';

export interface SearchItem {
  title: string;
  content: string;
  url: string;
  type: 'product' | 'insight' | 'help' | 'about' | 'support';
  locale: string;
  category?: string;
}

type SearchLocale = 'en' | 'zh-cn' | 'ja' | 'ar';

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
  ar: {
    aboutUs: 'من نحن',
    aboutUsContent: 'محتوى صفحة من نحن',
    brandStory: 'قصة العلامة',
    brandStoryContent: 'محتوى قصة العلامة',
    dealer: 'الوكلاء',
    dealerContent: 'محتوى صفحة الوكلاء',
    production: 'الإنتاج',
    productionContent: 'محتوى صفحة الإنتاج',
    products: 'المنتجات',
    productsContent: 'محتوى قائمة المنتجات',
    insights: 'الرؤى',
    insightsContent: 'محتوى قائمة المقالات',
    support: 'الدعم',
    supportContent: 'محتوى مركز الدعم',
    contact: 'اتصل بنا',
    contactContent: 'نموذج التواصل',
    downloads: 'التنزيلات',
    downloadsContent: 'محتوى قائمة التنزيلات',
    helpCenter: 'مركز المساعدة',
    helpCenterContent: 'محتوى فئات مركز المساعدة',
    privacy: 'سياسة الخصوصية',
    privacyContent: 'محتوى سياسة الخصوصية',
  },
};

function resolveSearchTexts(locale: string): SearchStaticText {
  if (locale === 'zh-cn' || locale === 'ja' || locale === 'ar') return SEARCH_TEXTS[locale];
  return SEARCH_TEXTS.en;
}

type ProductCategoryRelation = {
  slug?: string;
  name?: string;
};

type FileCategoryRelation = {
  slug?: string;
  name?: string;
};

type SearchIndexResponse<T> = {
  data?: T[];
};

const searchIndexCache = new Map<string, Promise<SearchItem[]>>();

function stripMarkdown(value?: string | null): string {
  if (!value) return '';

  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|[\]()-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildContent(parts: Array<string | null | undefined>, maxLength = 260): string {
  const text = parts
    .map((part) => sanitizeInlineText(stripMarkdown(part)))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function getRelationSlugName(value: unknown): ProductCategoryRelation {
  if (!value || typeof value !== 'object') return {};
  const record = value as Record<string, unknown>;
  return {
    slug: typeof record.slug === 'string' ? record.slug : undefined,
    name: typeof record.name === 'string' ? record.name : undefined,
  };
}

function addSearchItem(items: SearchItem[], item: SearchItem): void {
  const title = sanitizeInlineText(item.title);
  if (!title || !item.url || item.url === '#') return;

  items.push({
    ...item,
    title,
    content: sanitizeInlineText(item.content) || title,
  });
}

async function safeFetch<T>(
  label: string,
  request: Promise<SearchIndexResponse<T>>
): Promise<T[]> {
  try {
    const result = await request;
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.warn(`[searchIndex] Failed to load ${label}`, error);
    return [];
  }
}

async function buildSearchIndex(locale: string): Promise<SearchItem[]> {
  const items: SearchItem[] = [];
  const texts = resolveSearchTexts(locale);

  // 关于我们页面
  addSearchItem(items, {
    title: texts.aboutUs,
    content: texts.aboutUsContent,
    url: toHref('/about', locale),
    type: 'about',
    locale,
  });
  addSearchItem(items, {
    title: texts.brandStory,
    content: texts.brandStoryContent,
    url: toHref('/about/brand-story', locale),
    type: 'about',
    locale,
  });
  addSearchItem(items, {
    title: texts.dealer,
    content: texts.dealerContent,
    url: toHref('/about/dealer', locale),
    type: 'about',
    locale,
  });
  addSearchItem(items, {
    title: texts.production,
    content: texts.productionContent,
    url: toHref('/about/insights/news/our-factory', locale),
    type: 'about',
    locale,
  });

  // 产品页面
  addSearchItem(items, {
    title: texts.products,
    content: texts.productsContent,
    url: toHref('/products', locale),
    type: 'product',
    locale,
  });

  // 洞察页面
  addSearchItem(items, {
    title: texts.insights,
    content: texts.insightsContent,
    url: toHref('/about/insights', locale),
    type: 'insight',
    locale,
  });

  // 支持页面
  addSearchItem(items, {
    title: texts.support,
    content: texts.supportContent,
    url: toHref('/support', locale),
    type: 'support',
    locale,
  });
  addSearchItem(items, {
    title: texts.contact,
    content: texts.contactContent,
    url: toHref('/support/customer-service', locale),
    type: 'support',
    locale,
  });
  addSearchItem(items, {
    title: texts.downloads,
    content: texts.downloadsContent,
    url: toHref('/support/download', locale),
    type: 'support',
    locale,
  });

  // 帮助中心
  addSearchItem(items, {
    title: texts.helpCenter,
    content: texts.helpCenterContent,
    url: toHref('/help', locale),
    type: 'help',
    locale,
  });

  // 隐私政策
  addSearchItem(items, {
    title: texts.privacy,
    content: texts.privacyContent,
    url: toHref('/privacy-policy', locale),
    type: 'support',
    locale,
  });

  const [
    categories,
    products,
    insightCategories,
    insights,
    helpCategories,
    helpArticles,
    fileCategories,
    downloadFiles,
  ] = await Promise.all([
    safeFetch<CategoryAttributes>('product categories', fetchApi<SearchIndexResponse<CategoryAttributes>>(api.categories, {
      locale,
      populate: { parent: true },
      pagination: { pageSize: 200 },
    })),
    safeFetch<ProductAttributes>('products', fetchApi<SearchIndexResponse<ProductAttributes>>(api.products, {
      locale,
      populate: { category: true },
      pagination: { pageSize: 500 },
    })),
    safeFetch<InsightCategoryAttributes>('insight categories', fetchApiWithLocaleFallback<SearchIndexResponse<InsightCategoryAttributes>>(api.insightCategories, {
      locale,
      pagination: { pageSize: 100 },
    })),
    safeFetch<InsightAttributes>('insights', fetchApiWithLocaleFallback<SearchIndexResponse<InsightAttributes>>(api.insights, {
      locale,
      populate: { insight_category: true },
      pagination: { pageSize: 500 },
    })),
    safeFetch<HelpCategoryAttributes>('help categories', fetchApi<SearchIndexResponse<HelpCategoryAttributes>>(api.helpCategories, {
      locale,
      pagination: { pageSize: 100 },
    })),
    safeFetch<HelpCenterAttributes>('help articles', fetchApi<SearchIndexResponse<HelpCenterAttributes>>(api.helpCenters, {
      locale,
      populate: { help_category: true },
      pagination: { pageSize: 500 },
    })),
    safeFetch<FileCategoryRelation>('file categories', fetchApi<SearchIndexResponse<FileCategoryRelation>>(api.fileCategories, {
      locale,
      pagination: { pageSize: 100 },
    })),
    safeFetch<DownloadFileAttributes & { flieCategory?: FileCategoryRelation }>('download files', fetchApi<SearchIndexResponse<DownloadFileAttributes & { flieCategory?: FileCategoryRelation }>>(api.downloadFiles, {
      locale,
      populate: { flieCategory: true },
      pagination: { pageSize: 300 },
    })),
  ]);

  for (const category of categories) {
    if (!category.slug) continue;
    addSearchItem(items, {
      title: category.name,
      content: buildContent([category.description, texts.products]),
      url: toHref(`/products/${category.slug}`, locale),
      type: 'product',
      locale,
      category: texts.products,
    });
  }

  for (const product of products) {
    const category = getRelationSlugName(product.category);
    const url = category.slug && product.slug
      ? toHref(`/products/${category.slug}/${product.slug}`, locale)
      : toHref(`/products/${product.slug}`, locale);

    addSearchItem(items, {
      title: product.name,
      content: buildContent([
        product.shortDescription,
        product.description,
        product.productFeatures,
        category.name,
      ]),
      url,
      type: 'product',
      locale,
      category: category.name,
    });
  }

  for (const category of insightCategories) {
    if (!category.slug) continue;
    addSearchItem(items, {
      title: category.name,
      content: buildContent([category.description, texts.insights]),
      url: toHref(`/about/insights/${category.slug}`, locale),
      type: 'insight',
      locale,
      category: texts.insights,
    });
  }

  for (const insight of insights) {
    const category = getRelationSlugName(insight.insight_category);
    if (!insight.slug || !category.slug) continue;

    addSearchItem(items, {
      title: insight.title,
      content: buildContent([
        insight.excerpt,
        insight.description,
        insight.content,
        category.name,
      ]),
      url: toHref(`/about/insights/${category.slug}/${insight.slug}`, locale),
      type: 'insight',
      locale,
      category: category.name,
    });
  }

  for (const category of helpCategories) {
    if (!category.slug) continue;
    addSearchItem(items, {
      title: category.name,
      content: buildContent([category.description, category.descrition, texts.helpCenter]),
      url: toHref(`/help/${category.slug}`, locale),
      type: 'help',
      locale,
      category: texts.helpCenter,
    });
  }

  for (const article of helpArticles) {
    const category = getRelationSlugName(article.help_category);
    if (!article.slug || !category.slug) continue;

    addSearchItem(items, {
      title: article.title,
      content: buildContent([
        article.description,
        article.contentMarkdown,
        category.name,
      ]),
      url: toHref(`/help/${category.slug}/${article.slug}`, locale),
      type: 'help',
      locale,
      category: category.name,
    });
  }

  for (const category of fileCategories) {
    if (!category.slug) continue;
    addSearchItem(items, {
      title: category.name ?? category.slug,
      content: texts.downloadsContent,
      url: toHref(`/support/download/${category.slug}`, locale),
      type: 'support',
      locale,
      category: texts.downloads,
    });
  }

  for (const file of downloadFiles) {
    const category = getRelationSlugName((file as { flieCategory?: unknown }).flieCategory);
    addSearchItem(items, {
      title: file.title,
      content: buildContent([file.description, category.name, texts.downloads]),
      url: category.slug ? toHref(`/support/download/${category.slug}`, locale) : toHref('/support/download', locale),
      type: 'support',
      locale,
      category: category.name || texts.downloads,
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.locale}:${item.type}:${item.url}:${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 生成搜索索引
export async function generateSearchIndex(locale: string): Promise<SearchItem[]> {
  if (!searchIndexCache.has(locale)) {
    searchIndexCache.set(locale, buildSearchIndex(locale));
  }

  return searchIndexCache.get(locale)!;
}
