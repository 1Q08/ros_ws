---
layout: post
title: "ROS2 发布者与订阅者 —— 用 Python 从零实现最小 Pub/Sub"
date: 2026-08-11 10:00:00 +0800
categories: ros2 tutorial
author: 老张同志
excerpt: "理解 ROS2 最基础的发布者/订阅者（Pub/Sub）通信模式，并用 Python 从零写出最小可运行的 talker 与 listener，附建包、构建、运行全流程。"
---

# ROS2 发布者与订阅者（Publisher & Subscriber）

> ROS2 中节点间通信最基础、最核心的模式就是 **发布者 / 订阅者（Pub/Sub）**。本文带你理解它的原理，并用 Python 从零写出一个最小可运行的发布者和订阅者。

---

## 一、什么是发布者与订阅者？

在 ROS2 中，一个可执行程序被称为 **节点（Node）**。节点之间通过 **话题（Topic）** 进行**异步**通信：

- **发布者（Publisher）**：向某个话题发送数据（消息）。
- **订阅者（Subscriber）**：从某个话题接收数据（消息）。

```mermaid
flowchart LR
    A[发布者节点<br/>talker] -->|"话题 /chatter<br/>std_msgs/String"| B[订阅者节点<br/>listener]
```

这种模式的几个关键特点：

| 特点 | 说明 |
|------|------|
| **解耦** | 发布者不关心谁在订阅，订阅者也不关心谁在发布，双方只通过话题名称和消息类型相连 |
| **一对多 / 多对一** | 一个话题可以有多个发布者、多个订阅者 |
| **异步** | 发布者发完即走，不等待订阅者处理完毕 |
| **无连接配置** | 节点无需互相知道对方的地址，由 DDS 中间件自动完成发现与传输 |

> 打个比方：**话题就像广播电台的频率，消息就像广播内容**。电台（发布者）只管播，听众（订阅者）打开对应频率就能收到，双方互不认识。

---

## 二、准备工作

本文基于 **ROS2 Jazzy + Python 3**，假设你的环境已经配置好：

```bash
# 检查 ROS2 是否可用
printenv ROS_DISTRO        # 应输出 jazzy

# 每次打开终端都要 source 环境（也可写入 ~/.bashrc）
source /opt/ros/jazzy/setup.bash
source ~/ros_ws/install/setup.bash
```

---

## 三、最小代码样例

下面是最精简的发布者 / 订阅者，使用标准库消息类型 `std_msgs/msg/String`，话题名为 `chatter`。

### 3.1 发布者 `minimal_publisher.py`

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class MinimalPublisher(Node):
    """每隔 0.5 秒向话题 chatter 发布一条字符串消息"""

    def __init__(self):
        super().__init__('minimal_publisher')          # 节点名称
        self.publisher_ = self.create_publisher(       # 创建发布者
            String,        # 消息类型
            'chatter',     # 话题名称
            10)            # 队列长度（缓存 10 条）
        self.timer = self.create_timer(0.5, self.timer_callback)  # 定时器
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'            # 填充消息内容
        self.publisher_.publish(msg)                   # 发布
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1


def main(args=None):
    rclpy.init(args=args)                 # 1. 初始化 rclpy
    node = MinimalPublisher()             # 2. 创建节点
    rclpy.spin(node)                      # 3. 让节点保持运行、处理回调
    node.destroy_node()                   # 4. 清理
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 3.2 订阅者 `minimal_subscriber.py`

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class MinimalSubscriber(Node):
    """订阅话题 chatter，每收到一条消息就打印出来"""

    def __init__(self):
        super().__init__('minimal_subscriber')         # 节点名称
        self.subscription = self.create_subscription(  # 创建订阅者
            String,                  # 消息类型
            'chatter',               # 话题名称
            self.listener_callback,  # 收到消息时调用的回调
            10)                      # 队列长度

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')


def main(args=None):
    rclpy.init(args=args)
    node = MinimalSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### 3.3 代码要点解读

| 代码 | 作用 |
|------|------|
| `rclpy.init()` | 初始化 ROS2 客户端库，**每个进程必须调用一次** |
| `Node('名称')` | 创建节点，节点名在整个 ROS 图中需唯一 |
| `create_publisher(Type, topic, qos)` | 创建发布者：消息类型 / 话题名 / 队列深度 |
| `create_subscription(Type, topic, cb, qos)` | 创建订阅者：收到消息后自动调用回调 |
| `create_timer(秒, 回调)` | 定时触发回调，实现周期性发布 |
| `rclpy.spin(node)` | 阻塞运行节点，持续处理消息与定时器回调 |
| `publish(msg)` | 把消息发送到话题上 |

> **队列长度（QoS 深度）**：订阅者处理较慢时，最多在本地缓存这么多条待处理消息，超出后丢弃最旧的。生产环境中应根据数据的重要程度合理设置。

---

## 四、完整过程（从包到运行）

### 第 1 步：创建功能包

在 `src/` 下用官方命令创建 Python 包（这里包名用 `py_pubsub` 演示，也可换成你自己的名字）：

```bash
cd ~/ros_ws/src
ros2 pkg create py_pubsub --build-type ament_python --node-name publisher
```

`--node-name publisher` 会自动生成 `py_pubsub/publisher.py` 并在 `setup.py` 中注册入口。

### 第 2 步：放置代码文件

把上面两段代码分别保存为：

```
src/py_pubsub/py_pubsub/publisher.py     # 发布者
src/py_pubsub/py_pubsub/subscriber.py    # 订阅者
```

（也可以直接使用官方样例生成的 `publisher_member_function.py` / `subscriber_member_function.py`，本文为你手写的是更精简的版本。）

### 第 3 步：配置 `setup.py`

编辑 `src/py_pubsub/setup.py`，在 `console_scripts` 中注册两个可执行入口：

```python
entry_points={
    'console_scripts': [
        'publisher = py_pubsub.publisher:main',
        'subscriber = py_pubsub.subscriber:main',
    ],
},
```

格式为：`命令名 = 模块路径:函数名`。这样构建后就能用 `ros2 run py_pubsub publisher` 直接启动。

### 第 4 步：确认 `package.xml` 依赖

确保 `package.xml` 里声明了 `rclpy` 和 `std_msgs`（`ros2 pkg create` 默认已带，可不用改）：

```xml
<exec_depend>rclpy</exec_depend>
<exec_depend>std_msgs</exec_depend>
```

### 第 5 步：构建

回到工作区根目录，构建这个包（**每次改代码后都要重新构建**）：

```bash
cd ~/ros_ws
colcon build --packages-select py_pubsub
source install/setup.bash
```

### 第 6 步：运行

开**两个终端**，分别运行发布者和订阅者：

```bash
# 终端 1：发布者
source /opt/ros/jazzy/setup.bash
source ~/ros_ws/install/setup.bash
ros2 run py_pubsub publisher
```

```bash
# 终端 2：订阅者
source /opt/ros/jazzy/setup.bash
source ~/ros_ws/install/setup.bash
ros2 run py_pubsub subscriber
```

### 第 7 步：验证结果

- **订阅者终端**会不断打印：`I heard: "Hello World: 0"`、`I heard: "Hello World: 1"`……
- 另开一个终端可以查看话题与节点信息：

```bash
ros2 topic list          # 查看所有话题，应包含 /chatter
ros2 topic echo /chatter # 实时打印话题上的消息
ros2 node list           # 查看节点：/minimal_publisher /minimal_subscriber
```

预期输出示例：

```text
$ ros2 topic echo /chatter
data: 'Hello World: 42'
---
data: 'Hello World: 43'
---
```

---

## 五、常见问题排查

| 现象 | 原因 / 解决 |
|------|------------|
| `ros2 run` 提示找不到包 | 没 source 工作区：`source ~/ros_ws/install/setup.bash` |
| `ros2 run` 提示找不到可执行文件 | `setup.py` 的 `console_scripts` 没注册，或改后没重新 `colcon build` |
| 订阅者收不到消息 | 话题名不一致（两边必须都是 `chatter`）；或节点处于不同 `ROS_DOMAIN_ID` |
| 改了代码但行为没变 | 忘记重新构建：`colcon build --packages-select py_pubsub` |

---

## 六、小结

- **发布者/订阅者**是 ROS2 最基础的异步通信模式，通过**话题 + 消息类型**解耦。
- 用 Python 只需掌握 `rclpy.init()`、`Node`、`create_publisher` / `create_subscription`、`rclpy.spin()` 五个关键点。
- 完整流程：**建包 → 写代码 → 注册入口 → 构建 → 运行**，每一步缺一不可。

掌握了 Pub/Sub，你就打通了 ROS2 程序间通信的大门，后面的服务（Service）、动作（Action）都是在此基础上的扩展。
