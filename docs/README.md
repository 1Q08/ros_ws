# ROS 命令速查

一个开源的 **ROS1 / ROS2 命令行参考工具**，基于 Jekyll + GitHub Pages 构建，提供交互式命令浏览器。

> 本网站完全由 Kimi K3、Claude Opus 4.8、Deepseek V4 等开源 AI 模型生成，内容仅供参考，若有错误请联系作者纠正。

---

## 📁 项目架构

```
docs/                              # Jekyll 站点根目录
├── _config.yml                   # ⚙️ 站点核心配置
├── Gemfile / Gemfile.lock        # 📦 Ruby 依赖管理
├── README.md                     # 📄 本说明文档
│
├── index.md                      # 🏠 首页（home 布局）
├── about.md                      # ℹ️ 关于页（page 布局）
├── commands.html                 # 🔍 命令速查交互页（核心功能）
├── 404.html                      # ❌ 自定义 404 页面
│
├── _layouts/                     # 🎨 页面布局模板（继承链）
│   ├── default.html              # ├─ 根布局：head + header + content + footer
│   ├── home.html                 # ├─ 首页布局：文章列表 + 分页
│   ├── page.html                 # ├─ 普通页面布局：标题 + 内容
│   └── post.html                 # └─ 文章布局：日期 + 作者 + schema.org
│
├── _includes/                    # 🧩 可复用片段
│   ├── head.html                 # ├─ <head>：meta + CSS + JS + SEO + feed
│   ├── header.html               # ├─ 导航栏：标题 + 链接 + 🌓 主题切换按钮
│   ├── footer.html               # ├─ 页脚：作者 + 邮箱 + 描述 + 社交链接
│   └── social.html               # └─ 社交图标：GitHub + RSS
│
├── _sass/                        # 💅 SCSS 样式源
│   ├── minima.scss               # ├─ 主入口：变量定义 + 导入 partials
│   └── minima/
│       ├── _base.scss            # ├─ 基础元素：字体、颜色、链接、代码块、wrapper
│       ├── _layout.scss          # ├─ 布局样式：header、footer、导航、page-content
│       ├── _syntax-highlighting.scss  # ├─ Rouge 代码高亮配色
│       └── _theme.scss           # └─ ✨ 自定义主题系统：CSS 变量 + 深浅色模式
│
└── assets/                       # 📁 静态资源
    ├── main.scss                 # ├─ CSS 入口（@import "minima" → main.css）
    ├── data/
    │   └── commands.json         # ├─ 🗄️ 命令数据库（速查页数据源）
    ├── icons/
    │   ├── minima-social-icons.svg    # ├─ GitHub/RSS 图标
    │   ├── icon-search.svg            # ├─ 搜索图标
    │   └── icon-eye.svg               # └─ 浏览图标
    ├── js/
    │   ├── theme.js              # ├─ 🌓 主题切换逻辑（localStorage + 系统偏好）
    │   └── commands.js           # └─ 🔍 命令速查页脚本（搜索 + 三级联动 + 高亮）
    └── css/
        └── commands.scss         # └─ 🎨 命令速查页专属样式（→ commands.css）

_site/                             # 🏗️ Jekyll 编译输出（自动生成，不手动编辑）
```

---

## 🏗️ 架构详解

### 1. 核心配置（`_config.yml`）

| 配置项 | 值 |
|--------|-----|
| 站点标题 | `ROS 命令速查` |
| 作者 | `老张同志` |
| baseurl | `/ros_ws` |
| 部署 URL | `https://1q08.github.io` |
| 主题 | `minima` |
| 导航栏页面 | `about.md`、`commands.html` |
| 插件 | `jekyll-feed`、`jekyll-seo-tag` |

### 2. 布局继承链（Layouts）

```
default.html      ← 根布局
  ├── home.html   ← 首页（主页/索引页）
  ├── page.html   ← 普通页面（about.md、commands.html）
  └── post.html   ← 博客文章（带日期、作者、schema.org）
```

所有布局通过 `layout: default` 声明继承，内容通过 `{{ content }}` 注入根布局。

### 3. 模板片段（Includes）

| 片段 | 职责 |
|------|------|
| `head.html` | `<head>` 标签，引入 `main.css`、`theme.js`、SEO tag、feed meta，并支持 `page.custom_css` / `page.custom_js` 按需加载 |
| `header.html` | 导航栏，包含站点标题、链接、**自定义主题切换按钮** |
| `footer.html` | 页脚，显示作者、邮箱、站点描述（支持多行）、社交图标 |
| `social.html` | GitHub + RSS 社交图标 |

### 4. 样式系统（SCSS）

```
assets/main.scss ──@import──→ _sass/minima.scss ──→ _base.scss
                                                   ├─ _layout.scss
                                                   ├─ _syntax-highlighting.scss
                                                   └─ _theme.scss ✨
```

- 所有页面共用 `main.css`（全局样式）
- 命令速查页额外加载 `commands.css`（页面专属样式，通过 front matter 声明）
- 颜色统一使用 CSS 变量（`--bg-primary`、`--text-primary` 等），深浅模式自动适配

### 5. ✨ 自定义主题系统（`_theme.scss` + `theme.js`）

**CSS 变量方案**，定义于 `_theme.scss`：

- `:root` — 浅色主题（GitHub 风格：白色背景、深色文字）
- `[data-theme="dark"]` — 深色主题（GitHub Dark 风格：深色背景、浅色文字）

**切换逻辑**（`theme.js`）：

1. 检测顺序：`localStorage` → 系统偏好 (`prefers-color-scheme`) → 默认浅色
2. 切换时设置 `<html data-theme="dark|light">`，保存到 `localStorage`，更新按钮图标

### 6. 🔍 命令速查核心页（`commands.html`）

**页面结构**（3 个区域）：

| 区域 | 功能 |
|------|------|
| 搜索区域 | 实时搜索 + 结果列表 + 点击弹出详情卡片 |
| 分类浏览 | 三级联动下拉框：ROS 版本 → 命令分类 → 具体命令 |
| 命令详情 | 显示命令名称、代码块（含 `<param>` 占位符）、说明、示例、注意事项 |

**技术特点**：

- 数据与视图分离：`commands.json` 为数据源，`commands.js` 实现交互逻辑，`commands.scss` 控制样式
- 代码块中 `ros1`/`ros2` 关键字橙黄色高亮（`<span class="hl-ros">`）
- HTML 实体转义，防止 `<param>` 被浏览器解析为标签

### 7. 🗄️ 命令数据库（`assets/data/commands.json`）

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
| ROS 1 | 6 | 17 |
| ROS 2 | 8 | 27+ |
| **合计** | **14** | **44+** |

---

## 🚀 本地开发

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

### 常用命令

```bash
# 构建站点（输出到 _site/）
bundle exec jekyll build

# 构建并监听变化
bundle exec jekyll build --watch

# 生产模式构建（启用 GA/SEO 等）
JEKYLL_ENV=production bundle exec jekyll build
```

---

## 🔧 扩展指南

### 添加新命令

编辑 `assets/data/commands.json`，在对应版本和分类的 `commands` 数组中添加：

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

1. 在 `commands.json` 的对应版本对象中添加新键值
2. 该键会自动出现在分类下拉框中（无需修改 JS）

### 添加新页面

1. 创建 `new-page.md`，设置 `layout: page` 等 front matter
2. 如需专属样式/脚本，在 front matter 中声明 `custom_css` / `custom_js`
3. 添加到 `_config.yml` 的 `header_pages` 列表显示在导航栏

---

## 📦 依赖

| 依赖 | 用途 |
|------|------|
| `github-pages` gem | GitHub Pages 环境（含 Jekyll 3.x + minima 主题） |
| `jekyll-feed` | RSS feed 生成 |
| `jekyll-seo-tag` | SEO meta 标签 |

---

## 📄 许可

本项目基于 MIT 许可开源。详见项目根目录的 [LICENSE](../LICENSE) 文件。
