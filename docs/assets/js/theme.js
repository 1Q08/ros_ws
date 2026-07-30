// ============================================================
// 全局主题切换系统
// ============================================================
// 功能：切换浅色/深色主题，使用 localStorage 持久化保存
// 默认：跟随系统偏好，无偏好时使用浅色主题
// ============================================================

// 初始化主题（页面加载时执行）
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
});

// 初始化主题
function initTheme() {
  // 从 localStorage 读取保存的主题，或检测系统偏好
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // 决定初始主题：localStorage > 系统偏好 > 默认浅色
  let theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  // 应用主题
  setTheme(theme);
}

// 切换主题（点击按钮时触发）
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// 设置主题
function setTheme(theme) {
  // 设置 HTML 根元素属性
  document.documentElement.setAttribute('data-theme', theme);
  
  // 保存到 localStorage
  localStorage.setItem('theme', theme);
  
  // 更新按钮图标和文字
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  
  if (icon && text) {
    if (theme === 'dark') {
      icon.textContent = '☀️';
      text.textContent = '浅色模式';
    } else {
      icon.textContent = '🌙';
      text.textContent = '深色模式';
    }
  }
}
