#!/bin/bash

# =========================================
# 系统信息综合查询脚本
# 功能：显示 ROS1/2 版本、架构、Ubuntu 版本、磁盘使用
# 运行命令：./sysinfo.sh
# =========================================

# 颜色定义（用于美化输出）
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 标题
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

# 3. 内核版本（可选，但常一起显示）
KERNEL=$(uname -r)
echo -e "${YELLOW}内核版本:${NC} $KERNEL"

echo -e "${BLUE}------------------------------------------------${NC}"

# 4. ROS 版本检测
ROS_FOUND=false

# 检查 ROS1 (使用 rosversion)
if command -v rosversion &> /dev/null; then
    ROS1_VER=$(rosversion -d 2>/dev/null)
    if [ -n "$ROS1_VER" ]; then
        echo -e "${YELLOW}ROS 版本:${NC} ROS1 $ROS1_VER"
        ROS_FOUND=true
    fi
fi

# 如果没找到 ROS1，检查 ROS2
if [ "$ROS_FOUND" = false ] && command -v ros2 &> /dev/null; then
    ROS2_DISTRO=$(printenv ROS_DISTRO 2>/dev/null)
    if [ -n "$ROS2_DISTRO" ]; then
        echo -e "${YELLOW}ROS 版本:${NC} ROS2 $ROS2_DISTRO"
        ROS_FOUND=true
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
