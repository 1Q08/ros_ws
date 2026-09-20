/**
 * 文章详情页右侧目录（TOC）
 * ------------------------------------------------------------------
 * 由 _layouts/post.html 以 <script src=".../toc.js" defer> 引入。
 *
 * 职责：
 *   1. 扫描 .post-content 下的 h2，生成右侧目录链接
 *      （标题 id 由 kramdown 的 auto_ids 自动生成，若缺失则兜底补 toc-N）
 *   2. 滚动时高亮当前所在章节
 *   3. 窄屏（≤800px）把目录变成右侧抽屉，由悬浮按钮开合
 *
 * 设计取舍：
 *   - 标题少于 2 个时完全不显示目录，避免短文出现空侧栏
 *   - .post-toc / .post-toc-toggle 在 HTML 里带 hidden，JS 成功生成后才移除，
 *     这样禁用 JS 时不会留下空壳
 *   - 只列 h2：6 篇文章的 h2 数量为 5–11，h3 为 10–16，只列 h2 目录更清爽
 */
(function () {
  'use strict';

  function init() {
    var content = document.querySelector('.post-content');
    var aside = document.getElementById('post-toc');
    var nav = document.getElementById('post-toc-nav');
    var toggle = document.getElementById('post-toc-toggle');

    if (!content || !aside || !nav) {
      return;
    }

    var headings = content.querySelectorAll('h2');

    // 标题太少就没必要做目录
    if (headings.length < 2) {
      return;
    }

    var links = [];
    var fragment = document.createDocumentFragment();

    Array.prototype.forEach.call(headings, function (heading, index) {
      var id = heading.id;

      if (!id) {
        id = 'toc-' + (index + 1);
        heading.id = id;
      }

      var link = document.createElement('a');
      link.className = 'post-toc__link';
      link.href = '#' + id;
      link.setAttribute('data-target', id);
      link.textContent = heading.textContent.replace(/\s+/g, ' ').trim();

      fragment.appendChild(link);
      links.push(link);
    });

    nav.appendChild(fragment);
    aside.hidden = false;

    if (toggle) {
      toggle.hidden = false;
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- 滚动高亮 ---------------- */

    var activeLink = null;

    function setActive(link) {
      if (activeLink === link) {
        return;
      }
      if (activeLink) {
        activeLink.classList.remove('is-active');
      }
      activeLink = link;
      if (activeLink) {
        activeLink.classList.add('is-active');
      }
    }

    function updateActive() {
      var current = links[0];

      for (var i = 0; i < links.length; i++) {
        var el = document.getElementById(links[i].getAttribute('data-target'));
        if (!el) {
          continue;
        }
        // 标题顶边越过视口上方 100px 线，就算「已进入该章节」
        if (el.getBoundingClientRect().top - 100 <= 0) {
          current = links[i];
        } else {
          break;
        }
      }

      setActive(current);
    }

    var ticking = false;

    function onScroll() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        updateActive();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();

    /* ---------------- 窄屏抽屉 ---------------- */

    function openDrawer() {
      aside.classList.add('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = '关闭';
      }
    }

    function closeDrawer() {
      if (!aside.classList.contains('is-open')) {
        return;
      }
      aside.classList.remove('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '目录';
      }
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (aside.classList.contains('is-open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    // 点击抽屉和按钮以外的区域收起
    document.addEventListener('click', function (event) {
      if (!aside.classList.contains('is-open')) {
        return;
      }
      if (aside.contains(event.target) || (toggle && toggle.contains(event.target))) {
        return;
      }
      closeDrawer();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    });

    // 宽窄屏切换时复位，避免桌面端残留 is-open
    var mq = window.matchMedia('(max-width: 800px)');
    var onMqChange = function () {
      closeDrawer();
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', onMqChange);
    } else if (mq.addListener) {
      mq.addListener(onMqChange);
    }

    /* ---------------- 点击跳转 ---------------- */

    nav.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('.post-toc__link') : null;

      if (!link) {
        return;
      }

      var target = document.getElementById(link.getAttribute('data-target'));

      if (!target) {
        return;
      }

      event.preventDefault();

      var top = target.getBoundingClientRect().top + window.pageYOffset - 16;

      window.scrollTo({
        top: top,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + target.id);
      }

      setActive(link);
      closeDrawer();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
