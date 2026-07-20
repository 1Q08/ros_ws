#!/bin/bash

# ---------- 函数：获取用户输入 ----------
get_profile() {
    local input
    while true; do
        read -p "请输入风扇配置文件（cool 或 quiet）：" input
        case "$input" in
            cool|quiet) echo "$input"; return 0 ;;
            *) echo "无效输入，请输入 cool 或 quiet。" ;;
        esac
    done
}

# ---------- 处理参数与交互 ----------
if [ $# -eq 1 ]; then
    PROFILE="$1"
    if [[ "$PROFILE" != "cool" && "$PROFILE" != "quiet" ]]; then
        echo "错误: 参数必须是 'cool' 或 'quiet'"
        exit 1
    fi
else
    PROFILE=$(get_profile)
fi

CONFIG_FILE="/etc/nvfancontrol.conf"
BACKUP_FILE="/etc/nvfancontrol.conf.bak"

# ---------- 权限检查：若不是 root，自动用 sudo 重新执行自己 ----------
if [ "$EUID" -ne 0 ]; then
    echo "需要 root 权限执行修改操作，将自动使用 sudo 重新运行脚本..."
    exec sudo "$0" "$PROFILE"   # 将当前脚本和参数传给 sudo
    exit 0
fi

# ---------- 以下代码仅在 root 权限下执行 ----------
if [ ! -f "$CONFIG_FILE" ]; then
    echo "错误: 文件 $CONFIG_FILE 不存在"
    exit 1
fi

# 备份逻辑（仅首次）
if [ -f "$BACKUP_FILE" ]; then
    echo "备份文件已存在（$BACKUP_FILE），跳过备份。"
else
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo "已创建初始备份文件：$BACKUP_FILE"
fi

# 固定缩进：5 个空格
INDENT="     "
echo "使用固定缩进：5 个空格（cat -A 显示为：$(echo -n "$INDENT" | cat -A)）"

# 显示修改前
echo "--- 修改前的目标行 ---"
grep "^[[:space:]]*FAN_DEFAULT_PROFILE" "$CONFIG_FILE" | cat -A

# 执行替换
sed -i "s/^[[:space:]]*FAN_DEFAULT_PROFILE[[:space:]]\+.*/${INDENT}FAN_DEFAULT_PROFILE $PROFILE/" "$CONFIG_FILE"

if [ $? -eq 0 ]; then
    echo "成功将 FAN_DEFAULT_PROFILE 修改为 '$PROFILE'，并应用固定 5 空格缩进。"
    echo "--- 修改后的目标行 ---"
    grep "^[[:space:]]*FAN_DEFAULT_PROFILE" "$CONFIG_FILE" | cat -A
else
    echo "修改失败！"
    exit 1
fi

# 重启服务
echo "正在重启 nvfancontrol 服务..."
if command -v systemctl &>/dev/null; then
    systemctl restart nvfancontrol && echo "服务重启成功。" || echo "警告：服务重启失败，请手动执行。"
elif command -v service &>/dev/null; then
    service nvfancontrol restart && echo "服务重启成功。" || echo "警告：服务重启失败，请手动执行。"
else
    echo "警告：未找到服务管理命令，请手动重启 nvfancontrol。"
fi