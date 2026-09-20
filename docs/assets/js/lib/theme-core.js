// ============================================================
// 主题解析核心（Task 42：消除 theme.js / favicon.js / giscus.js 三处重复实现）
// ============================================================
// 说明：本脚本在 <head> 中同步（阻塞）加载，必须先于 theme.js 执行，
//       以保证首屏立即应用已保存的主题，避免浅色闪烁（FOUC）。
// 挂载：window.ThemeCore
// 解析优先级：localStorage > 系统偏好 > 浅色
// ============================================================
(function (global) {
  'use strict';

  var STORAGE_KEY = 'theme';

  // 读取已保存的主题；非法值或 localStorage 不可用时返回 null
  function readStoredTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) { /* localStorage 不可用时忽略 */ }
    return null;
  }

  // 系统偏好主题；不支持 matchMedia 时按浅色处理
  function systemTheme() {
    var prefersDark = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  // 解析当前应使用的主题
  function resolveTheme() {
    return readStoredTheme() || systemTheme();
  }

  // 保存主题（失败静默）
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* 忽略 */ }
  }

  // 当前生效主题：以 DOM 上已应用的 data-theme 为准，缺省时再解析
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || resolveTheme();
  }

  global.ThemeCore = {
    readStoredTheme: readStoredTheme,
    systemTheme: systemTheme,
    resolveTheme: resolveTheme,
    saveTheme: saveTheme,
    currentTheme: currentTheme
  };
})(window);
