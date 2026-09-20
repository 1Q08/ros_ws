// ============================================================
// 通用工具函数（Task 42：由 commands.js 内部函数抽取，供各页面脚本复用）
// ============================================================
// 说明：本文件在 <head> 中以 defer 加载，按文档顺序早于页面脚本
//       （commands.js / giscus.js 等），因此页面脚本可安全依赖 window.AppUtils。
// 挂载：window.AppUtils
// ============================================================
(function (global) {
  'use strict';

  // HTML 转义：动态拼接 innerHTML 前必须转义，防止 HTML 注入
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 防抖：降低高频事件（如搜索输入）的触发频率
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(self, args);
      }, delay);
    };
  }

  // 正则特殊字符转义：把用户输入安全地拼进 RegExp
  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  global.AppUtils = {
    escapeHtml: escapeHtml,
    debounce: debounce,
    escapeRegExp: escapeRegExp
  };
})(window);
