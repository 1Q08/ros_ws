#!/usr/bin/env python3
# 系统更新与清理脚本
# 要求以 root 权限运行（sudo）
"""
运行命令：
chmod +x system_update.py
sudo ./system_update.py
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """执行命令并打印描述"""
    print(f"\n=== {description} ===")
    try:
        subprocess.run(cmd, check=True, text=True)
        print(f"--- {description} 完成 ---")
    except subprocess.CalledProcessError as e:
        print(f"错误: {e}")
        sys.exit(1)

def main():
    # 检查是否以 root 运行
    if os.geteuid() != 0:
        print("此脚本需要 root 权限，请使用 sudo 运行。")
        sys.exit(1)

    print("开始系统维护...\n")

    # 定义要执行的命令和描述
    steps = [
        (["apt", "update"], "更新软件包列表"),
        (["apt", "upgrade", "-y"], "升级已安装的软件包"),
        (["apt", "autoremove", "-y"], "删除不再需要的依赖包"),
        (["apt", "autoclean", "-y"], "清理已下载的软件包缓存"),
    ]

    for cmd, desc in steps:
        run_command(cmd, desc)

    print("\n所有操作完成。")

if __name__ == "__main__":
    main()