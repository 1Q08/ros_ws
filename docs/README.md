# minima

*Minima 是一款为写作者打造的"一款多用" Jekyll 主题*。它是 Jekyll 的默认（也是第一个）主题。当你运行 `jekyll new` 时得到的就是它。

[主题预览](https://jekyll.github.io/minima/)

## 内容一览

Minima 由 `jekyll new-theme` 命令生成，因此包含了让一个全新的 Jekyll 站点零配置运行所需的全部文件和目录。

```
docs/
├── _config.yml              ⚙️ 站点核心配置
├── Gemfile / Gemfile.lock   📦 Ruby 依赖管理
├── README.md                📄 说明文档
│
├── index.md                 🏠 首页内容
├── about.md                 ℹ️ 关于页
├── commands.html            🔍 命令速查交互页（核心功能）
├── 404.html                 ❌ 404 页面
│
├── _layouts/                🎨 页面布局模板
│   ├── default.html         ├─ 根布局（组装 head/header/footer）
│   ├── home.html            ├─ 首页布局
│   ├── page.html            ├─ 普通页面布局
│   └── post.html            └─ 博客文章布局
│
├── _includes/               🧩 可复用片段
│   ├── head.html            ├─ <head>（引 CSS + theme.js）
│   ├── header.html          ├─ 导航栏（含主题切换按钮）
│   ├── footer.html          ├─ 页脚（联系/描述/社交）
│   └── social.html          └─ 社交图标（GitHub/RSS）
│
├── _sass/                   💅 SCSS 样式源
│   ├── minima.scss          ├─ 主入口（导入下面 4 个 partial）
│   └── minima/
│       ├── _base.scss       ├─ 基础元素样式
│       ├── _layout.scss     ├─ 布局样式（header/footer/post）
│       ├── _syntax-highlighting.scss  ├─ 代码高亮
│       └── _theme.scss      └─ ✨ 主题系统（CSS变量+深浅色+按钮）
│
└── assets/                  📁 静态资源
    ├── main.scss            ├─ CSS 入口（@import "minima" → 编译成 main.css）
    ├── data/
    │   └── commands.json    ├─ 🗄️ 命令数据库（速查页数据源）
    ├── icons/
    │   ├── minima-social-icons.svg  ├─ GitHub/RSS 图标
    │   ├── icon-search.svg          ├─ 搜索图标
    │   └── icon-eye.svg             └─ 查看图标
    └── js/
        └── theme.js         └─ 🌓 主题切换逻辑
```

### 布局（Layouts）

指 `_layouts` 目录中的文件，用于定义主题的标记结构。

- `default.html` &mdash; 基础布局，为后续所有布局奠定基础。派生布局会在 `{{ content }}` 这一行将自身内容注入该文件，并通过 [FrontMatter](https://jekyllrb.com/docs/frontmatter/) 声明 `layout: default` 与其关联。
- `home.html` &mdash; 用于着陆页 / 主页 / 索引页的布局。
- `page.html` &mdash; 用于包含 FrontMatter 但不是文章的文档的布局。
- `post.html` &mdash; 用于文章的布局。

### 包含文件（Includes）

指 `_includes` 目录中的代码片段，可以在同一主题 gem 的多个布局（以及另一个包含文件）中插入。

- `footer.html` &mdash; 定义站点的页脚部分。
- `head.html` &mdash; 定义 *default* 布局中 `<head></head>` 部分的代码块。
- `header.html` &mdash; 定义站点的主头部区域。默认情况下，定义了 `title` 属性的页面会在此处显示链接。

### Sass

指 `_sass` 目录中定义主题样式的 `.scss` 文件。

- `minima.scss` &mdash; 由预处理后的 `main.scss` 导入的核心文件，它定义了主题的变量默认值，并进一步导入其他 sass 局部文件以补充自身。
- `minima/_base.scss` &mdash; 重置并为各种 HTML 元素定义基础样式。
- `minima/_layout.scss` &mdash; 定义各种布局的视觉样式。
- `minima/_syntax-highlighting.scss` &mdash; 定义语法高亮的样式。

### 资源文件（Assets）

指 `assets` 目录中的各种资源文件。
其中包含从 `_sass` 目录导入 sass 文件的 `main.scss`。这个 `main.scss` 会被处理成主题的主样式表 `main.css`，由 `_layouts/default.html` 通过 `_includes/head.html` 调用。

该目录可以包含子目录来管理同类型的资源，并会原样复制到最终生成的站点目录中。

### 插件

Minima 预装了 [`jekyll-seo-tag`](https://github.com/jekyll/jekyll-seo-tag) 插件，以确保你的网站获得最有用的 meta 标签。查看[用法](https://github.com/jekyll/jekyll-seo-tag#usage)了解如何配置。

## 用法

### Home 布局

`home.html` 是一个灵活的 HTML 布局，用于站点的着陆页 / 主页 / 索引页。

#### 主标题与内容注入

从 Minima v2.2 开始，*home* 布局会将 `index.md` / `index.html` 中的所有内容注入到 **`Posts`** 标题**之前**。这允许你在着陆页上以一个独立的标题发布与文章无关的内容。*我们建议你使用二级标题（`##`）来命名该部分*。

通常 `site.title` 本身就足以作为着陆页的隐式"主标题"。但是，如果你的着陆页需要显式显示一个标题，只需在文档的 front matter 中定义一个 `title` 变量，它就会以 `<h1>` 标签渲染。

#### 文章列表

从 Minima v2.2 开始，此部分为可选项。
只有当站点包含一篇或多篇有效文章或草稿（如果站点配置了 `show_drafts`）时，才会自动包含此部分。

此部分的标题默认为 `Posts`，以 `<h2>` 标签渲染。你可以通过在文档的 front matter 中定义 `list_title` 变量来自定义此标题。

--

### 自定义

要覆盖 minima 的默认结构和样式，只需在站点根目录创建相应的目录，将你想要自定义的文件复制到该目录，然后编辑该文件即可。
例如，要覆盖 [`_includes/head.html`](_includes/head.html) 文件以指定自定义样式路径，请创建一个 `_includes` 目录，将 minima gem 文件夹中的 `_includes/head.html` 复制到 `<yoursite>/_includes`，然后开始编辑该文件。

站点的默认 CSS 现在已移至 gem 内部的新位置 [`assets/main.scss`](assets/main.scss)。要**覆盖默认 CSS**，该文件必须存在于你的站点源码中。可任选以下方式之一：

- 在站点源码中创建一个新的 `main.scss` 实例。
  - 在 `<your-site>/assets/` 创建一个新文件 `main.scss`
  - 添加 frontmatter 短横线（`---`），并
  - 在 `<your-site>/assets/main.scss` 中添加 `@import "minima";`
  - 添加你的自定义 CSS。
- 从本仓库下载该文件
  - 在 `<your-site>/assets/` 创建一个新文件 `main.scss`
  - 将 [assets/main.scss](assets/main.scss) 的内容复制到你刚创建的 `main.scss` 中，然后随意编辑！
- 直接从 Minima 2.0 gem 复制
  - 前往本地的 minima gem 安装目录（运行 `bundle show minima` 获取其路径）。
  - 将其中的 `assets/` 文件夹复制到 `<your-site>` 的根目录
  - 在 `<your-site>/assets/main.scss` 中修改任何你想要的值

--

### 自定义导航链接

这允许你设置哪些页面显示在导航区域，并配置链接的顺序。

例如，只想链接到 `about` 和 `portfolio` 页面，请在 `_config.yml` 中添加以下内容：

```yaml
header_pages:
  - about.md
  - portfolio.md
```

--

### 更改默认日期格式

你可以通过在 `_config.yml` 中指定 `site.minima.date_format` 来更改默认日期格式。

```
# Minima 日期格式
# 如需自定义，请参考 http://shopify.github.io/liquid/filters/date/
minima:
  date_format: "%b %-d, %Y"
```

--

### 启用评论（通过 Disqus）

可选地，如果你有 Disqus 账户，可以让 Jekyll 使用它在每篇文章下方显示评论区。

要启用它，请在你的 Jekyll 站点中添加以下几行：

```yaml
  disqus:
    shortname: my_disqus_shortname
```

你可以在[这里](https://help.disqus.com/customer/portal/articles/466208)了解更多关于 Disqus shortname 的信息。

评论默认启用，且只会在生产环境中显示，即 `JEKYLL_ENV=production`

如果你不想为某篇文章显示评论，可以在该文章的 YAML Front Matter 中添加 `comments: false` 来禁用。

--

### 启用 Google Analytics（谷歌分析）

要启用 Google Analytics，请在你的 Jekyll 站点中添加以下几行：

```yaml
  google_analytics: UA-NNNNNNNN-N
```

Google Analytics 只会在生产环境中出现，即 `JEKYLL_ENV=production`
