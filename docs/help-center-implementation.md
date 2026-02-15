# 帮助中心（Help Center）实现方案

## 一、后端数据结构分析

### 1. Help Category（帮助分类）
**Schema**: `admin/src/api/help-category/content-types/help-category/schema.json`

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string (i18n) | 分类名称，如 "Product Support" |
| `slug` | string (i18n) | URL 标识，如 "product-support" |
| `sort` | integer (i18n) | 排序值 |
| `description` | string (i18n) | 分类描述（注意：schema 中拼写为 `descrition`） |

**API 路径**: `/api/help-categories`

---

### 2. Help Center（帮助文章）
**Schema**: `admin/src/api/help-center/content-types/help-center/schema.json`

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string (i18n) | 文章标题（FAQ 问题） |
| `slug` | string (i18n) | URL 标识 |
| `description` | string (i18n) | 简短描述 |
| `content` | blocks (i18n) | 文章正文（Blocks 格式） |
| `sort` | integer (i18n) | 排序值 |
| `recommend` | boolean (i18n) | 是否推荐 |
| `help_category` | relation (oneToOne) | 关联的分类 |
| `products` | relation (oneToMany) | 关联的产品 |
| `articles` | relation (oneToMany) | 关联的 insights |

**API 路径**: `/api/help-centers`

**关系**：
- 每个 help-center 属于一个 `help_category`（oneToOne）
- 路径结构：`/support/help/{categorySlug}/{helpCenterSlug}`

---

## 二、页面路由结构

```
/support/help/                    → 首页（所有分类 + 所有文章）
/support/help/[category]/         → 分类页（该分类下的文章列表）
/support/help/[category]/[...slug] → 文章详情页（已有实现）
```

---

## 三、实现思路

### 3.1 首页 (`support/help/index.astro`)

#### 数据获取
```typescript
// 1. 获取所有分类（按 sort 排序）
const categoriesRes = await fetchApi<{ data: HelpCategoryAttributes[] }>(
  api.helpCategories,
  { locale, populate: true }
);
const categories = (categoriesRes?.data ?? []).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

// 2. 获取所有文章（populate help_category）
const articlesRes = await fetchApi<{ data: HelpCenterAttributes[] }>(
  api.helpCenters,
  {
    locale,
    populate: { help_category: true },
    // 可选：按 sort 排序，或按 recommend 优先
  }
);
const articles = articlesRes?.data ?? [];
```

#### 页面结构（参考图片）
1. **面包屑**: `Home > Support > Help center`
2. **标题**: "Help center"
3. **搜索框**: 帮助中心专用搜索（可先做 UI，搜索功能后续实现）
4. **分类标签**:
   - "All"（默认选中，显示所有文章）
   - 各分类按钮（点击跳转到 `/support/help/{categorySlug}`）
5. **FAQ 列表**:
   - 按分类分组显示
   - 每个分类一个区块，标题为分类名
   - 该分类下的文章以链接列表展示（`title` → `/support/help/{categorySlug}/{articleSlug}`）
   - 文章按 `sort` 排序

#### 数据分组逻辑
```typescript
// 按分类分组文章
const articlesByCategory = new Map<string, HelpCenterAttributes[]>();
articles.forEach(article => {
  const categorySlug = article.help_category?.slug ?? 'uncategorized';
  if (!articlesByCategory.has(categorySlug)) {
    articlesByCategory.set(categorySlug, []);
  }
  articlesByCategory.get(categorySlug)!.push(article);
});

// 每个分类内的文章按 sort 排序
articlesByCategory.forEach((items, slug) => {
  items.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
});
```

#### UI 组件建议
- 复用 `Breadcrumb` 组件
- 搜索框：可复用 `SearchBox.svelte` 或新建简单搜索框
- 分类标签：使用 Tailwind 的 tab/button 样式，当前分类高亮
- FAQ 列表：每个分类区块用 `<section>`，标题 `<h2>`，文章列表用 `<ul>` + `<li>` + `<a>`

---

### 3.2 分类页 (`support/help/[category]/index.astro`)

#### getStaticPaths
```typescript
export async function getStaticPaths() {
  const categoriesRes = await fetchApi<{ data: HelpCategoryAttributes[] }>(
    api.helpCategories,
    { locale: defaultLocale } // 用默认语言获取所有分类 slug
  );
  const categories = categoriesRes?.data ?? [];
  
  return supportedLocales.flatMap((locale) =>
    categories.map((cat) => ({
      params: { locale, category: cat.slug },
    }))
  );
}
```

#### 数据获取
```typescript
const { category: categorySlug } = Astro.params;

// 1. 获取当前分类信息
const categoryRes = await fetchApi<{ data: HelpCategoryAttributes[] }>(
  api.helpCategories,
  {
    locale,
    filters: { slug: { $eq: categorySlug } },
  }
);
const currentCategory = categoryRes?.data?.[0];

// 2. 获取该分类下的所有文章
const articlesRes = await fetchApi<{ data: HelpCenterAttributes[] }>(
  api.helpCenters,
  {
    locale,
    populate: { help_category: true },
    filters: { help_category: { slug: { $eq: categorySlug } } },
  }
);
const articles = (articlesRes?.data ?? []).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
```

#### 页面结构
1. **面包屑**: `Home > Support > Help center > {categoryName}`
2. **标题**: 分类名称（`currentCategory.name`）
3. **搜索框**: 同首页（可选）
4. **分类标签**: 同首页，但当前分类高亮
5. **文章列表**: 
   - 仅显示当前分类的文章
   - 列表项：标题 + 描述（如有）+ 链接到详情页

---

### 3.3 类型定义（需添加到 `types/content.ts`）

```typescript
/** Help Category 帮助分类类型 */
export interface HelpCategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}

export type HelpCategoryContent = StrapiContent<HelpCategoryAttributes>;

/** Help Center 帮助文章类型 */
export interface HelpCenterAttributes {
  title: string;
  slug: string;
  description?: string;
  content?: BlockNode[];
  sort?: number;
  recommend?: boolean;
  help_category?: HelpCategoryAttributes | null;
}

export type HelpCenterContent = StrapiContent<HelpCenterAttributes>;
```

并在 `types/index.ts` 中导出。

---

## 四、实现步骤

1. **类型定义**
   - 在 `types/content.ts` 添加 `HelpCategoryAttributes`、`HelpCenterAttributes`
   - 在 `types/index.ts` 导出

2. **首页实现** (`support/help/index.astro`)
   - 请求分类和文章数据
   - 实现分类标签（All + 各分类）
   - 实现按分类分组的 FAQ 列表
   - 添加搜索框 UI（搜索功能可后续实现）

3. **分类页实现** (`support/help/[category]/index.astro`)
   - 实现 `getStaticPaths`（基于分类 slug）
   - 请求当前分类和该分类下的文章
   - 复用首页的分类标签组件（当前分类高亮）
   - 显示文章列表

4. **组件复用**
   - 分类标签可抽取为独立组件（如 `HelpCategoryTabs.astro`）
   - 搜索框可复用或新建

---

## 五、注意事项

1. **i18n 处理**：
   - 所有 API 请求需传入 `locale`
   - 分类和文章的 `name`/`title` 等字段已支持 i18n

2. **排序**：
   - 分类按 `sort` 排序
   - 文章按 `sort` 排序（同分类内）

3. **空状态**：
   - 无分类时显示空状态
   - 某分类无文章时，首页该分类区块不显示或显示提示

4. **链接生成**：
   - 使用 `toHref()` 生成带 locale 的链接
   - 文章链接：`/support/help/{categorySlug}/{articleSlug}`

5. **SEO**：
   - 首页 title：`Help center`
   - 分类页 title：`{categoryName} - Help center`
   - 可考虑使用分类/文章的 `seo` 组件字段

---

## 六、参考现有实现

- **下载模块** (`support/download/index.astro`): 分类侧栏 + 文件列表的布局可参考
- **产品详情页** (`products/[category]/[...slug].astro`): 已使用 helpCenter，可参考数据结构和链接生成
- **Support 首页** (`support/index.astro`): 卡片布局和 API 请求方式可参考
