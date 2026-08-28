# ROS 命令速查

一个开源的 **ROS1 / ROS2 命令行参考工具**，基于 Jekyll + GitHub Pages 构建，提供交互式命令浏览器

> 本网站完全由 Kimi K3、Claude Opus 4.8、Deepseek V4 等开源 AI 模型生成，内容仅供参考，若有错误请联系作者纠正

---

## 📁 项目架构

```
docs/                              # Jekyll 站点根目录
├── _config.yml                   # 站点核心配置
├── Gemfile / Gemfile.lock        # Ruby 依赖管理
├── README.md                     # 本说明文档
│
├── index.md                      # 首页（home 布局）
├── about.md                      # 关于页（page 布局）
├── commands.html                 # 命令速查交互页（核心功能）
├── archive.md                    # 全部文章归档页（page 布局）
├── 404.html                      # 自定义 404 页面（ROS 终端风格）
│
├── en/                           # 英文版页面（挂载于 /en/ 路径）
│   ├── index.md                  # ├─ 英文首页（无文章列表 / 评论区）
│   ├── commands.html             # ├─ 英文命令速查交互页
│   ├── about.md                  # ├─ 英文关于页
│   └── 404.html                  # └─ 英文自定义 404
│
├── _posts/                       # 博客文章（Markdown，文件名含发布日期）
├── _layouts/                     # 页面布局模板（继承链）
│   ├── default.html              # ├─ 根布局：head + header + content + footer
│   ├── home.html                 # ├─ 首页布局：文章列表 + giscus 评论区
│   ├── page.html                 # ├─ 普通页面布局：标题 + 内容
│   └── post.html                 # └─ 文章布局：日期 + 作者 + schema.org
│
├── _includes/                    # 可复用片段
│   ├── head.html                 # ├─ <head>：meta + CSS + JS + SEO + feed + hreflang
│   ├── header.html               # ├─ 导航栏：标题（中英自适应）+ 链接 + 语言/主题切换按钮
│   ├── footer.html               # ├─ 页脚：作者 + 邮箱 + 描述（中英自适应）+ 社交链接
│   ├── lang-switcher.html        # ├─ 语言切换按钮（中英互跳 /en/ ↔ /）
│   └── social.html               # └─ 社交图标：GitHub + RSS
│
├── _sass/                        # SCSS 样式源
│   ├── minima.scss               # ├─ 主入口：变量定义 + 导入 partials
│   └── minima/
│       ├── _base.scss            # ├─ 基础元素：字体、颜色、链接、代码块、wrapper
│       ├── _layout.scss          # ├─ 布局样式：header、footer、导航、page-content
│       ├── _syntax-highlighting.scss  # ├─ Rouge 代码高亮配色
│       └── _theme.scss           # └─ 自定义主题系统：CSS 变量 + 深浅色模式
│
└── assets/                       # 静态资源
    ├── main.scss                 # ├─ CSS 入口（@import "minima" → main.css）
    ├── data/
    │   ├── commands.json         # ├─ 命令数据库（中文源，速查页数据源）
    │   └── commands.en.json      # └─ 命令数据库（英文翻译，结构一致）
    ├── icons/
    │   ├── favicon.svg                # ├─ 浅色 favicon（随主题动态切换）
    │   ├── favicon-dark.svg           # ├─ 深色 favicon
    │   ├── minima-social-icons.svg    # ├─ GitHub/RSS 图标
    │   ├── icon-search.svg            # ├─ 搜索图标
    │   ├── icon-eye.svg               # ├─ 浏览图标
    │   └── icon-sort.svg              # └─ 排序图标（速查表按钮）
    ├── js/
    │   ├── theme.js              # ├─ 主题切换逻辑（localStorage + 系统偏好）
    │   ├── bg-particles.js       # ├─ 背景粒子动画（Canvas，大小分层 + 发光）
    │   └── commands.js           # └─ 命令速查页脚本（搜索 + 三级联动 + 高亮 + 文案 i18n）
    └── css/
        └── commands.scss         # └─ 命令速查页专属样式（→ commands.css，含斑马条纹表格）

_site/                             # Jekyll 编译输出（自动生成，不手动编辑）
```

---

## 🌐 中英双语

站点默认中文，英文版挂载于 `/en/` 路径，与中文共享同一套布局、脚本与数据源。

**实现机制**：

- 页面用 front matter 声明语言与独立 permalink：`lang: en` + `permalink: /en/...`
- 中文页导航右侧显示 `EN` 胶囊按钮、英文页显示 `中文`，一键互跳（`_includes/lang-switcher.html`）
- `<head>` 输出双向 `hreflang`（`zh-CN` / `en` / `x-default`），便于搜索引擎识别对应版本
- `site.title_en` / `site.description_en` 驱动英文站点标题、页脚描述与英文页 `<title>`
- 英文首页不显示文章列表与 giscus 评论区（`_layouts/home.html` 按 `page.lang` 分支）

**覆盖范围**：

| 页面 | 中文 | 英文 |
|------|------|------|
| 首页 | `/` | `/en/` |
| 命令速查 | `/commands/` | `/en/commands/` |
| 关于 | `/about/` | `/en/about/` |
| 404 | `/404.html` | `/en/404.html` |

> 博客文章（`_posts/`）仅提供中文，不生成英文副本。

---

## 🔍 命令速查核心页（`commands.html`）

**页面结构**（4 个区域）：

| 区域 | 功能 |
|------|------|
| 搜索区域 | 实时搜索 + 结果列表 + 点击弹出详情卡片 |
| 分类浏览 | 三级联动下拉框：ROS 版本 → 命令分类 → 具体命令 |
| 命令速查表 | 折叠面板，一键展开查看全部命令概览（版本/分类/命令/说明） |
| 命令详情 | 显示命令名称、代码块（含 `<param>` 占位符）、说明、示例、注意事项 |

**技术特点**：

- 数据与视图分离：`commands.json` / `commands.en.json` 为数据源，`commands.js` 实现交互逻辑，`commands.scss` 控制样式
- 页面文案国际化：脚本根据 `<html lang>` 自动切换中英文 UI 文案与数据文件，无需维护两份 JS
- 概览表采用斑马条纹（偶数行底色复用 `--bg-secondary`），低对比、深浅主题均辅助横向扫视
- 代码块中 `ros1`/`ros2` 关键字橙黄色高亮（`<span class="hl-ros">`）
- HTML 实体转义，防止 `<param>` 被浏览器解析为标签

## 🗄️ 命令数据库（`assets/data/commands.json`）

中英文数据源分离：`commands.json` 为中文源，`commands.en.json` 为其逐条英文翻译（结构完全一致）。速查页脚本根据页面语言（`<html lang>`）自动加载对应文件，命令文本（`display`/`title`/`cmd`/`example`）保持一致，仅 `desc`/`notes` 本地化。

**数据结构**：

```json
{
  "ros1": { "category_key": { "name": "分类名", "commands": [...] } },
  "ros2": { "category_key": { "name": "分类名", "commands": [...] } }
}
```

每条命令字段：

| 字段 | 用途 | 示例 |
|------|------|------|
| `display` | 下拉框短名称 | `"echo"` |
| `title` | 详情页标题 | `"ros2 topic echo"` |
| `cmd` | 代码块命令（含占位符） | `"ros2 topic echo <topic_name>"` |
| `desc` | 说明文字 | `"实时打印话题消息"` |
| `example` | 示例代码 | `"ros2 topic echo /chatter"` |
| `notes` | 注意事项 | `"按 Ctrl+C 停止显示"` |

**命令统计**：

| 版本 | 分类数 | 命令总数 |
|------|--------|---------|
| ROS 1 | 6 | 18 |
| ROS 2 | 10 | 52 |
| **合计** | **16** | **70** |

---

## 本地开发

> 注：giscus 评论区依赖 giscus.app 外网服务，本地沙箱预览时可能无法访问而不显示，部署到 GitHub Pages 后即可正常加载。

### 环境要求

- Ruby 3.2+（推荐 3.2.3）
- Bundler
- GCC / Make（用于 native gem 编译）

### 启动步骤

```bash
# 1. 安装依赖
cd docs
bundle install

# 2. 启动开发服务器（监听文件变化，自动重建）
bundle exec jekyll serve --baseurl=""

# 3. 浏览器访问
# http://127.0.0.1:4000
```

---

## 🔧 扩展指南

### 添加新命令

编辑 `assets/data/commands.json`，在对应版本和分类的 `commands` 数组中添加；随后在 `assets/data/commands.en.json` 的相同位置补一条英文翻译（保持两条 JSON 结构一致，否则中英文速查表条目数会不一致）：

```json
{
  "display": "short_name",
  "title": "ros2 xxx xxx",
  "cmd": "ros2 xxx xxx <param>",
  "desc": "命令说明",
  "example": "ros2 xxx xxx /example",
  "notes": "注意事项\n\n常用选项：\n  --option    说明"
}
```

### 添加新分类

1. 在 `commands.json` 的对应版本对象中添加新键值，并在 `commands.en.json` 中同步添加英文分类名
2. 该键会自动出现在分类下拉框中（无需修改 JS）

### 添加英文页面

1. 在 `en/` 目录下创建对应文件，front matter 声明 `lang: en` 与 `permalink: /en/xxx/`
2. 英文站导航固定在 `_includes/header.html` 中维护（Home / Commands / About），新增导航项需同步修改该文件
3. 页面级 `<title>` 与 `description` 在 front matter 中用 `title:` / `description:` 定位英文文案

### 添加新页面

1. 创建 `new-page.md`，设置 `layout: page` 等 front matter
2. 如需专属样式/脚本，在 front matter 中声明 `custom_css` / `custom_js`
3. 添加到 `_config.yml` 的 `header_pages` 列表显示在导航栏

---

## 依赖

| 依赖 | 用途 |
|------|------|
| `github-pages` gem | GitHub Pages 环境（含 Jekyll 3.x + minima 主题） |
| `jekyll-feed` | RSS feed 生成 |
| `jekyll-seo-tag` | SEO meta 标签 |
| 💎[giscus](https://github.com/giscus/giscus) | 评论区，依托 GitHub Discussions 存储 |
| 👀[hits.sh](https://hits.sh) | 零代码的访客计数徽章服务（页脚访问量） |

---

## 许可

本项目基于 MIT 许可开源。详见项目根目录的 [LICENSE](../LICENSE) 文件