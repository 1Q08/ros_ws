#!/bin/bash

# ===================================================================
# 系统信息综合查询脚本 + 软件安装助手（V3.2.0）
# 功能：显示系统信息，并提供常用软件安装选项以及系统更新与清理功能
#       1. rqt —— ROS 可视化工具
#       2. plotjuggler —— ROS 数据可视化/绘图工具
#       3. ubuntu-cleaner —— 系统垃圾清理工具
#       4. terminator —— 高级终端
#       5. 系统更新与清理
#       6. VOFA+ 串口助手
# 运行命令：./sysinfo.sh
# ===================================================================

# 严格模式：未定义变量报错 + 管道中任一命令失败即视为失败
# 注意：交互式菜单脚本不启用 -e，避免单次 apt 失败导致整个脚本退出
set -uo pipefail

# 颜色定义（用于美化输出，可自定义）
RED='\033[0;31m'  # 红色
GREEN='\033[0;32m'  # 绿色
YELLOW='\033[0;33m'  # 黄色
BLUE='\033[0;34m'  # 蓝色
NC='\033[0m'  # 无颜色

# 捕获 Ctrl+C，友好退出而非粗暴中断
trap 'echo -e "\n${YELLOW}已取消操作, 退出脚本${NC}"; exit 130' INT

# -------------------------------------------------------------------
# 公共函数
# -------------------------------------------------------------------

# 严格的 y/N 输入询问函数
# 用法: if ask_yes_no "提示语"; then ...同意... else ...拒绝... fi
# 说明: 只接受 y/N，其他任何输入（含空输入）都会提示并重新询问
ask_yes_no() {
    local prompt="$1"
    local reply
    while true; do
        read -rp "$(echo -e "${YELLOW}${prompt} (y/N): ${NC}")" reply
        case "$reply" in
            [y]) return 0 ;;
            [N]) return 1 ;;
            *) echo -e "${RED}❗ 无效输入, 请输入 y 或 N${NC}" ;;
        esac
    done
}

# 通用软件包安装函数
# 用法: install_pkg "显示名称" 包名1 [包名2 ...]
# 说明: 确保先执行 sudo apt-get update，若失败则提示用户是否继续安装
install_pkg() {
    local desc="$1"
    shift
    echo "正在安装 ${desc} ..."
    # update 仅用于刷新缓存，失败时让用户选择是否继续安装
    if ! sudo apt-get update; then
        echo -e "${YELLOW}⚠️ apt-get update 出现警告${NC}"
        if ! ask_yes_no "是否使用现有缓存继续安装? (建议优先检查软件源配置)"; then
            echo -e "${YELLOW}已取消安装, 请检查软件源配置后重试${NC}"
            return 1
        fi
    fi
    if sudo apt-get install -y "$@"; then
        echo -e "${GREEN}✅ ${desc} 安装成功！${NC}"
        return 0
    else
        echo -e "${RED}❗ ${desc} 安装失败, 请检查网络或依赖${NC}"
        return 1
    fi
}

# 预检 sudo 权限，避免运行到一半才失败留下半成品状态
if ! sudo -v; then
    echo -e "${RED}❗ 错误: 当前用户无 sudo 权限，无法执行安装操作${NC}"
    exit 1
fi

# ===================================================================
# 第一部分：系统信息报告
# ===================================================================
clear  # 清屏
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}       系统信息报告 (System Info)${NC}"
echo -e "${BLUE}================================================${NC}"

# 1. Ubuntu 版本信息
if command -v lsb_release &> /dev/null; then
    OS_NAME=$(lsb_release -d | cut -f2)
    OS_CODENAME=$(lsb_release -c | cut -f2)
    echo -e "${YELLOW}操作系统:${NC} $OS_NAME ($OS_CODENAME)"
else
    echo -e "${YELLOW}操作系统:${NC} 未知 (lsb_release 未安装)"
fi

# 2. 系统架构
ARCH=$(uname -m)
echo -e "${YELLOW}系统架构:${NC} $ARCH"

# 3. 内核版本
KERNEL=$(uname -r)
echo -e "${YELLOW}内核版本:${NC} $KERNEL"

echo -e "${BLUE}------------------------------------------------${NC}"

# 4. ROS 版本检测（同时保存发行版名称到变量 local_ros_distro）
# 原理：ROS 环境被 source 后会导出 ROS_VERSION(1 或 2) 和 ROS_DISTRO(发行版名)，
#       通过这两个变量即可适配所有 ROS1/ROS2 发行版，无需逐个硬编码。
local_ros_distro="$(printenv ROS_DISTRO 2>/dev/null)"  # 发行版名称，供后续安装使用
ros_version="$(printenv ROS_VERSION 2>/dev/null)"      # ROS 主版本：1 或 2

if [ -n "$local_ros_distro" ] && [ -n "$ros_version" ]; then
    echo -e "${YELLOW}ROS 版本:${NC} ROS${ros_version} ${local_ros_distro}"
else
    echo -e "${RED}ROS 版本:${NC} 未安装（或未 source 环境）"
    echo -e "${YELLOW}提示:${NC} 若已安装 ROS, 请确保在运行此脚本前执行了 source /opt/ros/<ROS_DISTRO>/setup.bash"
    echo -e "${YELLOW}提示:${NC} 建议将 source 命令添加到 ~/.bashrc 中以自动加载 ROS 环境"
fi

echo -e "${BLUE}------------------------------------------------${NC}"

# 5. 磁盘空间使用情况（根分区 /）
echo -e "${YELLOW}磁盘使用情况 (根分区 /): ${NC}"
df -h / | awk 'NR==1 {print "文件系统    容量  已用  可用  已用%  挂载点"} NR==2 {print $1, $2, $3, $4, $5, $6}' | column -t

echo -e "${BLUE}================================================${NC}"

# ===================================================================
# 第二部分：软件安装菜单（循环，直到用户选择退出）
# ===================================================================
while true; do
    echo -e "\n${GREEN}可选软件安装: ${NC}"  # -e 选项可启用反斜杠转义
    echo "1. 安装 rqt (ROS 可视化工具)"
    echo "2. 安装 plotjuggler (ROS 数据可视化/绘图工具)"
    echo "3. 安装 ubuntu-cleaner (系统垃圾清理工具)"
    echo "4. 安装 terminator (高级终端)"
    echo "5. 系统更新与清理"
    echo "6. 安装 VOFA+ 串口助手 (网页下载)"
    echo "0. 退出"

    read -rp "请输入数字选择 (0 退出): " choice  # 获取用户输入并赋值给变量 choice

    case "${choice// /}" in  # 去除空格后匹配，防止误输空格
        1)
            clear  # 清屏
            if [ -z "$local_ros_distro" ]; then  # 检测环境变量是否为空，local_ros_distro 输出 ROS 的版本号
                echo -e "${RED}❗错误: 未检测到 ROS 环境, 无法安装 rqt❗${NC}"
            else
                echo -e "${YELLOW}检测到 ROS 发行版: ${local_ros_distro}${NC}"
                # 使用 ${local_ros_distro} 来根据检测到的 ROS 版本来安装对应的 rqt 包
                install_pkg "rqt" "ros-${local_ros_distro}-rqt" "ros-${local_ros_distro}-rqt-common-plugins"
            fi
            ;;
        2)
            clear  # 清屏
            if [ -z "$local_ros_distro" ]; then  # 未检测到 ROS 环境则无法确定发行版包名
                echo -e "${RED}❗错误: 未检测到 ROS 环境, 无法安装 plotjuggler❗${NC}"
            else
                echo -e "${YELLOW}检测到 ROS 发行版: ${local_ros_distro}${NC}"
                # 参考官方命令 sudo apt install ros-$ROS_DISTRO-plotjuggler-ros
                install_pkg "plotjuggler" "ros-${local_ros_distro}-plotjuggler-ros"
            fi
            ;;
        3)
            clear  # 清屏
            echo "正在安装 ubuntu-cleaner ..."
            # add-apt-repository 来自 software-properties-common，精简系统可能缺失
            if ! command -v add-apt-repository &>/dev/null; then
                sudo apt-get install -y software-properties-common
            fi
            # 添加 PPA；-n 表示不自动 update，避免失效源导致整体报错，随后由 install_pkg 刷新缓存
            if sudo add-apt-repository -y -n ppa:gerardpuig/ppa; then
                install_pkg "ubuntu-cleaner" ubuntu-cleaner
            else
                echo -e "${RED}❗ 添加 PPA 失败, 无法安装 ubuntu-cleaner❗${NC}"
            fi
            ;;
        4)
            clear  # 清屏
            install_pkg "terminator" terminator
            ;;
        5)
            clear  # 清屏
            echo "正在执行系统更新 ..."
            # update 失败（例如失效软件源）时让用户选择是否继续升级
            if ! sudo apt-get update; then
                echo -e "${YELLOW}⚠️  部分软件源刷新失败${NC}"
                if ! ask_yes_no "是否基于现有缓存继续升级? (建议优先检查软件源配置)"; then
                    echo -e "${YELLOW}已取消升级, 请检查软件源配置后重试${NC}"
                    echo -e "${BLUE}------------------------------------------${NC}"
                    continue
                fi
            fi
            if sudo apt-get upgrade -y; then
                echo -e "${GREEN}✅ 系统更新完成！${NC}"
            else
                echo -e "${RED}❗ 系统更新失败, 请检查网络或软件源❗${NC}"
            fi
            echo ""
            if ask_yes_no "是否继续执行清理?"; then
                echo "正在执行系统清理 ..."
                sudo apt-get autoremove -y  # 让用户确认是否继续执行清理操作
                sudo apt-get autoclean
                echo -e "${GREEN}✅ 系统清理完成！${NC}"
            else
                echo -e "${YELLOW}跳过清理步骤${NC}"
            fi
            ;;
        6)
            clear  # 清屏
            if [ -z "${DISPLAY:-}" ]; then  # 检查 $DISPLAY 变量是否为空，若为空则说明没有图形界面
                echo -e "${RED}❗未检测到图形界面 (DISPLAY 变量未设置)❗${NC}"
                echo -e "${RED}无法自动打开浏览器，请手动访问以下链接下载 VOFA+: ${GREEN}https://www.vofa.plus/${NC}"
                read -rp "按 Enter 键继续..." _
            elif ! command -v xdg-open &>/dev/null; then  # 图形界面存在但缺少 xdg-open
                echo -e "${YELLOW}未找到 xdg-open, 请手动访问: ${GREEN}https://www.vofa.plus/${NC}"
                read -rp "按 Enter 键继续..." _
            else
                echo "正在使用默认浏览器打开 VOFA+ 串口助手官网 ..."
                xdg-open https://www.vofa.plus/ 2>/dev/null &  # 忽略错误输出并且立马运行下一条命令
                echo -e "${GREEN}浏览器已打开, 请自行选择正确版本的 VOFA+ 串口助手下载安装${NC}"
                read -rp "按 Enter 键继续..." _
            fi
            ;;
        0)
            echo -e "${GREEN}退出${NC}"
            exit 0  # 终止脚本循环
            ;;
        *)  # * 可以匹配所有未被前面任何模式匹配到的输入
            echo -e "${RED}无效输入, 请输入 0-6 之间的数字${NC}"
            ;;
    esac

    echo -e "${BLUE}------------------------------------------------${NC}"
done