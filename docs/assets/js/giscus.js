// ============================================================
// giscus 评论区懒加载脚本（E2：由 _layouts/home.html 内联脚本抽取）
// ============================================================
// 功能：
//   1. 点击「查看评论」按钮后才加载 giscus，避免首屏被 widget 请求拖慢
//   2. 加载失败可重试；15 秒超时保护；bfcache 防重复渲染
//   3. 跟随站点主题切换（themechange 事件）更新 giscus 主题
// 依赖：页面内 .giscus 容器与 #giscus-load-btn 按钮（仅中文首页渲染）
// ============================================================
(function () {
  'use strict';

  function resolveTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function giscusThemeName(theme) {
    return theme === 'dark' ? 'noborder_dark' : 'noborder_light';
  }

  var loaded = false;

  // 动态创建 giscus client 脚本，配置全部写在 script 标签的 data-* 上（client.js 读取位置）
  function loadGiscus(onError) {
    // 防重复：已加载过，或 iframe/脚本已存在时直接返回（避免 bfcache 返回时重复渲染）
    if (loaded) return;
    if (document.querySelector('iframe.giscus-frame') || document.querySelector('script[data-giscus]')) return;
    loaded = true;

    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.setAttribute('data-repo', '1Q08/ros_ws');
    s.setAttribute('data-repo-id', 'R_kgDOTF12Rw');
    s.setAttribute('data-category', 'Announcements');
    s.setAttribute('data-category-id', 'DIC_kwDOTF12R84DESZv');
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '1');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', giscusThemeName(resolveTheme()));
    s.setAttribute('data-lang', 'zh-CN');
    s.setAttribute('data-loading', 'lazy');
    s.setAttribute('data-giscus', '');
    s.crossOrigin = 'anonymous';
    s.async = true;

    // 加载失败时允许重试：清理失败的脚本并通知调用方恢复按钮
    s.onerror = function () {
      resetLoadState();
      if (onError) onError();
    };

    // 插到 .giscus 容器之后，giscus client.js 会用它前面的 .giscus 作为渲染容器
    var container = document.querySelector('.giscus');
    if (container && container.parentElement) {
      container.parentElement.insertBefore(s, container.nextSibling);
    } else {
      document.body.appendChild(s);
    }
  }

  // 从 iframe 实际地址推导目标 origin，避免硬编码导致 postMessage 失败
  function giscusTargetOrigin(frame) {
    try {
      var a = document.createElement('a');
      a.href = frame.src;
      return a.origin || 'https://giscus.app';
    } catch (e) {
      return 'https://giscus.app';
    }
  }

  // 主题切换时，通知已加载的 giscus iframe 更新主题
  function applyGiscusTheme(theme) {
    var name = giscusThemeName(theme);
    var frame = document.querySelector('iframe.giscus-frame');
    if (frame && frame.src) {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: name } } },
        giscusTargetOrigin(frame)
      );
    }
  }

  var loadBtn = document.getElementById('giscus-load-btn');
  var readyTimer = null;
  var readyObserver = null;

  // 清理失败的加载状态，允许重新加载
  function resetLoadState() {
    loaded = false;
    var old = document.querySelector('script[data-giscus]');
    if (old && old.parentNode) {
      old.parentNode.removeChild(old);
    }
    if (readyObserver) {
      readyObserver.disconnect();
      readyObserver = null;
    }
  }

  function showBtnLoading() {
    if (!loadBtn) return;
    loadBtn.disabled = true;
    var text = loadBtn.querySelector('.giscus-load-text');
    if (text) text.textContent = '加载中…';
  }

  function showBtnRetry() {
    if (!loadBtn) return;
    loadBtn.disabled = false;
    var text = loadBtn.querySelector('.giscus-load-text');
    if (text) text.textContent = '加载失败，点击重试';
  }

  function hideBtn() {
    if (loadBtn && loadBtn.parentElement) {
      loadBtn.parentElement.removeChild(loadBtn);
    }
  }

  // 监听 .giscus 容器出现 iframe 即视为加载成功，隐藏按钮
  function watchGiscusReady() {
    var container = document.querySelector('.giscus');
    if (!container) return;
    if (document.querySelector('iframe.giscus-frame')) {
      hideBtn();
      return;
    }
    if (readyObserver) {
      readyObserver.disconnect();
    }
    readyObserver = new MutationObserver(function () {
      if (document.querySelector('iframe.giscus-frame')) {
        readyObserver.disconnect();
        readyObserver = null;
        hideBtn();
      }
    });
    readyObserver.observe(container, { childList: true, subtree: true });
  }

  // 超时保护：15 秒内未渲染出 iframe 则恢复按钮，允许重试
  function armReadyTimeout() {
    clearTimeout(readyTimer);
    readyTimer = setTimeout(function () {
      if (document.querySelector('iframe.giscus-frame')) return;
      resetLoadState();
      showBtnRetry();
    }, 15000);
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', function () {
      showBtnLoading();
      watchGiscusReady();
      loadGiscus(function () {
        // client.js 加载失败：恢复按钮
        clearTimeout(readyTimer);
        showBtnRetry();
      });
      armReadyTimeout();
    });
  } else {
    loadGiscus(); // 兜底：找不到按钮时立即加载
  }

  // 监听主题切换按钮（theme.js 触发 themechange 事件）
  document.addEventListener('themechange', function (e) {
    applyGiscusTheme(e.detail && e.detail.theme);
  });
})();