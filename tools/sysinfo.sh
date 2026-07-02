#!/bin/bash

# ===================================================================
# 系统信息综合查询脚本 + 软件安装助手（V2.2.0）
# 功能：显示系统信息，并提供常用软件安装选项以及系统更新与清理功能
#       1. rqt —— ROS 可视化工具
#       2. ubuntu-cleaner —— 系统垃圾清理工具
#       3. terminator —— 高级终端
#       4. 系统更新与清理
# 运行命令：./sysinfo.sh
# ===================================================================

# 颜色定义（用于美化输出，可自定义）
RED='\033[0;31m'  # 红色
GREEN='\033[0;32m'  # 绿色
YELLOW='\033[0;33m'  # 黄色
BLUE='\033[0;34m'  # 蓝色
NC='\033[0m'  # 无颜色

clear  # 清屏

# ===================================================================
# 第一部分：系统信息报告
# ===================================================================
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

# 4. ROS 版本检测（同时保存版本号到变量 local_ros_distro）
ROS_FOUND=false
local_ros_distro=""  # 保存检测到的版本，供后续安装使用

# 检查 ROS1 (使用 rosversion)
if command -v rosversion &> /dev/null; then
    ROS1_VER=$(rosversion -d 2>/dev/null)
    if [ -n "$ROS1_VER" ]; then
        echo -e "${YELLOW}ROS 版本:${NC} ROS1 $ROS1_VER"
        ROS_FOUND=true
        local_ros_distro="$ROS1_VER"
    fi
fi

# 如果没找到 ROS1，检查 ROS2
if [ "$ROS_FOUND" = false ] && command -v ros2 &> /dev/null; then
    ROS2_DISTRO=$(printenv ROS_DISTRO 2>/dev/null)
    if [ -n "$ROS2_DISTRO" ]; then
        echo -e "${YELLOW}ROS 版本:${NC} ROS2 $ROS2_DISTRO"
        ROS_FOUND=true
        local_ros_distro="$ROS2_DISTRO"
    fi
fi

if [ "$ROS_FOUND" = false ]; then
    echo -e "${RED}ROS 版本:${NC} 未安装"
fi

echo -e "${BLUE}------------------------------------------------${NC}"

# 5. 磁盘空间使用情况（根分区 /）
echo -e "${YELLOW}磁盘使用情况 (根分区 /):${NC}"
df -h / | awk 'NR==1 {print "文件系统    容量  已用  可用  已用%  挂载点"} NR==2 {print $1, $2, $3, $4, $5, $6}' | column -t

echo -e "${BLUE}================================================${NC}"

# ===================================================================
# 第二部分：软件安装菜单（循环，直到用户选择退出）
# ===================================================================
while true; do
    echo -e "\n${GREEN}可选软件安装：${NC}"
    echo "1. 安装 rqt (ROS 可视化工具)"
    echo "2. 安装 ubuntu-cleaner (系统垃圾清理工具)"
    echo "3. 安装 terminator (高级终端)"
    echo "4. 系统更新与清理"
    echo "0. 退出"

    read -p "请输入数字选择 (0 退出): " choice

    case $choice in
        1)
            if [ -z "$local_ros_distro" ]; then
                echo -e "${RED}错误: 未检测到 ROS 环境，无法安装 rqt！${NC}"
            else
                echo -e "${YELLOW}检测到 ROS 发行版: $local_ros_distro${NC}"
                echo "正在安装 rqt ..."
                sudo apt update
                sudo apt install -y ros-${local_ros_distro}-rqt ros-${local_ros_distro}-rqt-common-plugins
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}rqt 安装成功！${NC}"
                else
                    echo -e "${RED}rqt 安装失败，请检查网络或依赖！${NC}"
                fi
            fi
            ;;
        2)
            echo "正在安装 ubuntu-cleaner ..."
            sudo add-apt-repository -y ppa:gerardpuig/ppa
            sudo apt update
            sudo apt install -y ubuntu-cleaner
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}ubuntu-cleaner 安装成功！${NC}"
            else
                echo -e "${RED}ubuntu-cleaner 安装失败！${NC}"
            fi
            ;;
        3)
            echo "正在安装 terminator ..."
            sudo apt update
            sudo apt install -y terminator
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}terminator 安装成功！${NC}"
            else
                echo -e "${RED}terminator 安装失败！${NC}"
            fi
            ;;
        4)
            echo "正在执行系统更新与清理 ..."
            sudo apt update
            sudo apt upgrade -y
            sudo apt autoremove -y
            sudo apt autoclean -y
            echo -e "${GREEN}系统更新与清理完成！${NC}"
            ;;
        0)
            echo -e "${GREEN}退出。${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效输入，请输入 0-4 之间的数字${NC}"
            ;;
    esac

    echo -e "${BLUE}------------------------------------------------${NC}"
done