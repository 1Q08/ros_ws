---
layout: post
title: "ROS 多版本管理 —— 一台机器跑多个 ROS 的完整方案"
date: 2026-08-11 09:00:00 +0800
categories: ros2 tutorial
author: 老张同志
excerpt: "从环境变量冲突的本质讲起，对比「环境切换 / Docker 容器化 / Python 工具链隔离」三种多版本共存方案，附 ros1_bridge 互通与日常排查命令。"
---

# ROS 多版本管理 —— 一台机器跑多个 ROS 的完整方案

> **适用场景**：团队 / 个人同时维护 ROS1 与 ROS2 项目，或需要运行不同发行版（如 Humble 与 Jazzy）的 ROS2 项目，但只有一台开发机。

**核心结论先行**：

- **ROS1 与 ROS2 可以装在同一台机器上**，通过 `source` 不同的 setup 文件切换使用。
- **ROS2 不同发行版（Humble / Jazzy）不建议直接共存在宿主机**，推荐用 **Docker 容器** 隔离。
- 最干净、最可复现的通用方案是 **Docker + 容器化开发**，环境互不干扰，项目间一键切换。

---

## 目录

1. [为什么 ROS 版本会"打架"](#一为什么-ros-版本会打架)
2. [ROS 发行版与 Ubuntu 的对应关系](#二ros-发行版与-ubuntu-的对应关系)
3. [关键概念：ROS 环境变量体系](#三关键概念ros-环境变量体系)
4. [方案一：环境切换法（ROS1 + ROS2 共存）](#四方案一环境切换法ros1--ros2-共存)
5. [方案二：Docker 容器化（推荐，支持任意版本组合）](#五方案二docker-容器化推荐支持任意版本组合)
6. [方案三：Python 工具链隔离](#六方案三python-工具链隔离)
7. [ROS1 与 ROS2 互通：ros1_bridge](#七ros1-与-ros2-互通ros1_bridge)
8. [日常检查与排查命令](#八日常检查与排查命令)
9. [方案对比总结](#九方案对比总结)

---

## 一、为什么 ROS 版本会"打架"

ROS 通过**环境变量**来决定当前终端使用哪一套工具链和库。当你 `source` 一个发行版的 setup 文件时，实际修改了这些环境变量：

| 环境变量 | 作用 | 示例（Jazzy） |
| --- | --- | --- |
| `ROS_DISTRO` | 当前 ROS 发行版标识 | `jazzy` |
| `ROS_VERSION` | ROS 大版本号 | `2` |
| `AMENT_PREFIX_PATH` | ROS2 包查找路径 | `/opt/ros/jazzy` |
| `CMAKE_PREFIX_PATH` | 编译时依赖查找路径 | `/opt/ros/jazzy` |
| `PYTHONPATH` | Python 模块查找路径 | `/opt/ros/jazzy/lib/python3.12/site-packages` |
| `LD_LIBRARY_PATH` | 动态库查找路径 | `/opt/ros/jazzy/lib` |
| `PATH` | 可执行文件查找路径 | `/opt/ros/jazzy/bin` |
| `RMW_IMPLEMENTATION` | 中间件实现（ROS2） | `rmw_fastrtps_cpp` |

**冲突的本质**：

- 两个版本的 setup 文件**不能同时 source**，否则后面的会覆盖前面的 `PYTHONPATH` / `LD_LIBRARY_PATH` / `CMAKE_PREFIX_PATH`，导致找错库、找错包。
- ROS1（Noetic）是单进程架构；ROS2 是 DDS 分布式架构，两者通信协议完全不同。
- ROS2 各发行版的**系统级 Python 工具**（`colcon`、`rosdep`、`vcs`）通过 apt 安装在同一位置，Humble 和 Jazzy 会互相覆盖，这是它们难以在宿主机共存的直接原因。

---

## 二、ROS 发行版与 Ubuntu 的对应关系

| ROS 版本 | 类型 | 官方支持的系统 | Python |
| --- | --- | --- | --- |
| **Noetic** | ROS1 | Ubuntu 20.04 (Focal) | Python 3.8 |
| **Foxy** | ROS2 | Ubuntu 20.04 (Focal) | Python 3.8 |
| **Humble** | ROS2 LTS | Ubuntu 22.04 (Jammy) | Python 3.10 |
| **Iron** | ROS2 | Ubuntu 22.04 (Jammy) | Python 3.10 |
| **Jazzy** | ROS2 LTS | Ubuntu 24.04 (Noble) | Python 3.12 |

> **关键点**：每个 ROS 发行版与特定 Ubuntu 版本、特定 Python 版本强绑定。
> 一台宿主机的 Ubuntu 版本一旦固定，能直接通过 apt 安装的 ROS2 发行版基本只有一个。
> 想要运行其它发行版，要么**源码编译**（费时且易出问题），要么**用 Docker 跑对应系统的容器**（推荐）。

---

## 三、关键概念：ROS 环境变量体系

每个 ROS 环境都有各自的 `setup` 文件：

```text
/opt/ros/<distro>/setup.bash        # ROS1 和 ROS2 通用入口
/opt/ros/<distro>/local_setup.bash  # 当前工作空间安装的环境
```

切换到某个 ROS 版本，本质就是在终端里执行对应的 `source`。**不同终端相互独立**，因此：

- 终端 A source 了 Jazzy，终端 B source 了 Humble，两者互不影响。
- 同一终端内反复 source 不同版本，会残留/污染环境，建议**开新终端**再切换。

检查当前环境的黄金命令：

```bash
echo $ROS_DISTRO        # 显示当前发行版
printenv | grep -E 'ROS|AMENT|COLCON'   # 查看全部相关环境变量
```

---

## 四、方案一：环境切换法（ROS1 + ROS2 共存）

> 适用于 **ROS1 与 ROS2 在同一 Ubuntu 上共存**（例如 Ubuntu 20.04 同时装 Noetic 与 Foxy），
> 因为 ROS1 与 ROS2 的安装路径、工具链基本不重叠，可以真正装在同一台宿主机上。

### 4.1 安装

```bash
# 安装 ROS1 Noetic（Ubuntu 20.04）
sudo apt install ros-noetic-desktop

# 安装 ROS2 Foxy（Ubuntu 20.04，可与 Noetic 共存）
sudo apt install ros-foxy-desktop
```

> 注意：如果你在 Ubuntu 22.04/24.04 上想同时用 ROS1 与 ROS2，ROS1 Noetic 没有官方二进制包，
> 需要**源码编译**或使用容器，因此更推荐直接跳到 Docker 方案。

### 4.2 在 `.bashrc` 中配置快速切换

不要在 `.bashrc` 里同时 `source` 两个版本，而是定义切换函数，按需调用：

```bash
# 编辑 ~/.bashrc
cat >> ~/.bashrc <<'EOF'

# ===== ROS 版本切换 =====
export ROS_WS=~/ros_ws   # 你的工作空间路径

use_ros1() {
    # 若当前已 source 过 ROS2，建议开新终端或先执行 env -i bash
    source /opt/ros/noetic/setup.bash
    if [ -f "$ROS_WS/devel/setup.bash" ]; then
        source "$ROS_WS/devel/setup.bash"    # ROS1 使用 catkin 生成 devel
    fi
    echo ">>> 已切换到 ROS1 (Noetic)"
}

use_ros2() {
    source /opt/ros/foxy/setup.bash
    if [ -f "$ROS_WS/install/setup.bash" ]; then
        source "$ROS_WS/install/setup.bash"  # ROS2 使用 colcon 生成 install
    fi
    echo ">>> 已切换到 ROS2 (Foxy)"
}
EOF
source ~/.bashrc
```

### 4.3 使用方式

```bash
use_ros1 && roscore &            # 运行 ROS1 master
rosrun turtlesim turtlesim_node  # 运行 ROS1 节点

# ---------- 另开一个终端 ----------
use_ros2 && ros2 run turtlesim turtlesim_node   # 运行 ROS2 节点
```

### 4.4 重要注意事项

- **不要**同时 `source` ROS1 与 ROS2 的 setup 文件，`PYTHONPATH` / `LD_LIBRARY_PATH` 会互相污染。
- ROS1 命令（`rospack`、`rosrun`、`catkin_make`）与 ROS2 命令（`ros2`、`colcon`）分属不同工具链。
- 同一终端内切换版本后，最好 `echo $ROS_DISTRO` 确认，必要时直接开新终端。

---

## 五、方案二：Docker 容器化（推荐，支持任意版本组合）

> **为什么最推荐**：每个 ROS 发行版对应不同的 Ubuntu/Python，宿主机只能装一个；
> Docker 把"操作系统 + ROS 版本 + 依赖"整体打包，彻底解决所有冲突，且可复现、可分发。

### 5.1 常用官方镜像

| 需求 | 镜像 |
| --- | --- |
| ROS1 Noetic | `ros:noetic-ros-base` / `ros:noetic-ros-core` |
| ROS2 Humble | `osrf/ros:humble-desktop` / `osrf/ros:humble-ros-base` |
| ROS2 Jazzy | `osrf/ros:jazzy-desktop` / `osrf/ros:jazzy-ros-base` |
| ROS2 Foxy | `osrf/ros:foxy-desktop` |

### 5.2 基本运行命令（带 GUI 与共享目录）

```bash
# 允许 X11 转发（宿主机执行一次即可）
xhost +local:docker

# 运行 Humble 容器
docker run -it --rm \
  --name ros_humble \
  --network host \
  -e DISPLAY=$DISPLAY \
  -e LIBGL_ALWAYS_SOFTWARE=1 \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -v ~/humble_ws:/root/ws \        # 挂载项目目录
  -v /dev:/dev --privileged \      # 访问 USB / 串口等硬件（按需）
  osrf/ros:humble-desktop
```

> **GUI 透传说明**（详细方案见 **[5.5 运行仿真：图形界面（GUI）完整解决方案](#55-运行仿真图形界面gui完整解决方案)**）：
> - X11：`-e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix`
> - Wayland（新 Ubuntu）：`-e WAYLAND_DISPLAY=$WAYLAND_DISPLAY -v $XDG_RUNTIME_DIR:/tmp/runtime-$USER -e XDG_RUNTIME_DIR=/tmp/runtime-$USER`
> - 若 RViz/Gazebo 黑屏或闪退，加 `-e LIBGL_ALWAYS_SOFTWARE=1`（软件渲染）。

### 5.3 在容器内构建与运行

```bash
# 进入容器后（bash 交互）
source /opt/ros/humble/setup.bash
cd /root/ws
colcon build --symlink-install
source install/setup.bash
ros2 launch my_pkg my_launch.launch.py
```

### 5.4 用 docker-compose 管理多版本项目（推荐）

写一个 `docker-compose.yml`，为每个项目定义独立容器：

```yaml
version: "3.8"

services:
  humble:
    image: osrf/ros:humble-desktop
    container_name: ros_humble_dev
    network_mode: host
    environment:
      - DISPLAY=${DISPLAY}
      - LIBGL_ALWAYS_SOFTWARE=1
      - ROS_DOMAIN_ID=42
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix
      - ./humble_ws:/root/ws
    stdin_open: true
    tty: true

  jazzy:
    image: osrf/ros:jazzy-desktop
    container_name: ros_jazzy_dev
    network_mode: host
    environment:
      - DISPLAY=${DISPLAY}
      - ROS_DOMAIN_ID=43   # 不同域，避免与 humble 容器互相发现
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix
      - ./jazzy_ws:/root/ws
    stdin_open: true
    tty: true
```

```bash
docker compose up -d humble       # 启动 Humble 容器
docker compose up -d jazzy        # 启动 Jazzy 容器
docker exec -it ros_humble_dev bash
docker exec -it ros_jazzy_dev bash
```

> **Tips**：
> - 给不同版本容器设置不同的 `ROS_DOMAIN_ID`，避免两者 DDS 互相发现。
> - 用 `--network host` 便于容器内与宿主机/其它容器通信。

### 5.5 运行仿真：图形界面（GUI）完整解决方案

**核心问题**：容器默认是"无头"（headless）的，没有显示器。要运行 Gazebo / RViz / rqt 等仿真 GUI，必须把图形环境「透传」进容器。根据**宿主机是否有显示器**、**是否需要硬件加速**，分为以下四种方案。

#### 5.5.1 方案 A：X11 转发（本地开发机，最常用）

适用于宿主机**自带显示器**（桌面机 / 带屏的开发板）。原理：容器把窗口绘制请求转发给宿主机的 X Server 显示。

```bash
# ① 宿主机允许容器访问 X Server（每次重启后执行一次即可）
xhost +local:docker
# 更精确写法：xhost +local:root   （因为容器内用户通常是 root）

# ② 启动容器，带上 X11 透传参数
docker run -it --rm \
  --name ros_humble \
  --network host \
  -e DISPLAY=$DISPLAY \
  -e QT_X11_NO_MITSHM=1 \
  -e LIBGL_ALWAYS_SOFTWARE=1 \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -v ~/.Xauthority:/root/.Xauthority:rw \
  -v ~/humble_ws:/root/ws \
  osrf/ros:humble-desktop

# ③ 容器内启动仿真
source /opt/ros/humble/setup.bash
gazebo       # 或 ros2 launch <pkg> <launch>.launch.py
rviz2
```

**参数说明**：

| 参数 | 作用 |
| --- | --- |
| `-e DISPLAY=$DISPLAY` | 把宿主机的显示编号（如 `:0`）传进容器 |
| `-v /tmp/.X11-unix:/tmp/.X11-unix` | 共享 X Server 的 Unix socket |
| `-v ~/.Xauthority:/root/.Xauthority:rw` | 容器内以 root 运行需带授权文件，否则报 `No protocol specified` |
| `-e QT_X11_NO_MITSHM=1` | 解决 Qt 程序在容器内的共享内存报错 |
| `-e LIBGL_ALWAYS_SOFTWARE=1` | 软件渲染（mesa），无 GPU 驱动时防黑屏闪退（性能较差） |

#### 5.5.2 方案 B：VNC 无头方案（服务器 / 无显示器 / 远程访问）

适用于**没有显示器的服务器**，或需要**远程**看仿真画面的场景。思路：在容器内跑一个虚拟显示器（Xvfb）+ 轻量桌面 + VNC 服务，通过 VNC 客户端或浏览器访问。

**① 在 Dockerfile 中预装 GUI + VNC**（在基础 ROS 镜像上追加）：

```dockerfile
FROM osrf/ros:humble-desktop
RUN apt-get update && apt-get install -y \
      xvfb x11vnc fluxbox xterm \
      mesa-utils dbus-x11 \
    && mkdir -p /root/.vnc \
    && x11vnc -storepasswd 123456 /root/.vnc/passwd
ENV DISPLAY=:1
```

**② 启动容器并拉起 VNC 服务**：

```bash
docker run -it --rm \
  --name ros_humble_gui \
  -p 5900:5900 \
  -p 6080:6080 \
  osrf/ros:humble-desktop \
  bash -c "Xvfb :1 -screen 0 1600x900x24 & \
           fluxbox & \
           x11vnc -display :1 -forever -usepw -rfbport 5900 & \
           source /opt/ros/humble/setup.bash && \
           bash"
```

**③ 连接方式**（二选一）：

```text
方式一：VNC 客户端连接 <宿主机IP>:5900，密码 123456
方式二：容器内再装 noVNC，浏览器访问 http://<宿主机IP>:6080/vnc.html（无需客户端）
```

进入 VNC 桌面后，在里面打开终端执行 `gazebo` / `rviz2` 即可看到仿真画面。

#### 5.5.3 方案 C：Wayland 直通（新 Ubuntu 24.04+）

若宿主机登录时选择了 **Wayland 会话**：

```bash
docker run -it --rm \
  --network host \
  -e WAYLAND_DISPLAY=$WAYLAND_DISPLAY \
  -v $XDG_RUNTIME_DIR:/tmp/runtime-$USER \
  -e XDG_RUNTIME_DIR=/tmp/runtime-$USER \
  ...
```

> **实际经验**：多数 ROS 工具（Gazebo / RViz / Qt 应用）是 **X11 程序**，在 Wayland 下通常通过 **XWayland 兼容层**运行，所以绝大多数场景直接用 **方案 A 的 X11 转发**即可。Wayland 原生直通主要用于少数纯 Wayland 客户端，不必强求。

#### 5.5.4 方案 D：GPU 硬件加速（仿真流畅的关键）

Gazebo / RViz 是 3D 应用，`LIBGL_ALWAYS_SOFTWARE=1` 软件渲染会**非常卡**。要流畅仿真，必须把 GPU 透传给容器。

**① NVIDIA 独立显卡（x86 桌面机）**：

```bash
# 宿主机安装 NVIDIA Container Toolkit（一次）
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# 启动容器时加 --gpus 参数
docker run -it --rm --gpus all \
  --network host \
  -e DISPLAY=$DISPLAY \
  -e NVIDIA_DRIVER_CAPABILITIES=all \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  osrf/ros:humble-desktop
```

**② Jetson / ARM64 开发板（如你的设备）**：

Jetson 的 GPU 依赖专用驱动（不能直接用 `--gpus all`），必须使用 **NVIDIA L4T 基础镜像**：

```bash
# 使用 JetPack/L4T 官方 ROS 镜像（自带 GPU 与 CUDA 加速）
docker run -it --rm \
  --runtime nvidia \
  --network host \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -v /dev:/dev --privileged \
  nvcr.io/nvidia/l4t-ros:r35.4.1-ros2-humble-ros-base-l4t-r35.4.1
```

> **⚠️ ARM64 关键提示**（重点）：
> - 官方 `osrf/ros:*` 镜像**基本只有 amd64**。在 Jetson / 树莓派等 ARM64 机器上强行 `docker pull`，会提示 `platform does not match`，运行时走 qemu 模拟，**几乎不可用**。
> - 请改用 **NVIDIA L4T 镜像**，或自行基于 `ubuntu:22.04`（arm64）构建 —— **ROS2 官方 apt 源对 arm64 有原生二进制包**，在容器内 `apt install ros-humble-desktop` 是可行且流畅的。

#### 5.5.5 常见问题排查表

| 现象 | 原因 | 解决办法 |
| --- | --- | --- |
| `No protocol specified` | Xauthority 未正确挂载 | 加 `-v ~/.Xauthority:/root/.Xauthority:rw`，并执行 `xhost +local:docker` |
| `could not connect to display :0` | `DISPLAY` 未传或 X 未运行 | 检查 `-e DISPLAY`；宿主机先执行 `echo $DISPLAY` 确认值 |
| 黑屏 / 闪退 | 无 GPU 驱动，3D 渲染失败 | 加 `LIBGL_ALWAYS_SOFTWARE=1` 软件渲染，或按方案 D 透传 GPU |
| 窗口能开但非常卡 | 软件渲染吃 CPU | 使用方案 D 硬件加速；降低 Gazebo 分辨率/画质 |
| Qt 报共享内存错误 | 容器与宿主机 X 的 IPC 限制 | 加 `-e QT_X11_NO_MITSHM=1` |
| Gazebo 启动即崩溃 | 3D 上下文初始化失败 | `LIBGL_ALWAYS_SOFTWARE=1`，或 `gazebo --verbose` 查看具体报错 |

**一句话总结**：本地有屏 → **方案 A（X11）**；远程/无屏 → **方案 B（VNC）**；要流畅 → **方案 D（GPU）**；ARM 板子 → **必须用 L4T 或自建 arm64 镜像**。

---

## 六、方案三：Python 工具链隔离

如果你**坚持在宿主机源码编译多个 ROS2 发行版**（不推荐），至少要把构建工具隔离，
因为 `colcon`、`rosdep`、`vcs` 等 Python 工具安装路径是共享的。

### 6.1 用 pipx 或 venv 隔离工具链

```bash
# 方式 A：pipx（每个工具独立环境）
pipx install colcon-common-extensions
pipx install rosdep
pipx install vcstool

# 方式 B：虚拟环境（更可控）
python3 -m venv ~/ros_tools && source ~/ros_tools/bin/activate
pip install colcon-common-extensions rosdep vcstool
```

### 6.2 源码编译不同发行版

```bash
# 以 Humble 为例（需在 Ubuntu 22.04）
mkdir -p ~/humble_src && cd ~/humble_src
wget https://raw.githubusercontent.com/ros2/ros2/humble/ros2.repos
vcs import src < ros2.repos
rosdep init && rosdep update
rosdep install --from-paths src --ignore-src -r -y
colcon build --symlink-install
source install/setup.bash
```

> **注意**：源码编译不同发行版需要不同 Ubuntu/Python 环境，实际中极易因系统依赖冲突而失败，
> 多数情况下**不值得**。请优先考虑 Docker。

---

## 七、ROS1 与 ROS2 互通：ros1_bridge

当你需要让 ROS1 节点与 ROS2 节点在同一台机器上互相通信时，使用 `ros1_bridge`。

### 7.1 准备工作

- ROS1（如 Noetic）与 ROS2（如 Jazzy）分别装在**同一台宿主机或两个能互通的主机**上。
- 安装 bridge：

```bash
sudo apt install ros-jazzy-ros1-bridge
```

### 7.2 启动桥接

```bash
# 终端 1：启动 ROS1
source /opt/ros/noetic/setup.bash
roscore

# 终端 2：启动 ROS2 并运行 bridge（先 source ROS1 再 source ROS2）
source /opt/ros/noetic/setup.bash
source /opt/ros/jazzy/setup.bash
ros2 run ros1_bridge dynamic_bridge

# 终端 3：验证（ROS1 侧发布）
source /opt/ros/noetic/setup.bash
rostopic pub /chatter std_msgs/String "data: 'hello'" -r 1
```

```bash
# 终端 4：在 ROS2 侧订阅
source /opt/ros/jazzy/setup.bash
ros2 topic echo /chatter
```

> 前提：bridge 所在终端**先 source ROS1 再 source ROS2**，这样 bridge 能同时找到两套库。

---

## 八、日常检查与排查命令

```bash
# 查看当前 ROS 版本
echo $ROS_DISTRO

# 查看工作空间 / 环境前缀
printenv | grep -E 'ROS|AMENT|CMAKE_PREFIX_PATH|COLCON'

# 确认当前是 ROS1 还是 ROS2
echo $ROS_VERSION        # 1 或 2

# 环境被污染时的急救：开一个干净终端
env -i bash --noprofile --norc
source /opt/ros/jazzy/setup.bash

# Docker 中查看镜像 / 运行中的容器
docker images
docker ps -a
```

---

## 九、方案对比总结

| 方案 | 适用场景 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **环境切换（source）** | 宿主机 ROS1 + 同 Ubuntu 的 ROS2 | 零额外依赖、轻量 | 只能支持宿主机对应发行版；工具链可能冲突 |
| **Docker 容器化** ⭐ | 任意版本组合（Humble/Jazzy/Noetic…） | 完全隔离、可复现、易分发、支持 GUI/硬件 | 需学习 Docker；磁盘占用较大 |
| **Python 工具链隔离** | 源码编译多发行版的高级用户 | 保留宿主机原生编译体验 | 系统依赖冲突多、易踩坑 |

### 推荐实践路线

1. **日常开发**：优先 Docker，为每个项目写一个 `docker-compose.yml`，不同项目一键切换容器。
2. **宿主机 ROS1 + ROS2 共存**：用 `.bashrc` 切换函数（`use_ros1` / `use_ros2`），开新终端再切换。
3. **跨版本通信**：用 `ros1_bridge`（跨 ROS1/ROS2）、不同 `ROS_DOMAIN_ID` 隔离 ROS2 不同容器。
4. **CI / 团队协作**：把 Dockerfile 提交到仓库，任何人 `docker build` 都能得到一致环境。

---

*参考资料：ROS 官方文档 (docs.ros.org)、OSRF Docker Hub (hub.docker.com/r/osrf/ros)、ros1_bridge 官方教程。*
