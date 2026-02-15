# 前端 Astro 对接 Strapi 后端思路

## 一、后端数据概况（/srv/glorisauto.com/admin）

### 1. 后端服务信息
- **管理后台地址**: `https://admin.glorisauto.com`（Strapi Admin）
- **API 根地址**: `https://admin.glorisauto.com/api`
- **静态资源（R2）**: `https://assets.glorisauto.com`（媒体文件如 logo、上传图片）
- **运行**: PM2 进程 `glorisauto`，端口 1337，经 Nginx 反向代理

### 2. 内容类型一览（Content Types）

| 类型 | 说明 | API 路径 | 单/集合 | 多语言 |
|------|------|-----------|---------|--------|
| **home** | 首页（Hero、关于、产品/洞察/下载等区块） | `/api/home` | 单类型 | ✅ |
| **about-us** | 关于我们 | `/api/about-uses` | 单类型 | - |
| **brand-story** | 品牌故事 | `/api/brand-stories` | 单类型 | - |
| **become-dealer** | 成为经销商 | `/api/become-dealers` | 单类型 | - |
| **contact-us** | 联系我们 | `/api/contact-uses` | 单类型 | - |
| **category** | 产品分类（树形 parent/children） | `/api/categories` | 集合 | ✅ |
| **product** | 产品（含 media、组件、关联下载） | `/api/products` | 集合 | ✅ |
| **top-brand** | Top Brand | `/api/top-brands` | 集合 | ✅ |
| **insight** | 洞察/文章 | `/api/insights` | 集合 | ✅ |
| **insight-category** | 洞察分类 | `/api/insight-categories` | 集合 | ✅ |
| **help-center** | 帮助中心文章 | `/api/help-centers` | 集合 | ✅ |
| **help-category** | 帮助分类 | `/api/help-categories` | 集合 | ✅ |
| **download-file** | 下载文件 | `/api/download-files` | 集合 | - |
| **flie-category** | 文件分类 | `/api/flie-categories` | 集合 | - |
| **training** | 培训 | `/api/trainings` | 集合 | - |
| **production-base** | 生产基地 | `/api/production-bases` | 集合 | - |
| **navigation** | 导航 | `/api/navigations` | 集合 | - |

说明：Strapi 集合类型复数化后路径如 `product` → `products`，单类型如 `home` 直接 `/api/home`。

### 3. 关键结构摘要
- **home**：单类型，含 hero、aboutGloris、glorisNews、products、insights、downloadFiles 等；多语言；有 relation 到 insight、product、download-file。
- **product**：多语言；media、组件（list-item/list-info/list-options）、关联 downloadFiles。
- **category**：多语言；树形结构（parent/children）。
- **top-brand**：多语言；当前 schema 仅有 `title`（可按需扩展）。
- **i18n**：多数内容启用 `pluginOptions.i18n.localized: true`，接口需带 `locale` 参数或 `Accept-Language` 等（以 Strapi i18n 插件约定为准）。

---

## 二、前端如何连接后端：整体思路

### 1. 确定 API 基地址与权限
- 前端请求统一指向：**`https://admin.glorisauto.com/api`**。
- 若 Strapi 里已对「公开 API」勾选 find/findOne，则**无需 token** 即可读；否则需在后台创建 API Token，请求头带 `Authorization: Bearer <token>`。
- 建议：在 Astro 中通过**环境变量**配置 API 基地址（开发/生产可不同），例如 `PUBLIC_STRAPI_URL=https://admin.glorisauto.com`，前端请求用 `import.meta.env.PUBLIC_STRAPI_URL + '/api'`。

### 2. 请求方式与多语言
- 使用 **REST API**（Strapi 默认）：  
  - 单类型：`GET /api/home?locale=en`  
  - 集合：`GET /api/products?locale=en`、`GET /api/products/:id?locale=en`  
- 多语言：在查询上加 `locale=en` 或 `locale=zh-cn`，与前端 `[locale]` 路由一致。
- 需要关联数据时使用 **populate**：  
  `GET /api/home?locale=en&populate[glorisNews]=*&populate[products]=*`  
  按需 populate 深层次：`populate[products][populate][images]=*`。

### 3. 前端分层建议
1. **环境变量**  
   - `PUBLIC_STRAPI_URL=https://admin.glorisauto.com`（或带协议与域名的完整 base，前端拼 `/api`）。
2. **统一请求封装**（如 `src/utils/strapi.ts` 或 `src/lib/strapi.ts`）  
   - `getStrapiUrl()`：返回 API base（`${PUBLIC_STRAPI_URL}/api`）。  
   - `fetchApi<T>(path, locale?, options?)`：封装 `fetch`，自动加 `locale`、populate、headers（若以后加 token 可在此加 Authorization）。  
   - 媒体 URL：Strapi 返回的 media 可能是相对路径，需拼上 R2 域名（如 `https://assets.glorisauto.com`）或使用 Strapi 的 `url` 字段（若已配置好）。
3. **页面/组件侧**  
   - 在 **Astro 的 getStaticPaths + 页面顶层** 或 **Layout** 里用 `fetchApi` 拉取数据，再传给组件。  
   - 静态构建：`getStaticPaths` 里枚举 locale（和 slug 等），每个路径在服务端请求 Strapi，生成静态页。  
   - 若将来需要“纯客户端拉取”，可在 Svelte 组件里用 `onMount` + `fetchApi`（注意 CORS 与 Strapi 的 public 权限）。

### 4. 与现有前端的对应关系（建议）
- **首页** `[locale]/index.astro` → 请求 `GET /api/home?locale=...`，用 home 的 hero、about、products、insights、downloadFiles 等渲染。
- **产品** `[locale]/products/`、`[category]/`、`[...slug]` → `GET /api/categories`、`/api/products`，getStaticPaths 从 Strapi 取 categories + products 生成路径；详情页用 `GET /api/products/:id?locale=...&populate=*`。
- **洞察** `[locale]/insights/`、`[slug]` → `GET /api/insights`、`/api/insights?filters[slug]=...`（若用 slug 查），getStaticPaths 用 insights 列表生成。
- **帮助中心** `[locale]/help/`、`[category]/`、`[...slug]` → `GET /api/help-categories`、`/api/help-centers`，同上思路用接口数据生成路径和内容。
- **Top Brands** `[locale]/top-brands/[slug]` → `GET /api/top-brands`，getStaticPaths 用列表生成；详情 `GET /api/top-brands/:id?locale=...`。
- **关于我们、品牌故事、经销商、联系我们等** → 对应 about-us、brand-story、become-dealer、contact-us 单类型接口，按需 populate。
- **搜索索引**：当前 `searchIndex.ts` 为本地硬编码；可改为在服务端用 Strapi 的 products、insights、help-centers 等接口汇总生成 SearchItem[]，再传给 SearchBox/SearchResults，实现“数据来自后端”。

### 5. 媒体与 R2
- 接口里 media 的 `url` 若为相对路径，前端应拼上 `https://assets.glorisauto.com`（或从环境变量读）；若 Strapi 已配置 R2 并返回完整 URL，则直接使用。
- 当前 Footer/Header 已使用 `https://assets.glorisauto.com/uploads/...`，说明 R2 域名已知，统一用同一 base 即可。

### 6. 媒体数据如何获取与使用

1. **请求时带上 populate**  
   媒体通常作为关联字段（如首页 hero 图、产品的 cover），需要在请求时 populate 才会返回：
   - 单层：`fetchApi(api.home, { locale, populate: { heroImage: '*' } })`
   - 多字段/深层次：`populate: { heroImage: '*', products: { populate: ['cover'] } }` 或按需 `populate: 'deep'`

2. **从响应里取 URL**  
   Strapi 返回的媒体可能是 `{ data: { attributes: { url: '/uploads/...' } } }` 或直接 `{ url: '...' }`。  
   - 只拿到**字符串 url** 时：用 `getMediaUrl(url)`（来自 `strapiApi`），会把相对路径拼上 R2 域名。  
   - 拿到**整块 media 对象**时：用 `getMediaUrlFromField(media)`（来自 `strapiApi`），内部会解析 `data.attributes.url` / `attributes.url` / `url` 再交给 `getMediaUrl`。

3. **示例（首页带 hero 图）**
   ```ts
   import { fetchApi, api, getMediaUrlFromField } from '@/utils/strapiApi';

   const res = await fetchApi(api.home, {
     locale: 'en',
     populate: { heroImage: '*' },  // 或 populate: 'deep' 拉全量
   });
   const hero = res?.data?.attributes?.heroImage;  // 以 Strapi 实际结构为准
   const heroSrc = getMediaUrlFromField(hero);
   // <img src={heroSrc} alt="..." />
   ```

### 7. 实施顺序建议
1. 在 Astro 中加 `PUBLIC_STRAPI_URL`，并实现 `src/utils/strapi.ts`（getStrapiUrl、fetchApi、mediaUrl）。  
2. 选一个简单页做试点（例如首页或 top-brands 列表），用 fetchApi 拉数据并渲染。  
3. 确认 Strapi 后台该 API 的权限为“允许公开 find”；若需 token，在服务端用环境变量存 token，在 fetchApi 里加 header。  
4. 再按页面逐步把 getStaticPaths 和页面数据源改为 Strapi（products、insights、help、categories、home 等）。  
5. 最后把搜索索引改为基于 Strapi 数据生成，并统一媒体 URL 处理。

---

## 三、Strapi 权限说明（需在后台确认）
- 路径：Strapi Admin → Settings → Users & Permissions → Roles → **Public**。  
- 对需要在前端公开读取的 API（如 home、products、categories、insights、help-centers、top-brands 等）勾选 **find**、**findOne**。  
- 若不允许匿名访问，则需创建 API Token，并在前端请求头中携带（建议仅服务端使用，不要写进前端 bundle）。

以上为后端数据情况与前端对接思路，可按此顺序在 Astro 中实现连接与逐步迁移。

---

## 四、已实现的步骤（仅测试数据获取）

1. **环境变量**  
   - `.env` / `.env.example` 中已配置 `PUBLIC_STRAPI_URL=https://admin.glorisauto.com`。

2. **请求工具**  
   - `src/utils/strapi.ts`：`getStrapiUrl()`、`fetchApi(path, options)`、`getMediaUrl(url)`，供页面/构建时调用。

3. **数据获取测试**  
   - 运行：`npm run test:strapi`  
   - 脚本会请求：`home`、`top-brands`、`products`、`categories`、`insights`、`help-centers`（均为 `locale=en`），并打印成功/失败与条数。  
   - 若某接口返回 403，需在 Strapi 后台 **Settings → Users & Permissions → Roles → Public** 中为该 API 勾选 **find**（及需要的 **findOne**）。
