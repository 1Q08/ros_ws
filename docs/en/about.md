---
layout: page
lang: en
title: About
description: About this open-source ROS 1 / ROS 2 command reference project.
permalink: /en/about/
custom_css: /assets/css/about.css
---

<p class="about-intro">
  <strong>ROS Command Reference</strong> is a lightweight reference site for robotics developers, collecting the most commonly used command-line tools in ROS 1 and ROS 2.
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
      <span class="stat-label">Commands</span>
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
      <span class="stat-label">Categories</span>
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
      <span class="stat-label">ROS Versions</span>
    </div>
  </div>
</div>

<div class="about-cards">
  <div class="about-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">🛠️ Maintenance</span>
    </div>
    <div class="card-body">
      <ul>
        <li>Content is written in Markdown and hosted on GitHub Pages.</li>
        <li>Issues and pull requests are welcome to add your frequently used commands.</li>
      </ul>
    </div>
  </div>
  <div class="about-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">⚙️ Tech Stack</span>
    </div>
    <div class="card-body">
      <ul>
        <li>Jekyll + minima theme</li>
        <li>Automatic deployment via GitHub Pages</li>
      </ul>
    </div>
  </div>
  <div class="about-card">
    <div class="term-bar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="term-title">📮 Contact</span>
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
      <span class="term-title">🕒 Changelog</span>
    </div>
    <div class="card-body changelog-body">
      <ul class="changelog-list">
        <li><span class="cl-date">2026-09-02</span> Refactored command data, fixed giscus comments occasionally rendering incompletely, and optimized the codebase</li>
        <li><span class="cl-date">2026-08-28</span> Added the English site (`/en/`), improved the command cheatsheet experience, and beautified the home &amp; about pages</li>
        <li><span class="cl-date">2026-08-27</span> Added giscus comments (lazy loading + theme switching), a full-site particle background, a ROS-terminal-style 404 page, and a traffic badge in the footer</li>
        <li><span class="cl-date">2026-08-26</span> Added code block copy and a theme-aware favicon; improved home page content and external links</li>
        <li><span class="cl-date">2026-08-21</span> Added three tutorial articles</li>
        <li><span class="cl-date">2026-08-14</span> Added `ros2 component` / `ros2 doctor` commands</li>
        <li><span class="cl-date">2026-08-06</span> Added `ros2 pkg` commands</li>
        <li><span class="cl-date">2026-08-04</span> Added multiple commands and details; improved footer and code block styles</li>
        <li><span class="cl-date">2026-07-29</span> Initial release: first version of the site published</li>
      </ul>
    </div>
  </div>
</div>
