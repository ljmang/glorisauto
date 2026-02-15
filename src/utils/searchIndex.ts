// 搜索索引类型定义
export interface SearchItem {
  title: string;
  content: string;
  url: string;
  type: 'product' | 'insight' | 'help' | 'about' | 'support';
  locale: string;
  category?: string;
}

// 生成搜索索引
export async function generateSearchIndex(locale: string): Promise<SearchItem[]> {
  const items: SearchItem[] = [];

  // 关于我们页面
  items.push({
    title: locale === 'zh-cn' ? '关于我们' : 'About Us',
    content: locale === 'zh-cn' ? '关于我们内容' : 'About Us content',
    url: `/${locale}/about`,
    type: 'about',
    locale,
  });
  items.push({
    title: locale === 'zh-cn' ? '品牌故事' : 'Brand Story',
    content: locale === 'zh-cn' ? '品牌故事内容' : 'Brand Story content',
    url: `/${locale}/about/brand`,
    type: 'about',
    locale,
  });
  items.push({
    title: locale === 'zh-cn' ? '经销商' : 'Dealer',
    content: locale === 'zh-cn' ? '经销商内容' : 'Dealer content',
    url: `/${locale}/about/dealer`,
    type: 'about',
    locale,
  });
  items.push({
    title: locale === 'zh-cn' ? '生产制造' : 'Production',
    content: locale === 'zh-cn' ? '生产制造内容' : 'Production content',
    url: `/${locale}/about/production`,
    type: 'about',
    locale,
  });

  // 产品页面
  items.push({
    title: locale === 'zh-cn' ? '产品' : 'Products',
    content: locale === 'zh-cn' ? '产品列表内容' : 'Products list content',
    url: `/${locale}/products`,
    type: 'product',
    locale,
  });

  // 洞察页面
  items.push({
    title: locale === 'zh-cn' ? '洞察' : 'Insights',
    content: locale === 'zh-cn' ? '洞察文章列表内容' : 'Insights articles list content',
    url: `/${locale}/insights`,
    type: 'insight',
    locale,
  });

  // 支持页面
  items.push({
    title: locale === 'zh-cn' ? '支持' : 'Support',
    content: locale === 'zh-cn' ? '支持中心内容' : 'Support center content',
    url: `/${locale}/support`,
    type: 'support',
    locale,
  });
  items.push({
    title: locale === 'zh-cn' ? '联系我们' : 'Contact Us',
    content: locale === 'zh-cn' ? '联系我们表单' : 'Contact Us form',
    url: `/${locale}/support/contact`,
    type: 'support',
    locale,
  });
  items.push({
    title: locale === 'zh-cn' ? '下载中心' : 'Downloads',
    content: locale === 'zh-cn' ? '下载文件列表内容' : 'Downloads files list content',
    url: `/${locale}/support/downloads`,
    type: 'support',
    locale,
  });

  // 帮助中心
  items.push({
    title: locale === 'zh-cn' ? '帮助中心' : 'Help Center',
    content: locale === 'zh-cn' ? '帮助中心分类列表' : 'Help Center categories list',
    url: `/${locale}/help`,
    type: 'help',
    locale,
  });

  // 隐私政策
  items.push({
    title: locale === 'zh-cn' ? '隐私政策' : 'Privacy Policy',
    content: locale === 'zh-cn' ? '隐私政策内容' : 'Privacy Policy content',
    url: `/${locale}/privacy-policy`,
    type: 'support',
    locale,
  });

  return items;
}
