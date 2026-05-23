/**
 * Strapi navigation 数据转导航组件结构
 *
 * 当前仅支持 single type:
 * - data.items -> L1/L2/L3 组件树
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavColumn {
  title: string;
  href?: string;
  items: NavLink[];
}

export interface NavItem {
  label: string;
  href: string;
  columns?: NavColumn[];
}

type ComponentNavNode = {
  label?: string;
  linkType?: 'internal' | 'external' | 'none' | string;
  internalPath?: string;
  externalUrl?: string;
  url?: string;
  visible?: boolean;
  order?: number;
  children?: ComponentNavNode[];
};

const TEMPORARILY_HIDDEN_PATHS = new Set(['/top-brands']);

const ROOT_SEGMENT_ALIAS_MAP = new Map<string, string>([
  // canonical
  ['products', 'products'],
  ['support', 'support'],
  ['about', 'about'],
  ['help', 'help'],
  ['insights', 'insights'],
  ['download', 'download'],
  ['customer-service', 'customer-service'],
  ['brand-story', 'brand-story'],
  ['dealer', 'dealer'],
  ['top-brands', 'top-brands'],
  ['solutions', 'solutions'],
  // arabic aliases that may come from translated nav links
  ['منتجات', 'products'],
  ['يدعم', 'support'],
  ['دعم', 'support'],
  ['الدعم', 'support'],
  ['عن', 'about'],
  ['حول', 'about'],
  ['مساعدة', 'help'],
  ['المساعدة', 'help'],
  ['الرؤى', 'insights'],
  ['التنزيل', 'download'],
  ['تنزيل', 'download'],
  ['خدمة-العملاء', 'customer-service'],
  ['قصة-العلامة-التجارية', 'brand-story'],
  ['وكيل', 'dealer'],
  ['الوكلاء', 'dealer'],
  ['أهم-العلامات-التجارية', 'top-brands'],
  ['الحلول', 'solutions'],
]);

function normalizeRootSegment(segment: string): string {
  const decoded = decodeURIComponent(segment).trim();
  const lower = decoded.toLowerCase();
  return ROOT_SEGMENT_ALIAS_MAP.get(decoded) || ROOT_SEGMENT_ALIAS_MAP.get(lower) || decoded;
}

function canonicalizeKnownRoutePath(path: string): string {
  if (!path || path === '/') return path;
  const hasLeadingSlash = path.startsWith('/');
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  for (let i = 0; i < segments.length; i += 1) {
    segments[i] = normalizeRootSegment(segments[i]);
  }
  const joined = segments.join('/');
  return hasLeadingSlash ? `/${joined}` : joined;
}

function splitPathSuffix(url: string): { path: string; suffix: string } {
  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const suffixIndex =
    queryIndex === -1
      ? hashIndex
      : hashIndex === -1
        ? queryIndex
        : Math.min(queryIndex, hashIndex);

  if (suffixIndex === -1) {
    return { path: url, suffix: '' };
  }

  return {
    path: url.slice(0, suffixIndex),
    suffix: url.slice(suffixIndex),
  };
}

function withCanonicalTrailingSlash(path: string): string {
  if (!path || path === '/') return '/';

  const normalized = path.replace(/\/+$/, '');
  if (!normalized || normalized === '/') return '/';

  const lastSegment = normalized.split('/').pop() ?? '';
  if (lastSegment.includes('.')) return normalized;

  return `${normalized}/`;
}

function byOrder(a: ComponentNavNode, b: ComponentNavNode): number {
  const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
  const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
  return aOrder - bOrder;
}

function normalizeInternalPath(url: string | undefined): string {
  if (!url) return '';

  const cleaned = url.replace(/\u00a0/g, '').trim();
  if (
    cleaned === '' ||
    cleaned.startsWith('http') ||
    cleaned.startsWith('//') ||
    cleaned.startsWith('#')
  ) {
    return '';
  }

  const { path: rawPath } = splitPathSuffix(cleaned);
  let path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  path = path.replace(/^\/(en|zh-cn|zh|cn|ja|ar)(?=\/|$)/i, '');
  path = canonicalizeKnownRoutePath(path);
  path = path.replace(/\/+$/, '');
  return path || '/';
}

/** 将后端返回的路径（如 /products）转为带 locale 的规范路径（如 /en/products/），外链不处理 */
export function toHref(url: string | undefined, locale: string): string {
  if (!url) return '#';

  const cleaned = url.replace(/\u00a0/g, '').trim();
  if (cleaned.startsWith('http') || cleaned.startsWith('//') || cleaned.startsWith('#')) {
    return cleaned;
  }

  const { path: rawPath, suffix } = splitPathSuffix(cleaned);
  let path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  path = path.replace(/^\/(en|zh-cn|zh|cn|ja|ar)(?=\/|$)/i, '');
  path = canonicalizeKnownRoutePath(path);
  path = withCanonicalTrailingSlash(path);
  if (path === '') path = '/';

  if (path === '/' || path === '') return `/${locale}/${suffix}`;
  return `/${locale}${path}${suffix}`;
}

function resolveNodeHref(node: ComponentNavNode, locale: string, fallback: string = '#'): string {
  if (node.linkType === 'external') return toHref(node.externalUrl, locale);
  if (node.linkType === 'internal') return toHref(node.internalPath, locale);
  if (typeof node.url === 'string') return toHref(node.url, locale);
  return fallback;
}

function isVisibleNavNode(node: ComponentNavNode, locale: string): boolean {
  if (!node || node.visible === false || typeof node.label !== 'string' || node.label.trim() === '') {
    return false;
  }

  const normalizedPath = normalizeInternalPath(resolveNodeHref(node, locale, ''));
  return !TEMPORARILY_HIDDEN_PATHS.has(normalizedPath);
}

function toNavFromItems(items: ComponentNavNode[], locale: string): NavItem[] {
  const top = items
    .filter((n) => isVisibleNavNode(n, locale))
    .sort(byOrder);

  return top.map((l1) => {
    const l2Nodes = (Array.isArray(l1.children) ? l1.children : [])
      .filter((n) => isVisibleNavNode(n, locale))
      .sort(byOrder);

    const columns: NavColumn[] = l2Nodes.map((l2) => {
      const l3Nodes = (Array.isArray(l2.children) ? l2.children : [])
        .filter((n) => isVisibleNavNode(n, locale))
        .sort(byOrder);

      const links: NavLink[] = l3Nodes.map((l3) => ({
        label: String(l3.label),
        href: resolveNodeHref(l3, locale),
      }));

      const colHref = resolveNodeHref(l2, locale, '');
      return {
        title: String(l2.label),
        href: colHref && colHref !== '#' ? colHref : undefined,
        items: links,
      };
    }).filter((c) => Boolean(c.href) || c.items.length > 0);

    const navItem: NavItem = {
      label: String(l1.label),
      href: resolveNodeHref(l1, locale),
    };
    if (columns.length > 0) navItem.columns = columns;
    return navItem;
  });
}

export function transformNavigations(
  apiResponse: { data?: unknown } | null | undefined,
  locale: string
): NavItem[] {
  const rawData = apiResponse?.data;
  if (rawData && !Array.isArray(rawData) && typeof rawData === 'object') {
    const items = (rawData as { items?: unknown }).items;
    if (Array.isArray(items)) return toNavFromItems(items as ComponentNavNode[], locale);
  }
  return [];
}
