# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run dev:cloudflare`  | 构建后使用 Wrangler 本地模拟 Cloudflare Pages 环境 |
| `npm run preview:cloudflare` | 同上，用于预览构建结果在 CF 环境下的表现        |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ☁️ Cloudflare 开发环境

项目支持在本地用 [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 模拟 Cloudflare Pages 环境：

1. 安装依赖后执行：`npm run dev:cloudflare` 或 `npm run preview:cloudflare`（会先执行 `astro build`，再以 `wrangler pages dev dist` 提供静态站点）。
2. 环境变量：构建阶段使用 `.env` 中的 `PUBLIC_STRAPI_URL`；若需在 Wrangler 中覆盖，可复制 `.dev.vars.example` 为 `.dev.vars` 并填写。
3. 部署到 Cloudflare Pages 时，在 Dashboard → 项目 → Settings → Environment variables 中配置同名变量即可。

### 静态站发布到 Cloudflare 后，表单能否提交到后端？

**可以。** 表单提交是**用户浏览器**直接发请求，和“静态/动态”无关，只要前端把请求发到后端即可。

- **做法一：前端直接请求后端**  
  表单用 `fetch(PUBLIC_STRAPI_URL + '/api/xxx', { method: 'POST', ... })` 或 `form action="https://你的后端/api/xxx"` 提交到 Strapi（或现有后端）。  
  - 要求：后端**必须公网可访问**，且要在 **Strapi 里配置 CORS**，允许你的 Cloudflare 页面域名（如 `https://xxx.pages.dev`、`https://www.glorisauto.com`），否则浏览器会拦截跨域 POST。
- **做法二：经 Cloudflare Pages Function 中转**  
  表单先提交到同源接口（如 `/api/contact`），由 Cloudflare 的 Serverless Function 再请求 Strapi。这样浏览器只访问同源，**不需要** Strapi 对前端域名开 CORS；Strapi 只要能被 Cloudflare 的节点访问即可。

当前项目里的联系表单（如 `support/contact`）若尚未接提交逻辑，可按上面两种方式之一接好后端接口；部署到 Cloudflare 静态页后，表单即可正常提交到后端。

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
