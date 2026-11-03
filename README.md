# 鳢科图谱 · Channidae Atlas

一个以「种」为单位的鳢科（Channidae，蛇头鱼）分类图谱网站：**2 属 57 个有效种**，树状分类图、物种卡片、分布与形态数据、开放版权影像；另附 1 个水族贸易未定种「金尘雷龙」*Channa* sp. 'Gold Dust'。

纯静态站点，无构建步骤、无外部依赖，双击 `index.html` 即可离线浏览。

**线上地址：<https://channidae-atlas.pages.dev>**（Cloudflare Pages，部署说明见 `DEPLOY.md`）

---

## 打开方式

- **直接打开**：双击 `index.html`（`file://` 下所有功能可用，数据与图片均为本地文件）。
- **本地服务器**（可选，便于手机同网段访问）：

  ```bash
  cd channidae-site
  python -m http.server 8765
  ```

  然后访问 <http://127.0.0.1:8765/>。

---

## 目录结构

```
channidae-site/
├─ index.html              主页面（概览 / 分类树 / 图鉴 / 数据说明）
├─ credits.html            影像版权清单（46 张图的作者、许可与原始页面）
├─ trade-names.html        水族贸易名 ↔ 学名对照表（小型 / 中型 / 大型雷龙）
├─ assets/
│  ├─ css/main.css         全部样式
│  ├─ js/data.js           物种数据（window.ATLAS，内嵌以支持 file://）
│  ├─ js/app.js            树状图、筛选、搜索、详情弹窗
│  └─ img/
│     ├─ hero.jpg          首页封面（Channa gachua，CC0）
│     ├─ full/             详情页大图（长边 ≤1500px）
│     ├─ card/             卡片缩略图（4:3）
│     └─ placeholder.svg   无开放影像时的占位图
├─ data/species.json       与 data.js 同源的物种数据（便于查阅/二次利用）
└─ README.md
```

---

## 功能

- **分类树**：科 → 属 → 种，水平树状图；点击属名折叠/展开，点击种名打开详情；支持搜索高亮。
- **物种图鉴**：按属、分布区域（南亚/东南亚/东亚/非洲）、IUCN 等级筛选；按学名、体长、受威胁程度排序；「仅显示有照片」开关。
- **详情页**：学名与命名人、中文名/俗名/英文名、最大体长、IUCN 等级与评估日期、分布、栖息环境、鳍条与脊椎骨数据、FishBase 生物学原文、影像署名与原始页面。
- **水族贸易名对照**：把常见的「雷龙」商品名按体型整理，能对应的给出学名并链接到物种详情；未定种写作 *Channa* sp. ‘…’；无法确认的标为「待考」，不把猜测当定论。
- **深链**：`index.html?sp=channa-argus` 直接打开某物种；`index.html?q=乌鳢` 直接搜索。
- **响应式**：桌面双栏 / 平板 / 手机布局；支持 `prefers-reduced-motion` 与打印样式。

---

## 数据来源与处理

| 字段 | 来源 |
| --- | --- |
| 有效种名录、学名、命名人 | [FishBase](https://www.fishbase.se/) 2025 版（含 2024–2025 年新种）；参照 Eschmeyer's Catalog of Fishes 核对 |
| 最大体长、鳍条数、脊椎骨、分布、生物学 | FishBase 物种页（2025-2） |
| IUCN 等级与评估日期 | IUCN Red List，经 FishBase 转引 |
| 中文名 | 中文文献 / FishBase 收录名；标 `*` 者为依学名直译的**暂拟名**，非正式通用名 |
| 影像 | Wikimedia Commons、iNaturalist（CC0 / CC BY / CC BY-SA / CC BY-NC）；Naturalis 馆藏标本（CC0） |

分类处理：鳢科置于攀鲈目（Anabantiformes）之下，仅含鳢属 *Channa*（54 种，亚洲，具腹鳍）与副鳢属 *Parachanna*（3 种，非洲，无腹鳍）。原属鳢科的穴鳢属 *Aenigmachanna* 已于 2020 年独立为穴鳢科（Aenigmachannidae），本站不收。

> 鳢属目前没有公认的亚属划分。分子研究提示 *gachua* 复合群、*striata* 群、*marulius* 群等早期分化支系，但尚未形成稳定的亚属系统，因此分类树不设「种组」层级，只到种。

---

## 中文名说明

- 无 `*`：有中文文献或 FishBase 收录名依据（如 乌鳢、斑鳢、月鳢、线鳢、宽额鳢、巴卡鳢、布氏鳢）。
- 带 `*`：暂拟译名，仅便于中文阅读，不具命名法效力。

---

## 影像与缺图

46 个种使用开放许可影像，逐图署名（详见 `credits.html` 与详情页）。图鉴末尾另有 1 张站长拍摄的「金尘雷龙」*Channa* sp. 'Gold Dust' 照片，仅授权本站使用。以下 **11 个种暂无开放版权影像**，卡片以占位图标注「暂无开放影像」，未使用近似种照片替代：

`C. aurantipectoralis`、`C. bhoi`、`C. bipuli`、`C. brunnea`、`C. hoaluensis`、`C. longistomata`、`C. nachi`、`C. nox`、`C. ornatipinnis`、`C. pomanensis`、`C. rakhinica`

> 这些多为 2016 年以后发表、野外记录极少的物种，照片仅见于原始描述或受版权保护的图版。若需补齐，可提供自有照片或取得授权的图版，替换 `assets/img/` 下同名文件并在 `data.js` 中补上 `img` 字段即可。

---

## 更新数据

`assets/js/data.js` 是站点唯一数据源，结构为：

```js
window.ATLAS = {
  meta: {...},
  hero: { src, credit },
  species: [{
    id, genus, epithet, sci, author,
    zh, zh_t, alias, en,
    size, iucn, iucn_date,
    dist_zh, dist_en, regions, water, zone,
    dorsal, anal, pectoral, ll, vert, body,
    morph_en, bio_en, fb,
    img: { card, full, kind, credit: { artist, license, license_url, source, page } } | null
  }]
}
```

改完后刷新页面即可；`data/species.json` 为同一数据的 JSON 版本，可一并更新。

---

## 已知限制 / 可继续改进

1. **缺图 11 种**：见上；可补授权照片或馆藏标本照。
2. **分类树层级**：目前为科 → 属 → 种；若采用某一分子系统学方案，可加入「种组/支系」层级并注明文献。
3. **分布**：现为文字描述，可加 GIS 分布图（需符合来源许可）。
4. **IUCN 时效**：等级随 IUCN 更新，建议每年复核一次。
5. **中文名**：暂拟名可随中文文献更新替换。

---

## 技术

原生 HTML / CSS / JavaScript；无框架、无 CDN、无追踪。树状图为运行时生成的 SVG，卡片与详情由 `data.js` 渲染。字体优先使用系统宋体/思源宋体，保证中文排版与离线可用。

---

## 许可

- **站点代码**：MIT，见 [LICENSE](LICENSE)。
- **本站原创文字**：CC BY 4.0（转载注明来源）。
- **分类/形态数据**：整理自 FishBase 与 IUCN；FishBase 原文摘录版权归原权利人，不适用 MIT。
- **图片**：各自 CC 许可，逐图署名见 [credits.html](credits.html)；「金尘雷龙」照片由站长提供，保留所有权利。
- 完整说明见 [NOTICE.md](NOTICE.md)。
