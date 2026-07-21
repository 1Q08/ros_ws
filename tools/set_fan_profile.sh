#!/bin/bash

# ===================================================================
# 风扇配置切换脚本（nvfancontrol）
# 功能：将 /etc/nvfancontrol.conf 中的 FAN_DEFAULT_PROFILE 切换为
#       cool（散热优先）或 quiet（静音优先），并重启 nvfancontrol 服务。
# 用法：./set_fan_profile.sh [cool|quiet]
#       不带参数时进入交互式选择。
# ===================================================================

# 严格模式：未定义变量报错 + 管道中任一命令失败即视为失败
set -uo pipefail

# 颜色定义（用于美化输出）
RED='\033[0;31m'    # 红色
GREEN='\033[0;32m'  # 绿色
YELLOW='\033[0;33m' # 黄色
BLUE='\033[0;34m'   # 蓝色
NC='\033[0m'        # 无颜色

# 配置文件路径
CONFIG_FILE="/etc/nvfancontrol.conf"
BACKUP_FILE="/etc/nvfancontrol.conf.bak"

# 捕获 Ctrl+C，友好退出而非粗暴中断
trap 'echo -e "\n${YELLOW}已取消操作, 退出脚本${NC}"; exit 130' INT

# -------------------------------------------------------------------
# 公共函数
# -------------------------------------------------------------------

# 交互式获取风扇配置：只接受 cool / quiet，其他输入重新询问
get_profile() {
    local input
    while true; do
        # 提示写到 stderr，避免污染函数通过 stdout 返回的结果
        read -rp "$(echo -e "${YELLOW}请输入风扇配置 (cool 或 quiet): ${NC}")" input
        case "${input// /}" in  # 去除空格后匹配，防止误输空格
            cool|quiet) echo "${input// /}"; return 0 ;;
            *) echo -e "\n${RED}❗无效输入, 请输入 cool 或 quiet${NC}" >&2 ;;
        esac
    done
}

# -------------------------------------------------------------------
# 第一部分：处理参数与交互
# -------------------------------------------------------------------
if [ $# -gt 1 ]; then
    echo -e "${RED}❗错误: 参数过多${NC}"
    echo -e "${YELLOW}用法:${NC} $0 [cool|quiet]"
    exit 1
elif [ $# -eq 1 ]; then
    PROFILE="${1// /}"
    if [[ "$PROFILE" != "cool" && "$PROFILE" != "quiet" ]]; then
        echo -e "${RED}❗错误: 参数必须是 'cool' 或 'quiet'${NC}"
        echo -e "${YELLOW}用法:${NC} $0 [cool|quiet]"
        exit 1
    fi
else
    PROFILE="$(get_profile)"
fi

# -------------------------------------------------------------------
# 第二部分：权限检查（若非 root，自动用 sudo 重新执行自己）
# -------------------------------------------------------------------
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}需要 root 权限执行修改操作, 将自动使用 sudo 重新运行脚本 ...${NC}"
    # 使用绝对路径重新执行，避免 $0 为相对路径时 sudo 环境下解析失败
    exec sudo "$(readlink -f "$0")" "$PROFILE"
fi

# -------------------------------------------------------------------
# 第三部分：以下代码仅在 root 权限下执行
# -------------------------------------------------------------------
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❗错误: 配置文件 $CONFIG_FILE 不存在${NC}"
    exit 1
fi

# 确认目标行存在，避免 sed 静默无操作导致误判成功
if ! grep -q "^[[:space:]]*FAN_DEFAULT_PROFILE" "$CONFIG_FILE"; then
    echo -e "${RED}❗错误: 未在 $CONFIG_FILE 中找到 FAN_DEFAULT_PROFILE 配置项${NC}"
    exit 1
fi

# 备份逻辑（仅首次）
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}备份文件已存在 ($BACKUP_FILE), 跳过备份${NC}"
else
    if cp "$CONFIG_FILE" "$BACKUP_FILE"; then
        echo -e "${GREEN}✅已创建初始备份文件: $BACKUP_FILE${NC}"
    else
        echo -e "${RED}❗错误: 备份失败, 已中止以避免无备份修改${NC}"
        exit 1
    fi
fi

# 固定缩进：8 个空格
INDENT="        "

echo -e "${BLUE}------------------------------------------------${NC}"
echo -e "${YELLOW}--- 修改前的目标行 ---${NC}"
grep "^[[:space:]]*FAN_DEFAULT_PROFILE" "$CONFIG_FILE" | cat -A

# 执行替换
if ! sed -i "s/^[[:space:]]*FAN_DEFAULT_PROFILE[[:space:]]\+.*/${INDENT}FAN_DEFAULT_PROFILE $PROFILE/" "$CONFIG_FILE"; then
    echo -e "${RED}❗修改失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✅成功将 FAN_DEFAULT_PROFILE 修改为 '$PROFILE' (固定 8 空格缩进)${NC}"
echo -e "${YELLOW}--- 修改后的目标行 ---${NC}"
grep "^[[:space:]]*FAN_DEFAULT_PROFILE" "$CONFIG_FILE" | cat -A
echo -e "${BLUE}------------------------------------------------${NC}"

# -------------------------------------------------------------------
# 第四部分：重启服务
# -------------------------------------------------------------------
echo -e "${YELLOW}正在重启 nvfancontrol 服务 ...${NC}"
if command -v systemctl &>/dev/null; then
    if systemctl restart nvfancontrol; then
        echo -e "${GREEN}✅服务重启成功${NC}"
    else
        echo -e "${RED}❗警告: 服务重启失败, 请手动执行 systemctl restart nvfancontrol${NC}"
    fi
elif command -v service &>/dev/null; then
    if service nvfancontrol restart; then
        echo -e "${GREEN}✅服务重启成功${NC}"
    else
        echo -e "${RED}❗警告: 服务重启失败, 请手动执行 service nvfancontrol restart${NC}"
    fi
else
    echo -e "${RED}❗警告: 未找到服务管理命令, 请手动重启 nvfancontrol${NC}"
fi