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

  let path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  path = path.replace(/^\/(en|zh-cn|zh|cn|ja)(?=\/|$)/i, '');
  path = path.replace(/\/+$/, '');
  return path || '/';
}

/** 将后端返回的路径（如 /products）转为带 locale 的前缀路径（如 /en/products），外链不处理 */
export function toHref(url: string | undefined, locale: string): string {
  if (!url) return '#';

  const cleaned = url.replace(/\u00a0/g, '').trim();
  if (cleaned.startsWith('http') || cleaned.startsWith('//') || cleaned.startsWith('#')) {
    return cleaned;
  }

  let path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;

  path = path.replace(/^\/(en|zh-cn|zh|cn|ja)(?=\/|$)/i, '');
  if (path === '') path = '/';

  if (path === '/' || path === '') return `/${locale}`;
  return `/${locale}${path}`;
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
