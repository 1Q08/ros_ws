---
layout: page
title: 关于
permalink: /about/
custom_css: /assets/css/about.css
---

<p class="about-intro">
  <strong>ROS 命令速查</strong> 是一个面向机器人开发者的轻量级参考站点，收录了 ROS 1 与 ROS 2 中最常用的命令行指令。
</p>

<div class="about-stats">
  <div class="stat-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">ros — stats</span>
    </div>
    <div class="stat-body">
      <span class="stat-number">{{ site.data.stats.commands }}</span>
      <span class="stat-label">常用命令</span>
    </div>
  </div>
  <div class="stat-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">ros — stats</span>
    </div>
    <div class="stat-body">
      <span class="stat-number">{{ site.data.stats.categories }}</span>
      <span class="stat-label">命令分类</span>
    </div>
  </div>
  <div class="stat-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">ros — stats</span>
    </div>
    <div class="stat-body">
      <span class="stat-number">{{ site.data.stats.versions }}</span>
      <span class="stat-label">支持版本</span>
    </div>
  </div>
</div>

<div class="about-cards">
  <div class="about-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">🛠️ 维护方式</span>
    </div>
    <div class="card-body">
      <ul>
        <li>内容以 Markdown 编写，托管在 GitHub Pages。</li>
        <li>欢迎提交 Issue 或 PR 补充你常用的命令。</li>
      </ul>
    </div>
  </div>
  <div class="about-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">⚙️ 技术栈</span>
    </div>
    <div class="card-body">
      <ul>
        <li>Jekyll + minima 主题</li>
        <li>GitHub Pages 自动部署</li>
      </ul>
    </div>
  </div>
  <div class="about-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">📮 联系方式</span>
    </div>
    <div class="card-body">
      <ul>
        <li>GitHub: <a href="https://github.com/1q08">1Q08</a></li>
      </ul>
    </div>
  </div>
</div>

<div class="about-changelog">
  <div class="changelog-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">🕒 更新记录</span>
    </div>
    <div class="card-body changelog-body">
      <ul class="changelog-list">
        <li><span class="cl-date">2026-09-02</span> 重构命令数据文件、修复 giscus 评论区概率性填充不完全、优化项目代码</li>
        <li><span class="cl-date">2026-08-28</span> 新增英文版站点（`/en/`），优化命令速查表体验，美化主页与关于页面</li>
        <li><span class="cl-date">2026-08-27</span> 首页新增 giscus 评论区（懒加载 + 深浅色切换）、全站背景粒子动画、404 页面升级为 ROS 终端风格、页脚访问量徽章</li>
        <li><span class="cl-date">2026-08-26</span> 新增代码块复制、favicon 图标（跟随深浅色），优化首页内容与外链</li>
        <li><span class="cl-date">2026-08-21</span> 新增三篇教程文章</li>
        <li><span class="cl-date">2026-08-14</span> 新增 `ros2 component` / `ros2 doctor` 相关命令</li>
        <li><span class="cl-date">2026-08-06</span> 新增 `ros2 pkg` 相关命令</li>
        <li><span class="cl-date">2026-08-04</span> 新增多条命令及详情，优化页脚与代码块样式</li>
        <li><span class="cl-date">2026-07-29</span> 站点基本成形，首次发布页面</li>
      </ul>
    </div>
  </div>
</div>
