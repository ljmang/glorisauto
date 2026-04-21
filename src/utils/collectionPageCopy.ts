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
  'ja': {
    products: {
      heading: '自動車補修・表面仕上げ製品',
      seoTitle: '自動車補修・表面仕上げ製品 | 研磨材・パテ・フィルム・PPF',
      seoDescription:
        'Gloris の自動車補修製品をご覧ください。研磨材、ボディパテ、コンパウンド、ウィンドウフィルム、ペイントプロテクションフィルムを取り揃え、販売店・板金塗装工場・ディテーリング事業を支援します。',
      intro:
        '自動車補修、下地処理、研磨、ウィンドウフィルム、塗装保護まで、Gloris の製品ラインを一覧できます。安定した品質、実践的な技術サポート、拡張しやすい供給体制を求める販売店・工場・アフターマーケット向けに構成しています。',
    },
    help: {
      heading: 'ヘルプセンター',
      seoTitle: '自動車補修ヘルプセンター | FAQ・施工ガイド',
      seoDescription:
        '研磨材の選定、パテ研磨の適正タイミング、ポリッシング工程、ウィンドウフィルム性能、PPF メンテナンスなどの実務情報を、Gloris のサポート記事で確認できます。',
      intro:
        '製品比較、仕上がり不良のトラブルシュート、選定から施工までの効率化に活用できます。トピック別でも、製品別でもすぐに必要な情報へアクセスできます。',
    },
    insights: {
      heading: 'インサイト',
      seoTitle: '自動車補修インサイト | 技術解説・市場トレンド',
      seoDescription:
        '自動車補修技術、市場動向、施工プロセス最適化、ウィンドウフィルム、ペイントプロテクションに関する Gloris の最新記事を掲載しています。',
      intro:
        '施工工程の改善、材料選定、市場の方向性、表面ケアのトレンドなど、現場と事業判断に役立つ情報をまとめています。製品スペックだけでは得られない実践的な視点を提供します。',
    },
  },
  'ar': {
    products: {
      heading: 'منتجات إصلاح وتشطيب السيارات',
      seoTitle: 'منتجات إصلاح وتشطيب السيارات | صنفرة ومعجون وأفلام وPPF',
      seoDescription:
        'استعرض منتجات Gloris لإصلاح وتشطيب السيارات، بما في ذلك المواد الكاشطة، معجون الهيكل، مركبات التلميع، أفلام النوافذ، وأفلام حماية الطلاء.',
      intro:
        'تصفح مجموعة Gloris الكاملة لأعمال إصلاح السيارات، تجهيز الأسطح، التلميع، أفلام النوافذ، وحماية الطلاء، بما يناسب الموزعين وورش السمكرة والدهان وخدمات العناية بالسيارات.',
    },
    help: {
      heading: 'مركز المساعدة',
      seoTitle: 'مركز مساعدة إصلاح السيارات | أسئلة شائعة وأدلة تطبيق',
      seoDescription:
        'اعثر على إجابات عملية حول اختيار مواد الصنفرة، توقيت صنفرة المعجون، خطوات التلميع، أداء أفلام النوافذ، وصيانة PPF.',
      intro:
        'استخدم مركز المساعدة لمقارنة المنتجات، تشخيص مشكلات التشطيب، وتسريع الانتقال من الاختيار إلى التطبيق العملي.',
    },
    insights: {
      heading: 'الرؤى',
      seoTitle: 'رؤى إصلاح السيارات | مقالات تقنية واتجاهات السوق',
      seoDescription:
        'اقرأ أحدث رؤى Gloris حول تقنيات إصلاح السيارات، اتجاهات السوق، تحسين سير العمل، أفلام النوافذ، وحلول حماية الطلاء.',
      intro:
        'يجمع قسم الرؤى مقالات عملية حول تحسين العمليات، اختيار المواد، اتجاهات السوق، والعناية بالأسطح لدعم قرارات الأعمال والتطبيق الميداني.',
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
