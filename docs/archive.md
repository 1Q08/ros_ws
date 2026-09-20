---
layout: page
title: 全部文章
permalink: /archive/
---

<p class="post-list-intro">共 {{ site.posts.size }} 篇教程文章。</p>

<ul class="post-list">
  {%- for post in site.posts -%}
  <li>
    {%- assign date_format = site.minima.date_format_cn | default: "%Y-%m-%d" -%}
    <span class="post-meta">{{ post.date | date: date_format }}</span>
    <h3>
      <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
    </h3>
    {%- if site.show_excerpts -%}
      <div class="post-excerpt">
        {{ post.excerpt }}
      </div>
    {%- endif -%}
  </li>
  {%- endfor -%}
</ul>

<section class="giscus-wrapper">
  <button type="button" class="giscus-load-btn" id="giscus-load-btn">
    <span class="giscus-load-icon" aria-hidden="true"></span>
    <span class="giscus-load-text">查看评论</span>
  </button>
  <div class="giscus"></div>
  <script src="{{ "/assets/js/giscus.js" | relative_url }}" defer></script>
</section>