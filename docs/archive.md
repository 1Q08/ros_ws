---
layout: page
title: 全部文章
permalink: /archive/
---

<p class="post-list-intro">共 {{ site.posts.size }} 篇教程文章。</p>

<ul class="post-list">
  {%- for post in site.posts -%}
  <li>
    {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
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