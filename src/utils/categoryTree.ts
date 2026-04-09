/**
 * 从 Strapi 扁平分类列表构建父子树（一级 / 二级）
 * 使用 parent 关系：parent 为空为一级，parent.id === 父级.id 为二级
 * 路由仍为 /products 与 /products/[slug]，不区分层级
 */

export interface CategoryWithRelation {
  id?: number;
  documentId?: string;
  name: string;
  slug: string;
  sort?: number;
  /** 父分类关系，null 表示一级分类 */
  parent?: {
    id?: number;
    slug?: string;
    name?: string;
  } | null;
}

export interface CategoryTreeNode {
  id?: number;
  documentId?: string;
  name: string;
  slug: string;
  sort: number;
  children: CategoryTreeNode[];
}

function getSort(c: CategoryWithRelation): number {
  return Number((c as { sort?: number }).sort) ?? 0;
}

/**
 * 将扁平分类列表转为树：只保留两级，roots 为一级（parent 为空），其 children 为二级（parent.id === root.id）
 */
export function buildCategoryTree(categories: CategoryWithRelation[]): CategoryTreeNode[] {
  const list = [...categories];
  const rootItems = list
    .filter((c) => !c.parent?.id)
    .sort((a, b) => getSort(a) - getSort(b));
  const roots: CategoryTreeNode[] = [];
  for (const c of rootItems) {
    const parentId = c.id;
    const children = list
      .filter((item) => item.parent?.id != null && item.parent.id === parentId)
      .sort((a, b) => getSort(a) - getSort(b))
      .map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        slug: item.slug,
        sort: getSort(item),
        children: [],
      }));
    roots.push({
      id: c.id,
      documentId: c.documentId,
      name: c.name,
      slug: c.slug,
      sort: getSort(c),
      children,
    });
  }
  return roots;
}
