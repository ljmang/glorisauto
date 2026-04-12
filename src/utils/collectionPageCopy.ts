import type { Locale } from '@/i18n/config';
import type { CollectionPageCopyFields, SiteSeoAttributes } from '@/types/content';

type PageKey = 'products' | 'help' | 'insights';

export interface CollectionPageCopy {
  heading: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
}

const copyByLocale: Record<Locale, Record<PageKey, CollectionPageCopy>> = {
  en: {
    products: {
      heading: 'Automotive Refinishing Products',
      seoTitle: 'Automotive Refinishing Products | Abrasives, Fillers, Film & PPF',
      seoDescription:
        'Explore Gloris automotive refinishing products, including abrasives, body fillers, polishing compounds, window film, and paint protection film for distributors, body shops, and detailing businesses.',
      intro:
        'Browse the full Gloris portfolio for automotive repair, surface preparation, polishing, window tint, and paint protection. This collection is organized for distributors, body shops, and aftermarket partners that need consistent quality, practical technical support, and scalable supply.',
    },
    help: {
      heading: 'Help Center',
      seoTitle: 'Automotive Refinishing Help Center | FAQs & Application Guides',
      seoDescription:
        'Find practical answers on abrasive selection, putty sanding windows, polishing steps, window film performance, and PPF care with Gloris help articles and support guides.',
      intro:
        'Use this help center to compare products, troubleshoot finish problems, and move faster from selection to application. Browse by topic or jump in from the product that matches your workflow.',
    },
    insights: {
      heading: 'Insights',
      seoTitle: 'Automotive Refinish Insights | Tech Talk & Market Trends',
      seoDescription:
        'Read the latest Gloris insights on automotive refinishing technology, market trends, repair workflow optimization, window film, and paint protection solutions.',
      intro:
        'Insights brings together current articles on repair process improvement, material selection, market direction, and surface care trends. It is the content hub for distributors, body shops, and aftermarket operators who want practical context beyond product specs.',
    },
  },
  'zh-cn': {
    products: {
      heading: '汽车修补与表面护理产品',
      seoTitle: '汽车修补与表面护理产品 | 砂纸、原子灰、抛光、窗膜与 PPF',
      seoDescription:
        '查看 Gloris 汽车修补与表面护理产品，包括砂纸、原子灰、抛光材料、汽车窗膜和漆面保护膜，适合经销商、钣喷门店和汽车美容渠道。',
      intro:
        '这里汇总了 Gloris 面向汽车修补、表面处理、抛光护理、窗膜和漆面保护的产品线，方便经销商、钣喷门店和售后渠道快速筛选适合自己业务的解决方案。',
    },
    help: {
      heading: '帮助中心',
      seoTitle: '汽车修补帮助中心 | 选型问答、施工指南与常见问题',
      seoDescription:
        '在 Gloris 帮助中心查看砂纸选型、原子灰打磨窗口、抛光流程、窗膜性能和 PPF 养护等实用问答与操作建议。',
      intro:
        '帮助中心聚焦汽车修补和表面护理过程中的常见选型、施工与排障问题，帮助你更快找到合适产品、理解关键工艺，并把问题直接对应到具体应用场景。',
    },
    insights: {
      heading: '洞察',
      seoTitle: '汽车修补行业洞察 | 技术文章、趋势观察与应用指南',
      seoDescription:
        '阅读 Gloris 最新汽车修补行业洞察，涵盖材料技术、市场趋势、工艺优化、汽车窗膜和漆面保护等主题。',
      intro:
        '洞察栏目汇集汽车修补与表面护理相关的技术文章、市场趋势和应用方法，帮助经销商、门店和售后从业者在产品之外获得更完整的业务判断与工艺参考。',
    },
  },
};

export function getCollectionPageCopy(locale: Locale, key: PageKey): CollectionPageCopy {
  return copyByLocale[locale][key];
}

function mergeCopy(
  fallback: CollectionPageCopy,
  override?: CollectionPageCopyFields | null
): CollectionPageCopy {
  return {
    heading: override?.heading?.trim() || fallback.heading,
    seoTitle: override?.seoTitle?.trim() || fallback.seoTitle,
    seoDescription: override?.seoDescription?.trim() || fallback.seoDescription,
    intro: override?.intro?.trim() || fallback.intro,
  };
}

export function resolveCollectionPageCopy(
  locale: Locale,
  key: PageKey,
  siteSeo?: SiteSeoAttributes | null
): CollectionPageCopy {
  const fallback = getCollectionPageCopy(locale, key);

  if (!siteSeo) return fallback;

  const overrideMap: Record<PageKey, CollectionPageCopyFields | null | undefined> = {
    products: siteSeo.productsCollectionPage,
    help: siteSeo.helpCenterCollectionPage,
    insights: siteSeo.insightsCollectionPage,
  };

  return mergeCopy(fallback, overrideMap[key]);
}
