# AGENT.md

最后核验时间：2026-04-17 21:24 CST

这个工作区包含 GLORISAUTO 的前台网站和 Strapi 后台项目。后续 AI 或工程师接手时，请优先阅读本文件。

## 本地工作区

根目录：

- `/Users/matthew/Downloads/00.CODE/glasuritauto.com`

项目目录：

- 前台网站：`/Users/matthew/Downloads/00.CODE/glasuritauto.com/glorisauto`
- 后台 / CMS：`/Users/matthew/Downloads/00.CODE/glasuritauto.com/glorisauto-admin`

注意：根目录本身不是 Git 仓库，两个子项目目录分别是独立 Git 仓库。

## GitHub 仓库

前台网站：

- 本地路径：`/Users/matthew/Downloads/00.CODE/glasuritauto.com/glorisauto`
- 远端仓库：`git@github.com:ljmang/glorisauto.git`
- 分支：`main`
- 已核验本地 HEAD：`319f55e55f1b48beff967d7ab0a377ebc82b2d1b`
- 最新核验提交：`319f55e 2026-04-14 10:06:05 +0800 ljmang feat: refine product media rendering and api mapping`

后台 / CMS：

- 本地路径：`/Users/matthew/Downloads/00.CODE/glasuritauto.com/glorisauto-admin`
- 远端仓库：`git@github.com:ljmang/glorisauto-admin.git`
- 分支：`master`
- 已核验本地 HEAD：`9d888591ce125dd2c79d3c784f30fe3497f9be5a`
- 最新核验提交：`9d88859 2026-04-17 16:57:42 +0800 ljmang feat: add seo page content type`

截至上方核验时间，两个本地仓库工作区都是干净状态，并且都与各自的 `origin` 分支一致。

## 本机 GitHub SSH（2026-04-20 更新）

当前机器可用于 GitHub 的 SSH 方式已核验通过（账号：`ljmang`）。

- GitHub SSH 主机：`git@github.com`
- 可用私钥：`~/.ssh/id_rsa`
- 私钥注释：`mingplus0815@163.com`
- 私钥指纹：`SHA256:TmuxZHZmEG7qYmd/y4V9+RLpvDgqzRvJDurA7vrUwwI`

常用命令：

```bash
ssh-add ~/.ssh/id_rsa
ssh -T git@github.com
```

鉴权成功预期：

```text
Hi ljmang! You've successfully authenticated, but GitHub does not provide shell access.
```

说明：

- `id_rsa` 为带口令私钥；口令不要写入仓库或文档。
- 若出现 `Permission denied (publickey)`，先执行 `ssh-add ~/.ssh/id_rsa` 再重试 Git 操作。
- 本地仓库 remote 使用 SSH：
  - `git@github.com:ljmang/glorisauto.git`
  - `git@github.com:ljmang/glorisauto-admin.git`

## 生产服务器

SSH 登录：

```bash
ssh root@8.138.154.183
```

连接信息：

- HostName：`8.138.154.183`
- User：`root`
- Port：`22`
- SSH 观察到的服务器主机名：`iZ7xvhegjvgwfb55z9fhpiZ`

生产项目根目录：

- `/srv/glorisauto.com`

生产项目目录：

- 前台网站：`/srv/glorisauto.com/www`
- 后台 / CMS：`/srv/glorisauto.com/admin`

## 生产代码状态

服务器前台：

- 路径：`/srv/glorisauto.com/www`
- 远端仓库：`git@github.com:ljmang/glorisauto.git`
- 分支：`main`
- 已核验 HEAD：`319f55e55f1b48beff967d7ab0a377ebc82b2d1b`
- 已核验状态：工作区干净，与 `origin/main` 一致

服务器后台 / CMS：

- 路径：`/srv/glorisauto.com/admin`
- 远端仓库：`git@github.com:ljmang/glorisauto-admin.git`
- 分支：`master`
- 已核验 HEAD：`9d888591ce125dd2c79d3c784f30fe3497f9be5a`
- 已核验状态：工作区干净，与 `origin/master` 一致

截至核验时间，服务器代码和本地代码在两个项目中均一致。

## 运行环境 / PM2

PM2 进程：

- `glorisauto-www`：前台网站，在线
- `glorisauto`：Strapi 后台 / CMS，在线

前台 PM2：

- 名称：`glorisauto-www`
- 运行目录：`/srv/glorisauto.com/www`
- Node 路径：`/root/.nvm/versions/node/v20.19.4/bin/node`
- 启动参数：`./dist/server/entry.mjs`
- 环境变量：
  - `NODE_ENV=production`
  - `HOST=0.0.0.0`
  - `PORT=4321`
  - `STRAPI_INTERNAL_URL=http://127.0.0.1:1337`
  - `STRAPI_CACHE_TTL_MS=60000`
- 日志路径：
  - 错误日志：`/root/.pm2/logs/glorisauto-www-error-1.log`
  - 输出日志：`/root/.pm2/logs/glorisauto-www-out-1.log`

后台 / CMS PM2：

- 名称：`glorisauto`
- 运行目录：`/srv/glorisauto.com/admin`
- 启动脚本：`npm`
- 启动参数：`run start`
- 实际观察到的 Strapi 入口：`/srv/glorisauto.com/admin/node_modules/@strapi/strapi/bin/strapi.js start`
- 环境变量：
  - `NODE_ENV=production`
  - `HOST=0.0.0.0`
  - `PORT=1337`
- 日志路径：
  - 合并日志：`/var/log/pm2/glorisauto.log`
  - 错误日志：`/var/log/pm2/glorisauto-error.log`
  - 输出日志：`/var/log/pm2/glorisauto-out.log`

常用命令：

```bash
pm2 list
pm2 describe glorisauto-www
pm2 describe glorisauto
pm2 logs glorisauto-www --lines 100
pm2 logs glorisauto --lines 100
```

## 端口

已观察到的监听端口：

- `80`：Nginx
- `443`：Nginx
- `4321`：前台 Astro SSR Node 进程
- `1337`：Strapi Node 进程

## Nginx

相关启用站点配置：

- `/etc/nginx/sites-enabled/admin.glorisauto.com -> /etc/nginx/sites-available/admin.glorisauto.com`
- `/etc/nginx/sites-enabled/ip-access-80 -> /etc/nginx/sites-available/ip-access-80`

已删除的旧测试域名配置：

- `test.glorisauto.com` 已于 2026-04-17 下线，不再使用。
- 已删除启用链接：`/etc/nginx/sites-enabled/test.glorisauto.com`
- 原配置已移到备份：`/root/nginx-backups/test.glorisauto.com.disabled-20260417-2124`

相关缓存配置：

- `/etc/nginx/conf.d/glorisauto-ssr-cache.conf`
- 定义缓存区：`glorisauto_ssr`
- 缓存路径：`/var/cache/nginx/glorisauto_ssr`

已观察到的路由：

- `admin.glorisauto.com`
  - HTTP `80` 会跳转到 HTTPS。
  - HTTPS `443` 代理到 `http://127.0.0.1:1337`。
  - 对应 Strapi 后台 / API 服务。
- 服务器 IP / 默认 HTTP 访问
  - 配置文件：`/etc/nginx/sites-available/ip-access-80`
  - 代理到 `http://127.0.0.1:4321`。
  - `/` 会跳转到 `/en/`。
  - 使用 `glorisauto_ssr` Nginx 缓存。

本次检查没有发现单独启用的 `www.glorisauto.com` 或根域名 `glorisauto.com` Nginx 站点配置。

## 环境变量文件

不要把密钥、密码、Token 等敏感值粘贴到聊天或文档中。

前台环境变量文件：

- `/srv/glorisauto.com/www/.env`
- 已观察到的变量名：
  - `PUBLIC_STRAPI_URL`

前台 PM2 环境还设置了：

- `STRAPI_INTERNAL_URL`
- `STRAPI_CACHE_TTL_MS`

后台 / CMS 环境变量文件：

- `/srv/glorisauto.com/admin/.env`
- 已观察到的变量名：
  - `HOST`
  - `PORT`
  - `PUBLIC_URL`
  - `APP_KEYS`
  - `API_TOKEN_SALT`
  - `ADMIN_JWT_SECRET`
  - `TRANSFER_TOKEN_SALT`
  - `ENCRYPTION_KEY`
  - `DATABASE_CLIENT`
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_NAME`
  - `DATABASE_USERNAME`
  - `DATABASE_PASSWORD`
  - `DATABASE_SSL`
  - `DATABASE_FILENAME`
  - `JWT_SECRET`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_ENDPOINT`
  - `R2_BUCKET`
  - `R2_REGION`
  - `R2_PUBLIC_URL`
  - `R2_ROOT_PATH`

## 常用构建 / 运行命令

前台命令：

```bash
cd /srv/glorisauto.com/www
npm run build
npm run build:ssr
npm run preview
npm run test:strapi
```

后台命令：

```bash
cd /srv/glorisauto.com/admin
npm run build
npm run build:production
npm run rebuild:production
npm run start
npm run sync:home-products
npm run sync:become-dealer-focus-media
npm run sync:product-media
npm run sync:page-defaults
```

## 部署更新 SOP

原则：

- 部署前先确认目标项目和分支，不要在错误目录执行 `git pull`、构建或重启。
- 任何线上更新都先看 `git status --short --branch`，工作区不干净时先判断来源，不要直接覆盖。
- 不要打印或提交 `.env` 中的密钥、密码、Token。
- 前台和后台是两个独立仓库，分别部署；只改前台时不需要重启 Strapi，只改后台时不需要重启前台，除非接口结构影响前台运行。

前台网站部署：

```bash
ssh root@8.138.154.183
cd /srv/glorisauto.com/www
git status --short --branch
git fetch origin
git pull --ff-only origin main
npm install
npm run build
pm2 restart glorisauto-www
pm2 logs glorisauto-www --lines 100
curl -sI -H "Host: glorisauto.com" http://127.0.0.1/en/
```

前台注意事项：

- 前台 PM2 进程名是 `glorisauto-www`，端口是 `4321`。
- 构建产物由 Astro SSR 使用，PM2 启动入口是 `./dist/server/entry.mjs`。
- `npm install` 只在依赖变化或不确定依赖是否完整时执行；若只是普通代码更新，可根据情况跳过。
- `git pull --ff-only` 可以避免在线上产生意外 merge commit。
- Nginx 对前台 SSR 有缓存，成功响应通常缓存约 30 秒；更新后短时间看到旧内容时，先加 `?nocache=1` 或等待缓存过期再判断。
- 如需绕过缓存验证，可使用带 `Cache-Control: no-cache` 的请求，或访问带 `nocache` 参数的页面。

后台 / Strapi 部署：

```bash
ssh root@8.138.154.183
cd /srv/glorisauto.com/admin
git status --short --branch
git fetch origin
git pull --ff-only origin master
npm install
npm run build
pm2 restart glorisauto
pm2 logs glorisauto --lines 100
curl -sI http://127.0.0.1:1337/admin
```

后台注意事项：

- 后台 PM2 进程名是 `glorisauto`，端口是 `1337`。
- Strapi 新增 content type、组件、admin 翻译或后台 UI 相关改动后，通常需要执行 `npm run build` 再重启 PM2。
- 涉及数据库结构、内容模型、上传存储或权限的改动，重启后要登录后台确认模型和权限是否正常。
- 后台 `.env` 包含数据库、JWT、R2 等敏感配置，排查问题时只记录变量名，不输出变量值。

部署后验证：

```bash
pm2 list
pm2 describe glorisauto-www
pm2 describe glorisauto
nginx -t
curl -sI http://127.0.0.1/en/
curl -sI http://127.0.0.1:1337/admin
```

Nginx 和缓存注意事项：

- 当前启用的 GLORISAUTO 相关站点主要是 `admin.glorisauto.com` 和默认 IP 访问配置。
- `test.glorisauto.com` 已下线，配置备份在 `/root/nginx-backups/test.glorisauto.com.disabled-20260417-2124`。
- 修改 Nginx 配置后必须执行 `nginx -t`，通过后再 `systemctl reload nginx`。
- 前台 SSR 缓存配置在 `/etc/nginx/conf.d/glorisauto-ssr-cache.conf`，缓存区名为 `glorisauto_ssr`。
- 不要为了验证页面轻易清空整个 Nginx 缓存；优先使用 `nocache` 参数、等待缓存过期或只验证本机上游端口。

回滚思路：

- 如果前台部署后异常，先看 `pm2 logs glorisauto-www --lines 100`，确认是构建、运行时还是接口问题。
- 如果后台部署后异常，先看 `pm2 logs glorisauto --lines 100` 和 `/var/log/pm2/glorisauto-error.log`。
- 需要回滚代码时，优先使用明确的 Git 提交，例如 `git log --oneline -5` 找到上一个稳定提交，再决定是否 `git revert` 或临时检出；不要执行 `git reset --hard`，除非用户明确要求。
- 回滚后仍需重新构建并重启对应 PM2 进程。

## 最近变更背景

前台最近核验变更：

- 产品详情页画廊已支持混合媒体，包括图片和视频。
- `ProductGallery.astro` 从纯图片缩略图切换为媒体缩略图。
- `src/utils/strapiApi.ts` 新增媒体解析辅助函数，例如 `parseMedia` 和 `parseMediaItems`。

后台最近核验变更：

- 新增 Strapi `SEO Page` 集合类型。
- 新增文件位于 `src/api/seo-page`。
- 新增按页面路径配置 SEO 的内容模型，字段包括 `title`、`path` 和 `seo`。
- Strapi 内容管理器默认 published 过滤逻辑已包含 `api::seo-page.seo-page`。

## 安全交接注意事项

- 编辑前优先在本地和服务器分别执行 `git status --short --branch`。
- 不要覆盖或打印 `.env` 中的敏感值。
- 服务器操作前先确认目标路径：前台是 `/srv/glorisauto.com/www`，CMS 是 `/srv/glorisauto.com/admin`。
- 只有在构建成功，并确认 PM2 进程名正确后，才重启线上服务。
- Nginx SSR 缓存可能导致前台 SSR 改动在约 30 秒内看起来没有立即生效。
