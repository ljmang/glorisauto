# GLORISAUTO Frontend

GLORISAUTO 官网前端，基于 Astro 5、Svelte 5 和 Tailwind CSS 4 构建。

这个项目支持两种运行方式：

- 默认本地开发 / SSR 预览
- 通过 `BUILD_TARGET=pages` 构建为 Cloudflare Pages 静态站

## 常用命令

在项目目录执行：

```bash
cd /Users/matthew/Downloads/00.CODE/glasuritauto.com/glorisauto
```

安装依赖：

```bash
npm install
```

本地开发：

```bash
npm run dev
```

SSR 构建与预览：

```bash
npm run build
npm run preview
```

Cloudflare Pages 静态构建：

```bash
npm run build:pages
```

本地模拟 Cloudflare Pages：

```bash
npm run preview:pages
```

## Wrangler 直接部署

项目已经内置 `wrangler.toml`，可以不依赖 GitHub 自动构建，直接用 Wrangler 把当前本地产物发布到 Cloudflare Pages。

生产部署：

```bash
npm run deploy:pages
```

预览部署：

```bash
npm run deploy:pages:preview
```

这两个命令都会先执行：

```bash
npm run build:pages
```

然后把 `dist/` 发布到 Cloudflare Pages 项目：`glorisauto`。

### 等价的手动命令

生产：

```bash
npm run build:pages
npx wrangler pages deploy dist --project-name glorisauto --branch master --commit-dirty=true
```

预览：

```bash
npm run build:pages
npx wrangler pages deploy dist --project-name glorisauto --branch preview --commit-dirty=true
```

## 为什么建议用 Wrangler 直发

对这个项目来说，Wrangler 直发有几个实际好处：

- 可以确保你本地刚刚构建出的 `dist/` 被原样部署
- 更容易排查“线上 HTML 更新了，但 `_astro` 静态资源不完整”这类问题
- 不必等 GitHub webhook 和 Pages 后台队列
- 对内容驱动站点更可控，尤其适合需要快速同步 Strapi 新内容时使用

## 环境变量

本地示例文件：

```bash
.env.example
```

本地实际文件：

```bash
.env
```

Cloudflare Pages / Wrangler 相关变量见：

- [wrangler.toml](/Users/matthew/Downloads/00.CODE/glasuritauto.com/glorisauto/wrangler.toml)

当前生产构建依赖的公开变量包括：

- `PUBLIC_STRAPI_URL`
- `STRAPI_BUILD_URL`
- `STRAPI_FETCH_RETRIES`

如果后续把构建完全切到 Cloudflare 侧，记得保证这些变量在 Cloudflare 项目里也同步配置。

## 备注

- 这个项目会根据 `BUILD_TARGET=pages` 或 `CF_PAGES` 自动切换到静态输出模式
- 远程图片域名 `assets.glorisauto.com` 已在 Astro 图片配置中允许
- 若线上文章封面或 `_astro` 图片资源异常，优先重新执行一次 `npm run deploy:pages`
