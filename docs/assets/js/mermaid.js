// ============================================================
// Mermaid 图表渲染
// ============================================================
// 背景：文章正文用 ```mermaid 代码块描述流程图与时序图，Jekyll 只会把它
//       输出成 <pre><code class="language-mermaid">…</code></pre>，浏览器不认
//       这个语言，读者看到的是一段源码而不是图。
// 做法：本脚本把这些代码块换成 <div class="mermaid">，再按需从 CDN 取
//       mermaid 本体，按当前主题渲染成 SVG。
// 加载：head.html 中 defer 加载。页面上没有 mermaid 代码块时立即返回，
//       既不碰 DOM 也不请求 CDN，因此对其它页面零开销。
// 降级：CDN 不可用时直接返回，原始代码块原样保留，不影响阅读。
// 主题：监听 .themechange 事件重绘，深色模式使用 mermaid 的 dark 主题。
// 依赖：window.ThemeCore（assets/js/lib/theme-core.js）
// ============================================================
(function () {
  'use strict';

  var CDN_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  var SELECTOR = 'pre > code.language-mermaid';

  // [{ node: 当前 DOM 中的节点, text: 图定义源码 }]
  var diagrams = [];
  var mermaidPromise = null;

  // 按需加载 mermaid 本体；失败结果同样缓存，避免反复请求
  function loadMermaid() {
    if (!mermaidPromise) mermaidPromise = import(CDN_URL);
    return mermaidPromise;
  }

  // 当前主题对应的 mermaid 内置主题名
  function themeName() {
    var theme = (window.ThemeCore && window.ThemeCore.currentTheme()) || 'light';
    return theme === 'dark' ? 'dark' : 'default';
  }

  // 用全新的容器替换节点，并把图定义写回去
  // （重绘时必须换新节点：mermaid 已把旧节点内容替换成 SVG）
  function mount(item) {
    var container = document.createElement('div');
    container.className = 'mermaid';
    container.textContent = item.text;
    if (item.node && item.node.parentNode) {
      item.node.parentNode.replaceChild(container, item.node);
    }
    item.node = container;
    return container;
  }

  // 渲染全部图表并返回 Promise
  function render() {
    return loadMermaid().then(function (mod) {
      var mermaid = mod.default || mod;
      mermaid.initialize({
        startOnLoad: false,
        theme: themeName(),
        securityLevel: 'strict'
      });
      var nodes = [];
      for (var i = 0; i < diagrams.length; i++) nodes.push(mount(diagrams[i]));
      return mermaid.run({ nodes: nodes, suppressErrors: true });
    });
  }

  function init() {
    var codes = document.querySelectorAll(SELECTOR);
    if (!codes.length) return;

    for (var i = 0; i < codes.length; i++) {
      diagrams.push({ node: codes[i].parentNode, text: codes[i].textContent });
    }

    render().catch(function () {
      /* CDN 不可用：保留原始代码块 */
    });
  }

  // 主题切换后重绘，保证配色与页面一致
  document.addEventListener('themechange', function () {
    if (!diagrams.length) return;
    render().catch(function () { /* 忽略：保留上一次的渲染结果 */ });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
