/**
 * Strapi navigations 转导航组件结构
 *
 * 后端约定（v5 扁平）：
 * - 根节点：children === null；子节点在 parent 数组（字段名 parent，语义为 children）
 * - 每项：name, url, sort, parent（子节点数组，或 id 数组需从列表解析）
 * - 顶栏仅根节点，下拉多列 = 根.parent（二级），每列项 = 二级.parent（三级）
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

type StrapiNavNode = Record<string, unknown>;

function bySort(a: StrapiNavNode, b: StrapiNavNode): number {
  return (Number(a.sort) ?? 0) - (Number(b.sort) ?? 0);
}

/** 将后端返回的路径（如 /products）转为带 locale 的前缀路径（如 /en/products），外链不处理 */
export function toHref(url: string | undefined, locale: string): string {
  if (!url || url.startsWith('http') || url.startsWith('//')) return url || '#';
  const path = url.startsWith('/') ? url : `/${url}`;
  if (path === '/' || path === '') return `/${locale}`;
  return `/${locale}${path}`;
}

/** parent 为子节点数组（对象或 id）；为 id 时用 list 解析 */
function getChildren(node: StrapiNavNode, list: StrapiNavNode[]): StrapiNavNode[] {
  const raw = node.parent;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const first = raw[0];
  if (first != null && typeof first === 'object' && !Array.isArray(first)) {
    return raw as StrapiNavNode[];
  }
  if (typeof first === 'number' || typeof first === 'string') {
    return raw
      .map((id) => list.find((n) => n.id === id || n.documentId === id))
      .filter((n): n is StrapiNavNode => n != null);
  }
  return [];
}

function toNavLink(node: StrapiNavNode, locale: string): NavLink | null {
  const label = typeof node.name === 'string' ? node.name : '';
  if (!label) return null;
  return { label, href: toHref(node.url as string, locale) };
}

export function transformNavigations(
  apiResponse: { data?: unknown[] } | null | undefined,
  locale: string
): NavItem[] {
  const list: StrapiNavNode[] = Array.isArray(apiResponse?.data) ? (apiResponse.data as StrapiNavNode[]) : [];
  const roots = list.filter((n) => n.children == null).sort(bySort);

  return roots.map((node) => {
    const label = typeof node.name === 'string' ? node.name : '';
    const href = toHref(node.url as string, locale);
    const childNodes = getChildren(node, list).sort(bySort);

    const columns: NavColumn[] = childNodes.map((colNode) => {
      const full = (colNode.id != null || colNode.documentId != null)
        ? list.find((n) => n.id === colNode.id || n.documentId === colNode.documentId) ?? colNode
        : colNode;
      const colChildren = getChildren(full, list).sort(bySort);
      const colHref = toHref((full.url ?? colNode.url) as string, locale);
      const items = colChildren.map((item) => toNavLink(item, locale)).filter((x): x is NavLink => x != null);
      const title = typeof full.name === 'string' ? full.name : (colNode.name as string) ?? '';
      return {
        title,
        href: colHref && colHref !== '#' ? colHref : undefined,
        items,
      };
    }).filter((c) => c.title || c.items.length > 0);

    const navItem: NavItem = { label, href };
    if (columns.length > 0) navItem.columns = columns;
    return navItem;
  });
}
