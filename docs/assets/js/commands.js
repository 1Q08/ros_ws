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

// 全局数据存储
// 结构: { ros1: { core: {...}, topic: {...}, ... }, ros2: {...} }
let commandsData = null;

// ============================================================
// 初始化：页面加载完成后获取命令数据
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  fetch(window.COMMANDS_DATA_URL || 'assets/data/commands.json')
    .then(response => response.json())
    .then(data => {
      commandsData = data;
    })
    .catch(error => console.error('加载命令数据失败:', error));
});

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
  document.getElementById('category').innerHTML = '<option value="">-- 请选择 --</option>';
  document.getElementById('command').innerHTML = '<option value="">-- 请选择 --</option>';
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
  document.getElementById('command').innerHTML = '<option value="">-- 请选择 --</option>';
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
  document.getElementById('detailNotesContent').textContent = cmd.notes;

  detailDiv.style.display = 'block';
}

// ============================================================
// 实时搜索功能
// ============================================================
// 监听搜索框 input 事件，实时匹配命令名或中文描述
// 匹配结果以卡片列表形式显示在搜索框下方
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');

    // 清空关键词时清空结果
    if (!keyword) {
      resultsDiv.innerHTML = '';
      return;
    }

    const results = [];

    // 遍历所有版本（跳过 common，已删除）
    for (const version in commandsData) {
      if (version === 'common') continue;

      // 遍历该版本下的所有分类
      for (const category in commandsData[version]) {
        commandsData[version][category].commands.forEach(cmd => {
          // 匹配条件：命令名或中文描述包含关键词
          if (cmd.cmd.toLowerCase().includes(keyword) ||
              cmd.desc.toLowerCase().includes(keyword)) {
            results.push({
              version: version.toUpperCase(),      // ROS1 / ROS2
              category: commandsData[version][category].name,  // 中文分类名
              ...cmd  // 展开命令对象（cmd, desc, example, notes）
            });
          }
        });
      }
    }

    // 无匹配结果时显示提示
    if (results.length === 0) {
      resultsDiv.innerHTML = '<p class="no-results">未找到匹配的命令</p>';
      return;
    }

    // 渲染搜索结果列表
    let html = '<div class="results-list">';
    results.forEach((cmd, index) => {
      html += `
        <div class="result-item" onclick="showSearchResult(${index})">
          <span class="result-version">${cmd.version}</span>
          <span class="result-category">${cmd.category}</span>
          <code class="result-cmd">${cmd.cmd}</code>
          <span class="result-desc">${cmd.desc}</span>
        </div>
      `;
    });
    html += '</div>';

    resultsDiv.innerHTML = html;

    // 保存当前搜索结果，供点击时获取完整数据
    window.currentSearchResults = results;
  });
});

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
  detailDiv.innerHTML = `
    <div class="search-detail-header">
      <h3>${cmd.cmd}</h3>
      <button class="close-detail" onclick="closeSearchDetail()">×</button>
    </div>
    <p><strong>版本:</strong> ${cmd.version} / ${cmd.category}</p>
    <p><strong>说明:</strong> ${cmd.desc}</p>
    <p><strong>示例:</strong></p>
    <pre class="highlight-code"><code>${highlightCode(cmd.example)}</code></pre>
    <p><strong>注意事项:</strong></p>
    <pre>${cmd.notes}</pre>
  `;

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
// 代码关键字高亮
// ============================================================
// 对命令行文本做简单的关键字着色
// 匹配规则：
//   ros1 / ros2  →  橙黄色（品牌色）
//   后续可扩展更多关键字
// ============================================================
function highlightCode(text) {
  if (!text) return '';
  return text
    // 先转义 HTML 特殊字符，防止 <param> 等被当成标签
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // ros1 / ros2 橙黄色高亮（大小写不敏感）
    .replace(/\b(ros1|ros2)\b/gi, '<span class="hl-ros">$1</span>');
}
