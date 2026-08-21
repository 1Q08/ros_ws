---
layout: post
title: "ROS2 功能包：C++ 包与 Python 包的文件结构与内容介绍"
date: 2026-08-21 11:40:00 +0800
categories: ros2 tutorial
author: 老张同志
excerpt: "从零掌握 ROS2 功能包：分别介绍 C++ 功能包（ament_cmake）和 Python 功能包（ament_python）的目录结构、每个文件的用途与内容详解（CMakeLists.txt / setup.py / package.xml），以及创建、构建、运行的完整命令，附两类包对比总结表。"
---
# ROS2 功能包：C++ 包与 Python 包的文件结构与内容介绍

本文分别介绍 ROS2 中 **C++ 功能包**（`ament_cmake`）和 **Python 功能包**（`ament_python`）的目录结构、每个文件的用途，以及两者的区别。

> 环境：ROS2 Jazzy / Ubuntu，工作区：`~/ros_ws`（`src/` 下存放所有功能包源码）。

---

## 〇、总览：两类包的最简结构对比

| 文件/目录              | C++ 包（`ament_cmake`） | Python 包（`ament_python`） |
| ---------------------- | ----------------------- | --------------------------- |
| 包描述文件             | `package.xml`           | `package.xml`               |
| 构建配置               | `CMakeLists.txt`        | `setup.py` + `setup.cfg`    |
| 源码目录               | `src/` + `include/`     | `<包名>/`（同名包目录）     |
| 头文件（.hpp）         | `include/<包名>/`       | 无（Python 无需头文件）     |
| 节点可执行文件入口     | `add_executable()`      | `setup.py` 的 `console_scripts` |
| launch 文件            | `launch/`               | `launch/`                   |
| 参数/配置文件          | `config/`               | `config/`（或 `launch/`）   |
| 测试                   | `test/`                 | `test/`                     |
| 构建类型标识           | `package.xml` 里 `<build_type>ament_cmake</build_type>` | `package.xml` 里 `<build_type>ament_python</build_type>` |

> **一句话总结**：C++ 包用 `CMakeLists.txt` 编译成可执行文件；Python 包用 `setup.py` 把脚本注册为可执行入口点。两者都靠 `package.xml` 描述包信息和依赖。

---

## 一、Python 功能包（`ament_python`）

### 1.1 完整目录结构

以一个最小功能包 `my_package` 为例：

```
my_package/                      # 功能包根目录（与包名一致）
├── package.xml                  # 包描述文件：包名、版本、依赖、构建类型
├── setup.py                     # 打包配置：安装规则 + 可执行入口点
├── setup.cfg                    # 打包辅助配置（声明构建类型、脚本安装位置）
├── resource/
│   └── my_package               # 资源索引文件（内容为包名，供 ament 索引）
├── my_package/                  # 同名源码包目录（Python 源码都放这里）
│   ├── __init__.py              # 空文件，标记这是一个 Python 包
│   └── my_node.py               # 节点源码（入口点 main()）
├── launch/
│   └── mylaunch.launch.py       # launch 文件（可选）
└── test/                        # 测试目录（可选）
    ├── test_copyright.py
    ├── test_flake8.py
    └── test_pep257.py
```

### 1.2 各文件作用

| 文件 | 作用 |
| ---- | ---- |
| `package.xml` | 声明包名、版本、依赖、**构建类型 `ament_python`**。`ros2 pkg` 和 colcon 都靠它识别包。 |
| `setup.py` | **最关键**。声明 `data_files` 安装规则（把 package.xml、launch 文件装到 `share/` 下）和 `console_scripts`（把 `.py` 注册成可执行命令）。 |
| `setup.cfg` | 告知 setuptools 这是 `ament_python` 类型、脚本装到 `lib/<包名>` 下。 |
| `resource/<包名>` | 一个内容为包名的空文件，供 ament 资源索引定位包。 |
| `<包名>/` 目录 | Python 源码所在目录，里面的 `.py` 就是各节点程序。 |
| `__init__.py` | 空文件即可，标记该目录是 Python 包。 |
| `launch/` | 存放 `.launch.py`（需在 `setup.py` 里声明安装规则才能被 `ros2 launch` 找到）。 |
| `test/` | 单元测试（copyright/flake8/pep257 等，由模板自动生成）。 |

### 1.3 `setup.py` 详解

以 `my_package/setup.py` 为例（该文件含详细中文注释）：

```python
# ============================================================
# 文件作用：setup.py 是 ROS 2 Python 功能包（ament_python）的
# 构建配置文件，用于向 setuptools/colcon 声明包的元信息、依赖、
# 数据文件以及可执行入口（console_scripts）。
#   - colcon build 时据此生成可安装的 Python 包
#   - console_scripts 决定 ros2 run <包名> <节点名> 能运行哪些节点
#   - 与 package.xml 一起构成 Python 功能包的必要文件
# ============================================================
from setuptools import find_packages, setup
import os  # 拼接文件路径
from glob import glob  # 用通配符匹配 launch 文件

package_name = 'my_package'  # 包名：须与 src 目录名、package.xml 中的 <name> 一致

setup(
    name=package_name,                         # 包的安装名称（对应包名）
    version='1.1.0',                           # 版本号：遵循语义化版本（major.minor.patch）
    packages=find_packages(exclude=['test']),  # 自动发现要打包的 Python 子包，排除 test 目录
    data_files=[
        # 安装 ament 资源索引文件，用于 ros2 pkg 识别该包
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        # 安装 package.xml 到共享目录，供构建系统读取包元信息
        ('share/' + package_name, ['package.xml']),
        # 安装 launch 目录下的所有 launch 文件到 share/<包名>/launch/
        # 使 ros2 launch <包名> <launch文件名> 能通过包名找到 launch 文件
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
    ],
    install_requires=['setuptools'],         # 运行时依赖的 Python 包
    zip_safe=True,                           # 允许以 zip 形式打包（纯 Python 包可设为 True）
    maintainer='nvidia',                     # 维护者姓名
    maintainer_email='example@163.com',      # 维护者邮箱
    description='最小的 ROS 2 Python 功能包',  # 包的功能用途描述
    license='Apache License 2.0',            # 开源协议声明
    extras_require={                         # 额外依赖：仅安装 test 扩展时才装 pytest
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            # '可执行命令名' = '包名.脚本文件名:主函数名'
            'my_node = my_package.my_node:main'
        ],
    },
)
```

> **要点**：
> - `console_scripts` 决定你能用 `ros2 run my_package my_node` 运行什么。`= 左边` 是命令名，`右边` 是 `包名.文件名:函数`。
> - 不写 `data_files` 里 launch 的安装规则，`ros2 launch` 会报"文件找不到"。

### 1.4 `package.xml` 详解

```xml
<!--
  文件作用：package.xml 是 ROS 2 功能包（Package）的清单（Manifest）文件，
  用于声明包的基本信息（名称、版本、维护者、许可证）以及构建/运行/测试时
  的依赖关系，是 ament_python 构建系统识别和构建包的必需文件。

  - colcon 根据本文件判断包名、构建类型与依赖
  - ros2 pkg xml <包名> 可直接输出本文件内容
-->
<?xml version="1.0"?>
<package format="3">
  <!-- 包名：必须与 src 下的目录名一致，且全小写、下划线分隔 -->
  <name>my_package</name>
  <!-- 版本号：遵循语义化版本（major.minor.patch）规范 -->
  <version>1.1.0</version>
  <!-- 包的简要描述，用于说明该包的功能用途 -->
  <description>最小的 ROS 2 Python 功能包</description>
  <!-- 维护者：负责维护该包的人，email 属性必填 -->
  <maintainer email="example@163.com">nvidia</maintainer>
  <!-- 许可证：声明包的开源协议，如 Apache-2.0 / MIT / BSD-3-Clause -->
  <license>Apache License 2.0</license>

  <!-- 以下为测试阶段依赖（构建/运行不需要，仅跑测试时才用） -->
  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep257</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <!-- 构建类型：ament_python 表示这是一个 Python 功能包 -->
    <build_type>ament_python</build_type>
  </export>
</package>
```

### 1.5 创建、构建与运行

```bash
# 1. 创建 Python 功能包（模板自动生成上述所有文件）
cd ~/ros_ws/src
ros2 pkg create my_package --build-type ament_python --node-name my_node

# 2. 构建（必须回工作区根目录）
cd ~/ros_ws
colcon build --packages-select my_package

# 3. source 环境
source install/setup.bash

# 4. 运行节点
ros2 run my_package my_node

# 5. 运行 launch 文件（需要 setup.py 里有 launch 安装规则）
ros2 launch my_package mylaunch.launch.py
```

---

## 二、C++ 功能包（`ament_cmake`）

### 2.1 完整目录结构

以一个发布/订阅示例包 `cpp_pubsub` 为例：

```
cpp_pubsub/                         # 功能包根目录（与包名一致）
├── package.xml                     # 包描述文件：包名、版本、依赖、构建类型
├── CMakeLists.txt                  # 构建配置：编译、链接、安装（C++ 包的核心）
├── resource/
│   └── cpp_pubsub                  # 资源索引文件（内容为包名）
├── include/
│   └── cpp_pubsub/                 # 头文件目录（命名空间 = 包名）
│       └── publisher.hpp           # 发布者类声明（头文件）
├── src/
│   ├── publisher.cpp               # 发布者实现
│   ├── subscriber.cpp              # 订阅者实现
│   └── main.cpp                    # 主程序入口（调用类）
├── launch/
│   └── pubsub.launch.py            # launch 文件（可选，但很常用）
├── config/
│   └── params.yaml                 # 参数配置文件（可选）
└── test/                           # 测试目录（可选）
    ├── test_copyright.cmake
    └── test_cpplint.py
```

### 2.2 各文件作用

| 文件 | 作用 |
| ---- | ---- |
| `package.xml` | 声明包名、版本、依赖、**构建类型 `ament_cmake`**。 |
| `CMakeLists.txt` | **最关键**。`find_package()` 找依赖、`add_executable()` 编译源文件、`ament_target_dependencies()` 链接 ROS 依赖、`install()` 安装可执行文件和 launch 文件。 |
| `include/<包名>/` | 头文件（`.hpp`）目录，通常与包名同名、并用命名空间包裹。 |
| `src/` | 源文件（`.cpp`）目录，包含每个节点的实现和 `main()`。 |
| `resource/<包名>` | 内容为包名的空文件，供 ament 索引。 |
| `launch/` | launch 文件（需在 `CMakeLists.txt` 里 `install(DIRECTORY launch ...)`）。 |
| `config/` | 配置文件（如参数 YAML），需在 `CMakeLists.txt` 里 `install(DIRECTORY config ...)`。 |
| `test/` | 测试（copyright/cpplint 等模板文件）。 |

### 2.3 `CMakeLists.txt` 详解

```cmake
cmake_minimum_required(VERSION 3.8)
project(cpp_pubsub)                    # 项目名 = 包名

# 使用 C++17
if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()
set(CMAKE_CXX_STANDARD 17)

# 找依赖（rclcpp：C++ 的 ROS2 客户端库；std_msgs：标准消息）
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

# 编译发布者可执行文件：publisher 命令 <- src/publisher.cpp + main.cpp
add_executable(publisher src/publisher.cpp src/main.cpp)
# 链接 ROS 依赖（自动带上 include 路径）
ament_target_dependencies(publisher rclcpp std_msgs)

# 编译订阅者
add_executable(subscriber src/subscriber.cpp)
ament_target_dependencies(subscriber rclcpp std_msgs)

# 安装可执行文件（不装的话 ros2 run 找不到）
install(TARGETS
  publisher
  subscriber
  DESTINATION lib/${PROJECT_NAME}
)

# 安装 launch 目录（ros2 launch 才能找到）
install(DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)

# 安装 config 目录
install(DIRECTORY config
  DESTINATION share/${PROJECT_NAME}
)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

> **要点**：
> - **一个 `add_executable()` 对应一个可执行文件**，也就是 `ros2 run cpp_pubsub publisher` 里的 `publisher`。
> - `ament_target_dependencies()` 负责把 ROS 库的 include 路径、链接库都配好，必须为每个可执行文件调用。
> - `install()` 三件套：可执行文件 → `lib/`，launch/config → `share/`。漏掉任何一个，`ros2 run`/`ros2 launch` 都会报"找不到"。

### 2.4 `package.xml` 详解

```xml
<?xml version="1.0"?>
<package format="3">
  <name>cpp_pubsub</name>
  <version>1.1.0</version>
  <description>C++ 发布/订阅示例</description>
  <maintainer email="example@163.com">nvidia</maintainer>
  <license>Apache License 2.0</license>

  <!-- 编译时依赖 -->
  <buildtool_depend>ament_cmake</buildtool_depend>

  <!-- 运行时依赖 -->
  <exec_depend>rclcpp</exec_depend>
  <exec_depend>std_msgs</exec_depend>

  <!-- 测试依赖 -->
  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <!-- 构建类型：C++ 包必须写 ament_cmake -->
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

> **与 Python 包的差别**：C++ 包多了 `<buildtool_depend>ament_cmake</buildtool_depend>`（构建工具依赖），运行时依赖是 `rclcpp` 而不是 `rclpy`。

### 2.5 源码结构示例

头文件 `include/cpp_pubsub/publisher.hpp`：

```cpp
#ifndef CPP_PUBSUB__PUBLISHER_HPP_      // 防止重复包含
#define CPP_PUBSUB__PUBLISHER_HPP_

#include <rclcpp/rclcpp.hpp>
#include <std_msgs/msg/string.hpp>

namespace cpp_pubsub {                 // 命名空间与包名一致

class Publisher : public rclcpp::Node {
public:
  Publisher();                          // 构造函数：创建节点、话题、定时器

private:
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
  size_t count_;
};

}  // namespace cpp_pubsub

#endif  // CPP_PUBSUB__PUBLISHER_HPP_
```

源文件 `src/publisher.cpp`：

```cpp
#include "cpp_pubsub/publisher.hpp"

namespace cpp_pubsub {

Publisher::Publisher() : Node("publisher") {          // 节点名 publisher
  publisher_ = this->create_publisher<std_msgs::msg::String>("topic", 10);
  timer_ = this->create_wall_timer(
      std::chrono::seconds(1), [this]() {             // 每秒发布一次
        auto msg = std_msgs::msg::String();
        msg.data = "Hello, world! " + std::to_string(count_++);
        publisher_->publish(msg);
      });
}

}  // namespace cpp_pubsub
```

> **C++ 与 Python 的对应关系**：
> - 类的构造函数 `Node("publisher")` ≈ Python 的 `Node('publisher')`
> - `create_publisher` / `create_subscription` / `create_wall_timer` 的 API 与 Python 一一对应，只是写法从 Python 脚本变成了编译型 C++。

### 2.6 创建、构建与运行

```bash
# 1. 创建 C++ 功能包
cd ~/ros_ws/src
ros2 pkg create cpp_pubsub --build-type ament_cmake --node-name publisher

# 2. 构建（先装依赖的 ROS 库）
cd ~/ros_ws
colcon build --packages-select cpp_pubsub

# 3. source 环境
source install/setup.bash

# 4. 运行节点
ros2 run cpp_pubsub publisher

# 5. 运行 launch 文件（需要 CMakeLists.txt 里有 install 规则）
ros2 launch cpp_pubsub pubsub.launch.py
```

---

## 三、两类包的对比总结

| 对比项           | C++ 包（`ament_cmake`）                         | Python 包（`ament_python`）                  |
| ---------------- | ----------------------------------------------- | -------------------------------------------- |
| 构建工具         | CMake（`CMakeLists.txt`）                       | setuptools（`setup.py`）                     |
| 源码组织         | `src/*.cpp` + `include/<包名>/*.hpp`            | `<包名>/*.py`（同名包目录）                  |
| 可执行文件来源   | `add_executable()` 编译产物                     | `console_scripts` 入口点                     |
| ROS 客户端库     | `rclcpp`                                        | `rclpy`                                      |
| 需要编译         | 是（慢，但运行性能好）                          | 否（即改即用，无需重新构建）                 |
| `ros2 run` 依赖  | `install(TARGETS ...)`                          | `console_scripts`                            |
| launch 安装规则  | `install(DIRECTORY launch ...)`                 | `setup.py` 的 `data_files`                   |
| 适合场景         | 对性能/实时性要求高的底层驱动、控制器          | 快速原型、逻辑复杂、脚本化工具、launch 文件  |
| 调试速度         | 改动需重新 `colcon build`                       | 改完直接运行，无需构建                       |

---

## 四、快速参考：两个命令对比

```bash
# 创建 Python 包（带一个节点）
ros2 pkg create my_py_pkg --build-type ament_python --node-name my_node

# 创建 C++ 包（带一个节点）
ros2 pkg create my_cpp_pkg --build-type ament_cmake --node-name my_node
```

> **提醒**：`--node-name` 在 Python 包里会生成 `<包名>/<节点名>.py`，在 C++ 包里生成 `src/<节点名>.cpp`。创建完后记得：
> - Python 包：去 `setup.py` 加 launch 安装规则（如需要 launch 文件）
> - C++ 包：去 `CMakeLists.txt` 补 `install()` 三件套（如需要 launch/config 文件）
