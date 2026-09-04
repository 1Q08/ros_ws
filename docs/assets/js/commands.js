// ============================================================
// 命令速查页脚本（commands.html 专属）
// ============================================================
// 功能：
//   1. 从 commands.json 加载命令数据库
//   2. 三级联动下拉框（版本 → 分类 → 命令）
//   3. 实时搜索命令
//   4. 命令详情展示 + 关键字高亮
// ============================================================
// 依赖：
//   window.COMMANDS_DATA_URL  - 由页面 HTML 注入的 JSON 数据地址（经
//                               relative_url 处理，兼容 GitHub Pages baseurl）
// ============================================================

// ============================================================
// 国际化文案：根据页面语言（<html lang>）选择
// ============================================================
const PAGE_LANG = (document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh';

const I18N = {
  zh: {
    selectPlaceholder: '-- 请选择 --',
    noResults: '未找到匹配的命令',
    totalCount: '共 {n} 条',
    copyTitle: '复制',
    copyAria: '复制代码',
    copied: '✓ 已复制',
    copyFailed: '复制失败',
    version: '版本',
    description: '说明',
    example: '示例',
    notes: '注意事项',
    options: '常用选项',
    optionFlag: '选项',
    optionDesc: '说明'
  },
  en: {
    selectPlaceholder: '-- Select --',
    noResults: 'No matching commands found',
    totalCount: '{n} total',
    copyTitle: 'Copy',
    copyAria: 'Copy code',
    copied: '✓ Copied',
    copyFailed: 'Copy failed',
    version: 'Version',
    description: 'Description',
    example: 'Example',
    notes: 'Notes',
    options: 'Common options',
    optionFlag: 'Option',
    optionDesc: 'Description'
  }
};

const T = I18N[PAGE_LANG];

// 全局数据存储
// 结构: { ros1: { core: {...}, topic: {...}, ... }, ros2: {...} }
let commandsData = null;

// 扁平化搜索索引（数据加载后构建一次，避免每次按键全量遍历 + 重复归一化）
// 元素: { versionKey, versionName, category, rawCmd, normCmd, rawDisplay,
//         normDisplay, rawDesc, normDesc, rawCat, normCat, cmd }
let searchIndex = [];

// ============================================================
// 初始化：页面加载完成后挂载全部交互（B3：合并为单一入口）
// ============================================================
function initApp() {
  setupSearch();
  initCopyButtons(document);

  fetch(window.COMMANDS_DATA_URL || 'assets/data/commands.json')
    .then(response => response.json())
    .then(data => {
      commandsData = data;
      buildSearchIndex();
      renderSummaryTable();
    })
    .catch(error => console.error('加载命令数据失败:', error));
}

document.addEventListener('DOMContentLoaded', initApp);

// ============================================================
// 三级联动下拉框 - 第一级：版本选择
// ============================================================
// 当用户选择 ROS 版本时触发
// 功能：重置下级选择 → 填充分类选项 → 显示分类下拉框
// ============================================================
function onVersionChange() {
  const version = document.getElementById('rosVersion').value;
  const categoryRow = document.getElementById('categoryRow');
  const commandRow = document.getElementById('commandRow');
  const detailDiv = document.getElementById('commandDetail');

  // 重置第二级和第三级下拉框
  document.getElementById('category').innerHTML = '<option value="">' + T.selectPlaceholder + '</option>';
  document.getElementById('command').innerHTML = '<option value="">' + T.selectPlaceholder + '</option>';
  commandRow.style.display = 'none';
  detailDiv.style.display = 'none';

  // 如果未选择版本，隐藏分类下拉框
  if (!version) {
    categoryRow.style.display = 'none';
    return;
  }

  // 根据选中版本，动态填充分类选项
  const categories = commandsData[version];
  const categorySelect = document.getElementById('category');

  for (const key in categories) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = categories[key].name;  // 显示中文分类名
    categorySelect.appendChild(option);
  }

  categoryRow.style.display = 'block';
}

// ============================================================
// 三级联动下拉框 - 第二级：分类选择
// ============================================================
// 当用户选择命令分类时触发
// 功能：重置命令选择 → 填充命令选项 → 显示命令下拉框
// ============================================================
function onCategoryChange() {
  const version = document.getElementById('rosVersion').value;
  const category = document.getElementById('category').value;
  const commandRow = document.getElementById('commandRow');
  const detailDiv = document.getElementById('commandDetail');

  // 重置第三级下拉框和详情区域
  document.getElementById('command').innerHTML = '<option value="">' + T.selectPlaceholder + '</option>';
  detailDiv.style.display = 'none';

  // 如果未选择分类，隐藏命令下拉框
  if (!category) {
    commandRow.style.display = 'none';
    return;
  }

  // 根据选中分类，动态填充命令选项
  const commands = commandsData[version][category].commands;
  const commandSelect = document.getElementById('command');

  commands.forEach((cmd, index) => {
    const option = document.createElement('option');
    option.value = index;  // 使用索引而非命令名，便于后续获取完整对象
    option.textContent = cmd.display || cmd.cmd;  // 优先使用 display 短名称
    commandSelect.appendChild(option);
  });

  commandRow.style.display = 'block';
}

// ============================================================
// 三级联动下拉框 - 第三级：命令选择
// ============================================================
// 当用户选择具体命令时触发
// 功能：获取选中命令的完整数据并显示详情
// ============================================================
function onCommandChange() {
  const version = document.getElementById('rosVersion').value;
  const category = document.getElementById('category').value;
  const cmdIndex = document.getElementById('command').value;
  const detailDiv = document.getElementById('commandDetail');

  // 未选择命令时隐藏详情
  if (cmdIndex === '') {
    detailDiv.style.display = 'none';
    return;
  }

  // 从数据中获取选中命令的完整对象
  const cmd = commandsData[version][category].commands[cmdIndex];

  // 填充详情区域各个字段
  document.getElementById('detailTitle').textContent = cmd.title || cmd.display || cmd.cmd;
  document.getElementById('detailCmd').innerHTML = highlightCode(cmd.cmd);
  document.getElementById('detailDesc').textContent = cmd.desc;
  document.getElementById('detailExample').innerHTML = highlightCode(cmd.example);

  // 注意事项：为空时隐藏整块（含标题），否则展示剩余文字
  const notesWrap = document.getElementById('detailNotes');
  const notesText = (cmd.notes || '').trim();
  if (notesWrap) notesWrap.style.display = notesText ? '' : 'none';
  document.getElementById('detailNotesContent').textContent = notesText;

  // 常用选项：来自独立 options 字段
  renderOptionsTable(cmd.options);

  detailDiv.style.display = 'block';
}

// ============================================================
// 命令速查表（折叠面板）
// ============================================================
// 功能：将 commands.json 中全部命令渲染为概览表
//       列：版本 / 分类 / 命令 / 说明
// 互动：点击表头按钮展开/折叠
// ============================================================

// 渲染速查表 + 更新命令总数徽标
function renderSummaryTable() {
  const tbody = document.getElementById('summaryTableBody');
  const count = document.getElementById('summaryCount');
  if (!tbody || !commandsData) return;

  const versionNames = { ros1: 'ROS 1', ros2: 'ROS 2' };
  let rows = '';
  let total = 0;

  for (const version of ['ros1', 'ros2']) {
    const categories = commandsData[version];
    if (!categories) continue;

    for (const key in categories) {
      const cat = categories[key];
      cat.commands.forEach(cmd => {
        total++;
        rows += `
          <tr>
            <td><span class="summary-version summary-version--${version}">${versionNames[version]}</span></td>
            <td>${cat.name}</td>
            <td><code>${highlightCode(cmd.cmd)}</code></td>
            <td>${escapeHtml(cmd.desc)}</td>
          </tr>
        `;
      });
    }
  }

  tbody.innerHTML = rows;
  if (count) count.textContent = total ? T.totalCount.replace('{n}', total) : '';
}

// 切换折叠面板展开/折叠状态
function toggleSummary() {
  const body = document.getElementById('summaryBody');
  const btn = document.getElementById('summaryToggle');
  if (!body) return;

  const isHidden = body.hidden;
  body.hidden = !isHidden;
  if (btn) btn.setAttribute('aria-expanded', String(isHidden));
}

// ============================================================
// 实时搜索功能
// ============================================================
// 监听搜索框 input 事件，实时匹配命令名或中文描述
// 匹配结果以卡片列表形式显示在搜索框下方
// ============================================================

// HTML 转义（C5）：搜索结果与详情中的描述字段不再裸拼 innerHTML
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 防抖（C6）：搜索输入触发频率降低，避免每次按键都全量遍历
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const args = arguments;
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
  };
}

// 归一化：去除空格、下划线、连字符、斜杠、标点等分隔符，便于模糊匹配
function normalizeSearch(s) {
  return String(s || '').toLowerCase().replace(/[\s_\-/<>:=[]{}.,'\"()|;]/g, '');
}

// 判断 needle 是否为 haystack 的子序列（字符按顺序出现即可）
function isSubsequence(needle, haystack) {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

// 构建扁平化搜索索引（数据加载后调用一次）
// 预计算各字段的小写原文与归一化文本，后续搜索无需重复处理
function buildSearchIndex() {
  const versionNames = { ros1: 'ROS 1', ros2: 'ROS 2' };
  const idx = [];

  for (const version in commandsData) {
    if (version !== 'ros1' && version !== 'ros2') continue;
    for (const category in commandsData[version]) {
      const catName = commandsData[version][category].name;
      commandsData[version][category].commands.forEach(function (cmd) {
        idx.push({
          versionKey: version,
          versionName: versionNames[version],
          category: catName,
          rawCmd: String(cmd.cmd || '').toLowerCase(),
          normCmd: normalizeSearch(cmd.cmd),
          rawDisplay: String(cmd.display || '').toLowerCase(),
          normDisplay: normalizeSearch(cmd.display),
          rawDesc: String(cmd.desc || '').toLowerCase(),
          normDesc: normalizeSearch(cmd.desc),
          rawCat: catName.toLowerCase(),
          normCat: normalizeSearch(catName),
          cmd: cmd
        });
      });
    }
  }

  searchIndex = idx;
}

// 基于预计算字段评分：精确包含 > 归一化包含 > 子序列，未命中返回 0
function scoreField(kwRaw, kwNorm, rawText, normText) {
  if (!rawText) return 0;
  if (rawText.includes(kwRaw)) return 100;
  if (!kwNorm || !normText) return 0;
  if (normText.includes(kwNorm)) return 80;
  if (isSubsequence(kwNorm, normText)) return 60 - Math.min(kwNorm.length, 20);
  return 0;
}

// 正则特殊字符转义
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 高亮命中片段：先转义 HTML，再对忽略大小写的关键词加 <mark> 标记
// 仅对“精确包含”命中做高亮；子序列/归一化命中因无法无损映射回原文，不做标记
function highlightText(text, keyword) {
  if (!text) return '';
  const esc = escapeHtml(text);
  if (!keyword) return esc;
  const kw = escapeHtml(keyword);
  if (!kw || esc.toLowerCase().indexOf(kw.toLowerCase()) === -1) return esc;
  return esc.replace(new RegExp(escapeRegExp(kw), 'gi'), '<mark>$&</mark>');
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce(function(e) {
    const keyword = e.target.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');

    // 清空关键词时清空结果
    if (!keyword) {
      resultsDiv.innerHTML = '';
      return;
    }

    const kwNorm = normalizeSearch(keyword);
    const results = [];

    // 遍历预建索引，对命令名、显示名、说明、分类名评分（字段已预计算，无需每次归一化）
    for (let i = 0; i < searchIndex.length; i++) {
      const entry = searchIndex[i];
      const score = Math.max(
        scoreField(keyword, kwNorm, entry.rawCmd, entry.normCmd),
        scoreField(keyword, kwNorm, entry.rawDisplay, entry.normDisplay),
        scoreField(keyword, kwNorm, entry.rawDesc, entry.normDesc),
        scoreField(keyword, kwNorm, entry.rawCat, entry.normCat)
      );
      if (score > 0) {
        results.push({
          versionKey: entry.versionKey,
          versionName: entry.versionName,
          category: entry.category,
          score: score,
          ...entry.cmd  // 展开命令对象（cmd, desc, example, notes）
        });
      }
    }

    // 按匹配质量降序排列，让更贴切的命令排在前列
    results.sort(function (a, b) { return b.score - a.score; });

    // 无匹配结果时显示提示
    if (results.length === 0) {
      resultsDiv.innerHTML = '<p class="no-results">' + escapeHtml(T.noResults) + '</p>';
      return;
    }

    // 渲染搜索结果列表（版本胶囊按 ros1/ros2 使用不同颜色）
    let html = '<div class="results-list">';
    results.forEach((cmd, index) => {
      html += `
        <div class="result-item" onclick="showSearchResult(${index})">
          <span class="result-version result-version--${cmd.versionKey}">${escapeHtml(cmd.versionName)}</span>
          <span class="result-category">${escapeHtml(cmd.category)}</span>
          <code class="result-cmd">${highlightText(cmd.cmd, keyword)}</code>
          <span class="result-desc">${highlightText(cmd.desc, keyword)}</span>
        </div>
      `;
    });
    html += '</div>';

    resultsDiv.innerHTML = html;

    // 保存当前搜索结果与关键词，供点击时获取完整数据与命中高亮
    window.currentSearchResults = results;
    window.currentSearchKeyword = keyword;
  }, 150));
}

// ============================================================
// 搜索结果显示详情（点击搜索结果后触发）
// ============================================================
// 在搜索栏下方动态创建/更新详情卡片
// 功能：显示选中命令的完整信息 + 关闭按钮
// ============================================================
function showSearchResult(index) {
  const cmd = window.currentSearchResults[index];
  const resultsDiv = document.getElementById('searchResults');

  // 首次点击时创建详情容器，后续点击复用
  let detailDiv = document.getElementById('searchDetail');
  if (!detailDiv) {
    detailDiv = document.createElement('div');
    detailDiv.id = 'searchDetail';
    detailDiv.className = 'search-detail';
    resultsDiv.appendChild(detailDiv);
  }

  // 填充详情内容（HTML 模板字符串）
  const opts = cmd.options || [];
  const notesBlock = (cmd.notes && cmd.notes.trim())
    ? '<p><strong>' + T.notes + ':</strong></p><pre>' + escapeHtml(cmd.notes) + '</pre>'
    : '';
  const optionsBlock = opts.length
    ? '<p><strong>' + T.options + ':</strong></p>' +
      '<table class="options-table">' +
      '<thead><tr><th>' + T.optionFlag + '</th><th>' + T.optionDesc + '</th></tr></thead>' +
      '<tbody>' +
      opts.map(function (o) {
        return '<tr><td class="opt-flag"><code>' + highlightCode(o.flag) + '</code></td>' +
               '<td class="opt-desc">' + escapeHtml(o.desc) + '</td></tr>';
      }).join('') +
      '</tbody></table>'
    : '';

  detailDiv.innerHTML = `
    <div class="search-detail-header">
      <h3>${escapeHtml(cmd.cmd)}</h3>
      <button class="close-detail" onclick="closeSearchDetail()">×</button>
    </div>
    <p><strong>${T.version}:</strong> ${escapeHtml(cmd.versionName)} / ${escapeHtml(cmd.category)}</p>
    <p><strong>${T.description}:</strong> ${highlightText(cmd.desc, window.currentSearchKeyword || '')}</p>
    <p><strong>${T.example}:</strong></p>
    <pre class="highlight-code"><code>${highlightCode(cmd.example)}</code></pre>
    ${notesBlock}
    ${optionsBlock}
  `;

  initCopyButtons(detailDiv);

  detailDiv.style.display = 'block';
  detailDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================
// 关闭搜索详情卡片
// ============================================================
function closeSearchDetail() {
  const detailDiv = document.getElementById('searchDetail');
  if (detailDiv) {
    detailDiv.style.display = 'none';
  }
}

// ============================================================
// 清除搜索（点击"清除"按钮时触发）
// ============================================================
// 功能：清空搜索框 + 清空结果列表 + 移除详情卡片
// ============================================================
function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  const detailDiv = document.getElementById('searchDetail');
  if (detailDiv) {
    detailDiv.remove();
  }
}

// ============================================================
// 渲染「常用选项」表格
// ============================================================
// 数据源为命令对象上的独立 options 字段：[{ flag, desc }, ...]
// 有选项时显示标题 + 表头 + 终端风格表格；无选项时隐藏整个板块
// ============================================================
function renderOptionsTable(options) {
  const wrap = document.getElementById('detailOptions');
  const title = document.getElementById('detailOptionsTitle');
  const head = document.getElementById('detailOptionsHead');
  const body = document.getElementById('detailOptionsBody');

  if (!wrap || !body) return;
  const hasOptions = options && options.length;
  wrap.style.display = hasOptions ? 'block' : 'none';
  if (!hasOptions) return;

  if (title) title.textContent = T.options + ':';

  if (head) {
    head.innerHTML = '<tr><th class="opt-flag">' + T.optionFlag + '</th>' +
                     '<th class="opt-desc">' + T.optionDesc + '</th></tr>';
  }

  body.innerHTML = options.map(function (o) {
    return '<tr><td class="opt-flag"><code>' + highlightCode(o.flag) + '</code></td>' +
           '<td class="opt-desc">' + escapeHtml(o.desc) + '</td></tr>';
  }).join('');
}

// ============================================================
// 代码关键字高亮
// ============================================================
// 对命令行文本做简单的关键字着色
// 匹配规则：
//   ros1 / ros2 以及 roscore/rosrun/roslaunch/rosnode/rosparam/rosservice/rostopic/rosbag
//   →  橙黄色（品牌色）
//   后续可扩展更多关键字
// ============================================================
function highlightCode(text) {
  if (!text) return '';
  return text
    // 先转义 HTML 特殊字符，防止 <param> 等被当成标签
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // ros1 / ros2 及 ROS1 子命令橙黄色高亮（大小写不敏感）
    .replace(/\b(ros1|ros2|roscore|rosrun|roslaunch|rosnode|rosparam|rosservice|rostopic|rosbag)\b/gi, '<span class="hl-ros">$1</span>');
}

// ============================================================
// 复制代码功能
// ============================================================
// 为代码块动态添加「复制」按钮，点击后把代码块纯文本复制到剪贴板
// 兼容性：优先 navigator.clipboard（https/localhost），失败降级 execCommand('copy')
// ============================================================

// 为 root 下所有 <pre class="highlight-code"> 注入复制按钮
function initCopyButtons(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('pre.highlight-code').forEach(addCopyButton);
}

// 给单个代码块添加复制按钮（重复调用会跳过）
function addCopyButton(pre) {
  if (!pre || pre.querySelector('.copy-btn')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-btn';
  btn.title = T.copyTitle;
  btn.setAttribute('aria-label', T.copyAria);
  // 复制图标（两个重叠矩形）
  btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" stroke-width="1.5"/></svg>';

  btn.addEventListener('click', function () {
    const codeEl = pre.querySelector('code');
    const text = (codeEl ? codeEl.textContent : pre.textContent) || '';

    copyToClipboard(text).then(function (ok) {
      const original = btn.innerHTML;
      btn.innerHTML = ok ? T.copied : T.copyFailed;
      btn.classList.toggle('copied', ok);
      setTimeout(function () {
        btn.innerHTML = original;
        btn.classList.remove('copied');
      }, 1500);
    });
  });

  pre.appendChild(btn);
}

// 复制文本到剪贴板：优先现代 API，失败降级 execCommand
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
      .then(function () { return true; })
      .catch(function () { return fallbackCopy(text); });
  }
  return Promise.resolve(fallbackCopy(text));
}

// 降级方案：隐藏 textarea + execCommand('copy')
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

// 复制按钮已统一在 initApp()（DOMContentLoaded）中初始化，
// 此处不再单独注册监听。
