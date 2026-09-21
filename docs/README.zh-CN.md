<p align="center">
  <a href="https://github.com/1Q08/ros_ws">
    <img src="assets/icons/favicon.svg" alt="Logo" width="80" height="80">
  </a>
</p>

<!-- PROJECT SHIELDS -->
<p align="center">
  <a href="https://github.com/1Q08/ros_ws/graphs/contributors"><img src="https://img.shields.io/github/contributors/1Q08/ros_ws.svg?style=flat-square" alt="Contributors"></a>
  <a href="https://github.com/1Q08/ros_ws/network/members"><img src="https://img.shields.io/github/forks/1Q08/ros_ws.svg?style=flat-square" alt="Forks"></a>
  <a href="https://github.com/1Q08/ros_ws/stargazers"><img src="https://img.shields.io/github/stars/1Q08/ros_ws.svg?style=flat-square" alt="Stargazers"></a>
  <a href="https://github.com/1Q08/ros_ws/issues"><img src="https://img.shields.io/github/issues/1Q08/ros_ws.svg?style=flat-square" alt="Issues"></a>
  <a href="https://github.com/1Q08/ros_ws/blob/main/LICENSE"><img src="https://img.shields.io/github/license/1Q08/ros_ws.svg?style=flat-square" alt="Apache 2.0 License"></a>
  <a href="https://github.com/1Q08/ros_ws/watchers"><img src="https://img.shields.io/github/watchers/1Q08/ros_ws.svg?style=flat-square" alt="Watchers"></a>
  <a href="https://github.com/1Q08/ros_ws"><img src="https://img.shields.io/github/repo-size/1Q08/ros_ws.svg?style=flat-square" alt="Repo Size"></a>
  <a href="https://github.com/1Q08/ros_ws/commits/main"><img src="https://img.shields.io/github/commit-activity/m/1Q08/ros_ws.svg?style=flat-square" alt="Commit Activity"></a>
  <a href="https://1q08.github.io/ros_ws/"><img src="https://img.shields.io/website?url=https%3A%2F%2F1q08.github.io%2Fros_ws%2F&style=flat-square" alt="Website"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>

<h1 align="center">ROS 命令速查</h1>

<p align="center">一个开源的 <strong>ROS 1 / ROS 2 命令行参考工具</strong>，基于 Jekyll + GitHub Pages 构建，提供交互式命令浏览器，支持中英双语与深浅色主题</p>

<blockquote>
<p align="center">本网站完全由 Kimi K3、Claude Opus 4.8、Deepseek V4 等开源 AI 模型生成，内容仅供参考，若有错误请联系作者纠正</p>
</blockquote>

<!-- PROJECT LINKS -->
<p align="center">
  <a href="https://1q08.github.io/ros_ws/"><strong>浏览网站 »</strong></a>
</p>
<p align="center">
  <a href="https://github.com/1Q08/ros_ws/issues">报告 Bug</a>
  ·
  <a href="https://github.com/1Q08/ros_ws/issues">请求功能</a>
</p>

---

## 📁 项目架构

```
docs/                              # Jekyll 站点根目录
├── _config.yml                   # 站点配置：标题 / 导航 / 插件 / 排除清单
├── Gemfile / Gemfile.lock        # Ruby 依赖（github-pages 环境）
├── README.md / README.zh-CN.md   # 中英文说明文档（本项目）
├── _data/                        # 构建期数据：stats.yml 统计 + commands_ui.yml 界面文案
├── tools/check_commands.py       # 命令数据一致性校验脚本（不发布）
├── index.md                      # 首页（home 布局）
├── about.md                      # 关于页
├── commands.html                 # 命令速查交互页（核心功能）
├── archive.md                    # 文章归档页
├── 404.html                      # 自定义 404（ROS 终端风格）
├── en/                           # 英文页面（挂载于 /en/，暂无 archive.md）
├── _posts/                       # 博客文章（Markdown，仅中文）
├── _layouts/                     # 布局：default / home / page / post
├── _includes/                    # 片段：head / header / footer / lang-switcher / 速查页骨架 / giscus
├── _sass/                        # 样式：minima.scss + _base / _layout / _syntax-highlighting / _theme
└── assets/                       # 静态资源
    ├── main.scss                 # CSS 入口（@import "minima" → main.css）
    ├── data/                     # commands.json（中文源）+ commands.en.json（英文翻译）
    ├── icons/                    # 图标：favicon（浅/深）+ 社交 / 搜索 / 浏览 / 排序 / 评论
    ├── js/                       # 脚本：lib/ 共享模块 + 各页面脚本（主题 / 目录 / mermaid / 速查等）
    └── css/                      # 页面样式：commands / about / 404

_site/                             # Jekyll 编译输出（自动生成，不手动编辑）
```

---

## 🔍 命令速查核心页

**页面结构**（4 个区域）：

| 区域       | 功能                                                               |
| ---------- | ------------------------------------------------------------------ |
| 搜索区域   | 实时搜索 + 结果列表 + 点击弹出详情卡片                             |
| 分类浏览   | 四级联动下拉框：ROS 版本 → 发行版 → 命令分类 → 具体命令             |
| 命令速查表 | 折叠面板，一键展开查看全部命令概览（版本/分类/命令/说明）          |
| 命令详情   | 显示命令名称、代码块（含 `<param>` 占位符）、说明、示例、注意事项 |

---

## 命令数据库

`assets/data/commands.json` 为中文源，`commands.en.json` 为其逐条英文翻译（结构完全一致）；每条命令包含 `display` / `title` / `cmd` / `desc` / `example` / `options` / `notes` / `distros` 字段。

**命令统计**：

| 版本           | 分类数       | 命令总数     |
| -------------- | ------------ | ------------ |
| ROS 1          | 7            | 26           |
| ROS 2          | 18           | 102          |
| **合计**       | **25**       | **128**      |

---

## 本地开发

依赖 Ruby 3.2+ 与 Bundler（完整清单见 `Gemfile`）：

```bash
cd docs && bundle install
bundle exec jekyll serve --baseurl=""   # 本地访问 http://127.0.0.1:4000
```

> giscus 评论区依赖外网服务，本地沙箱预览可能不显示，部署到 GitHub Pages 后即可正常加载。

**扩展指南**：

- 新增命令：在 `assets/data/commands.json` 与 `commands.en.json` 的同一位置各加一条（结构须一致），同步 `_data/stats.yml` 计数后运行 `python3 tools/check_commands.py` 校验
- 新增分类：在两个 JSON 的对应版本对象中添加键即可，会自动出现在分类下拉框中（无需修改 JS）
- 新增页面：使用 `layout: page`，需要专属样式/脚本时声明 `custom_css` / `custom_js`，并加入 `_config.yml` 的 `header_pages`
- 新增英文页：放在 `en/` 目录下，front matter 声明 `lang: en` 与 `permalink: /en/xxx/`，并在 `_includes/header.html` 中补上导航项
- 新增文章：`_posts/YYYY-MM-DD-slug.md`，front matter 使用 `layout: post` / `title` / `date` / `categories` / `author` / `excerpt`；正文可直接写 `mermaid` 代码块（自动跟随深浅色模式）

---

## 许可

本项目基于 Apache License 2.0 开源。详见项目根目录的 [LICENSE](../LICENSE) 文件

