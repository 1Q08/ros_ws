/**
 * 背景粒子漂浮动画
 * ============================================================
 * 全站生效，采用 Canvas 绘制少量低透明度光点，缓慢漂移。
 *
 * 特性：
 *  - 数量少（DENSITY 乘以屏幕面积）、尺寸小、透明度低，视觉低调
 *  - 颜色通过 CSS 变量 --particle-color 控制，深浅色模式自动适配
 *    （监听站点已有的 themechange 自定义事件，与 favicon/主题同步）
 *  - 尊重系统「减少动态效果」偏好（prefers-reduced-motion）：
 *    开启时只绘制一帧静止粒子，不运行动画循环
 *  - 响应窗口尺寸变化，按设备像素比（DPR）缩放保证清晰度
 */
(function () {
  'use strict';

  var canvas = document.getElementById('bg-particles');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 每 8000 平方像素约 1 个粒子，毛估上限 130 个
  var DENSITY = 1 / 8000;
  var MAX_COUNT = 130;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;
  var particles = [];
  var color = readColor();

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* 忽略 */ }

  // 从 CSS 变量读取粒子颜色（--particle-color），取不到时回退到主文字色
  function readColor() {
    var root = document.documentElement;
    var style = window.getComputedStyle(root);
    var c = (style.getPropertyValue('--particle-color') || '').trim();
    if (!c) {
      c = (style.getPropertyValue('--text-primary') || '').trim();
    }
    return c || '#5a6a78';
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initParticles() {
    var count = Math.min(Math.floor((W * H) * DENSITY), MAX_COUNT);
    particles = [];
    for (var i = 0; i < count; i++) {
      // 大小分层：85% 小粒子、12% 中粒子、3% 大光点
      var roll = Math.random();
      var radius, alpha, glow;
      if (roll < 0.85) {
        radius = Math.random() * 1.6 + 0.7;      // 小粒子 0.7 ~ 2.3 px
        alpha = Math.random() * 0.3 + 0.25;       // 透明度 0.25 ~ 0.55
        glow = 0;
      } else if (roll < 0.97) {
        radius = Math.random() * 2.4 + 2.4;       // 中粒子 2.4 ~ 4.8 px
        alpha = Math.random() * 0.35 + 0.35;      // 透明度 0.35 ~ 0.7
        glow = radius * 2;                        // 带轻微光晕
      } else {
        radius = Math.random() * 3 + 4;           // 大光点 4 ~ 7 px
        alpha = Math.random() * 0.3 + 0.55;       // 透明度 0.55 ~ 0.85
        glow = radius * 3.5;                      // 明显光晕
      }

      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: radius,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        a: alpha,
        glow: glow,
        tw: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var t = Date.now() / 1000;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      // 透明度随相位微微起伏，更有「呼吸感」
      var alpha = p.a * (0.7 + 0.3 * Math.sin(t * 0.6 + p.tw));
      if (alpha <= 0) continue;

      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.fillStyle = color;

      if (p.glow > 0) {
        // 发光光晕：使用径向渐变，中心实心、向外淡出
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r + p.glow);
        grad.addColorStop(0, colorToRgba(color, 1));
        grad.addColorStop(0.4, colorToRgba(color, 0.25));
        grad.addColorStop(1, colorToRgba(color, 0));
        ctx.globalAlpha = Math.min(alpha, 1);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + p.glow, 0, Math.PI * 2);
        ctx.fill();
      }

      // 实心亮点
      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 将颜色字符串（#hex / rgb() / rgba()）转换为 rgba 字符串，用于光晕渐变
  function colorToRgba(colorStr, alpha) {
    var s = colorStr.trim();

    // 支持 #rgb / #rrggbb
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var r = parseInt(h.slice(0, 2), 16);
      var g = parseInt(h.slice(2, 4), 16);
      var b = parseInt(h.slice(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    // 支持 rgb(r,g,b) / rgba(r,g,b,a)（a 忽略，统一用传入的 alpha）
    var m2 = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(s);
    if (m2) {
      return 'rgba(' + m2[1] + ',' + m2[2] + ',' + m2[3] + ',' + alpha + ')';
    }

    return 'rgba(90,110,130,' + alpha + ')';
  }

  function step() {
    var t = Date.now() / 1000;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      // 极慢漂移 + 极轻微的正弦摆动
      p.x += p.vx + Math.sin(t * 0.3 + p.tw) * 0.03;
      p.y += p.vy + Math.cos(t * 0.3 + p.tw) * 0.03;

      if (p.x < -10) p.x = W + 10;
      else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      else if (p.y > H + 10) p.y = -10;
    }
    draw();
    requestAnimationFrame(step);
  }

  // 深浅色切换时更新颜色（站点已有 themechange 事件）
  document.addEventListener('themechange', function () {
    color = readColor();
    if (reduceMotion) draw();
  });

  window.addEventListener('resize', function () {
    resize();
    initParticles();
    if (reduceMotion) draw();
  });

  // 启动
  resize();
  initParticles();
  if (reduceMotion) {
    draw(); // 只画一帧静止粒子
  } else {
    step();
  }
})();