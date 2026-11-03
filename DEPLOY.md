# 部署指南 · 鳢科图谱

站点是纯静态文件（HTML/CSS/JS），没有后端，任何静态托管都能跑。下面两条路线选一条即可。

---

## 方案 A：Cloudflare Pages（推荐，拖拽上传，不用 Git）

1. 打开 <https://dash.cloudflare.com/>，注册/登录（免费）。
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Upload assets**。
3. 项目名填 `channidae-atlas` → **Create project**。
4. 把 `channidae-atlas-deploy.zip` 解压，将解压出来的**文件夹内容**（`index.html`、`assets/`、`credits.html`、`trade-names.html`、`404.html`、`data/` 等）整体拖进上传框 → **Deploy site**。
5. 部署完成会得到一个地址，形如：

   `https://channidae-atlas.pages.dev`

6. 以后更新：进入项目 → **Create new deployment** → 重新上传整站文件即可。

> 说明：`*.pages.dev` 在国内部分网络下可能不稳定。若有自己的域名，可在 Cloudflare 里绑定自定义域名（免费 DNS + 自动 HTTPS），访问会稳定很多。

---

## 方案 B：GitHub Pages（有 GitHub 账号时）

1. 新建一个 **Public** 仓库，例如 `channidae-atlas`。
2. 把站点文件推上去（解压 zip 后，在文件夹里执行）：

   ```bash
   git init
   git add .
   git commit -m "channidae atlas"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/channidae-atlas.git
   git push -u origin main
   ```

   不想用命令行，也可以在仓库页面 **Add file → Upload files**，把整站文件夹拖进去提交。

3. 仓库 **Settings → Pages → Build and deployment**：
   - Source 选 **Deploy from a branch**
   - Branch 选 **main**，目录选 **/ (root)** → **Save**
4. 等 1–2 分钟，地址为：

   `https://<你的用户名>.github.io/channidae-atlas/`

> 站点所有路径都是相对路径，放在仓库子路径下也能正常工作；压缩包里已带 `.nojekyll`。
> 国内访问 `github.io` 可能较慢，必要时配合自己的域名或改用 Cloudflare Pages。

---

## 方案 C：有 Node 环境时用命令行（可选）

Cloudflare Wrangler（会打开浏览器登录）：

```bash
npx wrangler pages deploy . --project-name channidae-atlas
```

---

## 部署后自检

- [ ] 首页正常、封面图与卡片图加载
- [ ] 分类树可折叠，点击物种能打开详情
- [ ] 深链：`/?sp=channa-argus`、`/?q=乌鳢` 正常
- [ ] `credits.html`、`trade-names.html` 可访问
- [ ] 手机打开，图鉴为两列、导航可用
- [ ] 绑定域名后 HTTPS 正常

---

## 备注

- 站点不收集数据、无第三方统计，纯静态。
- 图片为 CC 许可或作者授权，**请保留 `credits.html` 与详情页署名**。
- 更新内容时替换整站文件即可；`data/species.json` 是数据备份，页面实际读取 `assets/js/data.js`。
