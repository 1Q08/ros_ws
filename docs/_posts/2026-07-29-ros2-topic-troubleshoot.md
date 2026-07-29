---
layout: post
title: "如何排查 ROS2 话题不通的问题"
date: 2026-07-29 10:00:00 +0800
categories: ros2
---

在分布式机器人系统中，话题（topic）不通是最常见的问题之一。下面分享一套快速定位流程。

## 1. 确认双方在同一 ROS_DOMAIN_ID

```bash
export ROS_DOMAIN_ID=0
```

如果两台机器的 `ROS_DOMAIN_ID` 不同，它们互相看不到对方的节点。

## 2. 检查节点是否启动

```bash
ros2 node list
```

如果没有找到目标节点，说明节点根本没起来，先检查启动日志。

## 3. 检查话题是否存在

```bash
ros2 topic list
```

如果话题不存在，确认发布端是否正确声明了话题名称。

## 4. 检查数据类型是否匹配

```bash
ros2 topic info /chatter
```

发布者和订阅者的消息类型必须完全一致，否则无法建立连接。

## 5. 抓包验证

```bash
ros2 topic echo /chatter
```

如果能收到数据，说明链路正常，问题出在订阅端回调逻辑。

---

**小结**：按照“域 ID → 节点 → 话题 → 类型 → 数据”五步排查，90% 的问题都能快速定位。
