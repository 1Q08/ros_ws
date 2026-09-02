// ============================================================
// 全局主题切换系统
// ============================================================
// 功能：切换浅色/深色主题，使用 localStorage 持久化保存
// 默认：跟随系统偏好，无偏好时使用浅色主题
//
// 说明（G4）：本脚本在 <head> 中同步加载，立即应用已保存的主题，
// 避免首屏先用默认浅色渲染、再闪一下切到深色（FOUC）。
// 按钮图标/文字因依赖 DOM，推迟到 DOMContentLoaded 再补一次。
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
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (e) { /* localStorage 不可用时忽略 */ }

  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(theme);
}

// 切换主题（点击按钮时触发）
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
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
  // 设置 HTML 根元素属性
  document.documentElement.setAttribute('data-theme', theme);

  // 保存到 localStorage（不可用时静默失败）
  try {
    localStorage.setItem('theme', theme);
  } catch (e) { /* 忽略 */ }

  // 更新按钮（DOM 未就绪时 getElementById 返回 null，安全跳过）
  updateThemeButton(theme);

  // 通知 favicon 等依赖主题的组件同步更新
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
}

// 立即应用主题，消除首屏闪烁（G4）
initTheme();

// 页面 DOM 就绪后补一次按钮文案（此时按钮元素才存在）
document.addEventListener('DOMContentLoaded', function () {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeButton(theme);
});
