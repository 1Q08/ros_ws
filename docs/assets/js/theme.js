// ============================================================
// 全局主题切换系统
// ============================================================
// 功能：切换浅色/深色主题，使用 localStorage 持久化保存
// 默认：跟随系统偏好，无偏好时使用浅色主题
//
// 说明（G4）：本脚本在 <head> 中同步加载，立即应用已保存的主题，
// 避免首屏先用默认浅色渲染、再闪一下切到深色（FOUC）。
// 按钮图标/文字因依赖 DOM，推迟到 DOMContentLoaded 再补一次。
//
// 依赖：window.ThemeCore（assets/js/lib/theme-core.js，已在本文件之前同步加载）
// ============================================================

// 国际化：根据页面语言（<html lang>）选择按钮文案（F3）
const THEME_PAGE_LANG = (document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh';

const THEME_I18N = {
  zh: {
    darkLabel: '浅色模式',
    lightLabel: '深色模式',
    icons: { dark: '☀️', light: '🌙' }
  },
  en: {
    darkLabel: 'Light mode',
    lightLabel: 'Dark mode',
    icons: { dark: '☀️', light: '🌙' }
  }
};

// 初始化主题：localStorage > 系统偏好 > 默认浅色
function initTheme() {
  setTheme(ThemeCore.resolveTheme());
}

// 主题切换过渡（样式见 _sass/minima/_theme.scss 第 14 节）
// 切换瞬间给 <html> 加一个类，让整棵 DOM 用同一条 0.2s 颜色过渡，
// 使深浅色切换不再「一部分淡出、一部分瞬切」；
// 略大于过渡时长的 240ms 后移除，避免长期接管元素自己的过渡
// （悬停位移、抽屉滑动等）。
const THEME_TRANSITION_MS = 240;
let themeTransitionTimer = null;

function startThemeTransition() {
  // 首屏：theme.js 在 <head> 中同步执行时 <body> 尚未解析，
  // 此时元素都还不存在，不需要过渡（加了也不会看到效果）。
  if (!document.body) return;

  const root = document.documentElement;
  root.classList.add('theme-transitioning');

  if (themeTransitionTimer !== null) clearTimeout(themeTransitionTimer);
  themeTransitionTimer = setTimeout(function () {
    root.classList.remove('theme-transitioning');
    themeTransitionTimer = null;
  }, THEME_TRANSITION_MS);
}

// 切换主题（点击按钮时触发）
function toggleTheme() {
  setTheme(ThemeCore.currentTheme() === 'light' ? 'dark' : 'light');
}

// 更新按钮图标和文字（依赖 DOM，按语言翻译）
function updateThemeButton(theme) {
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (!icon || !text) return;

  const labels = THEME_I18N[THEME_PAGE_LANG];
  if (theme === 'dark') {
    icon.textContent = labels.icons.dark;
    text.textContent = labels.darkLabel;
  } else {
    icon.textContent = labels.icons.light;
    text.textContent = labels.lightLabel;
  }
}

// 设置主题
function setTheme(theme) {
  // 先开启全站统一过渡（必须在改属性之前，否则过渡不生效）
  startThemeTransition();

  // 设置 HTML 根元素属性
  document.documentElement.setAttribute('data-theme', theme);

  // 保存到 localStorage（不可用时静默失败）
  ThemeCore.saveTheme(theme);

  // 更新按钮（DOM 未就绪时 getElementById 返回 null，安全跳过）
  updateThemeButton(theme);

  // 通知 favicon 等依赖主题的组件同步更新
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
}

// 立即应用主题，消除首屏闪烁（G4）
initTheme();

// 页面 DOM 就绪后补一次按钮文案（此时按钮元素才存在）
document.addEventListener('DOMContentLoaded', function () {
  updateThemeButton(ThemeCore.currentTheme());
});
