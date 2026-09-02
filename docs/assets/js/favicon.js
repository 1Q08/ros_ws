// ============================================================
// Favicon 跟随主题切换（B4：由 head.html 内联脚本抽离）
// ============================================================
// 功能：
//   1. 根据当前主题（data-theme 或系统偏好）设置 favicon
//   2. 同步更新页眉站点标题图标
//   3. 监听 themechange 事件实时切换
// ============================================================
(function () {
  function applyFavicon(theme) {
    var link = document.getElementById('dynamic-favicon');
    if (!link) return;
    var src = theme === 'dark' ? link.getAttribute('data-dark') : link.getAttribute('data-light');
    if (src) link.href = src;
    // 同步更新页眉站点标题图标
    var titleIcon = document.getElementById('site-title-icon');
    if (titleIcon) {
      var iconSrc = theme === 'dark' ? titleIcon.getAttribute('data-dark') : titleIcon.getAttribute('data-light');
      if (iconSrc) titleIcon.src = iconSrc;
    }
  }
  function detectTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  document.addEventListener('themechange', function (e) {
    applyFavicon(e.detail && e.detail.theme);
  });
  document.addEventListener('DOMContentLoaded', function () {
    applyFavicon(document.documentElement.getAttribute('data-theme') || detectTheme());
  });
})();